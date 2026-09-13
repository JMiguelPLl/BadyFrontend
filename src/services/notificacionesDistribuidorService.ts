import { listarMisPedidos } from "./distribuidorService";
import { PedidoDistribuidor } from "../types/distribuidor";

export interface NotificacionPedidoAsignado {
  id: string;
  idAsignacionPedido: number;
  idPedido: number;
  cliente: string;
  sucursal: string;
  total: number;
  ruta: string;
  timestamp: number;
}

type Listener = (notificacion: NotificacionPedidoAsignado) => void;

class NotificacionesDistribuidorManager {
  private listeners: Listener[] = [];
  private intervalo: any = null;
  private iniciado = false;
  private asignacionesConocidas = new Set<number>();

  public suscribir(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public emitir(notificacion: NotificacionPedidoAsignado) {
    this.listeners.forEach((listener) => {
      try {
        listener(notificacion);
      } catch (e) {
        console.error("Error en listener de notificacion distribuidor:", e);
      }
    });
  }

  public iniciarMonitoreo() {
    if (this.iniciado) return;
    this.iniciado = true;

    // Carga inicial
    this.verificarAsignaciones(true);

    // Monitoreo continuo cada 9 segundos
    this.intervalo = setInterval(() => {
      this.verificarAsignaciones(false);
    }, 9000);
  }

  public detenerMonitoreo() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.iniciado = false;
  }

  private async verificarAsignaciones(esInicial: boolean) {
    try {
      const pedidos: PedidoDistribuidor[] = await listarMisPedidos();
      if (!Array.isArray(pedidos)) return;

      if (esInicial) {
        pedidos.forEach((p) => {
          this.asignacionesConocidas.add(p.idAsignacionPedido);
        });
        return;
      }

      // Detectar si hay pedidos nuevos asignados
      pedidos.forEach((p) => {
        if (!this.asignacionesConocidas.has(p.idAsignacionPedido)) {
          this.asignacionesConocidas.add(p.idAsignacionPedido);

          this.emitir({
            id: `asig-${p.idAsignacionPedido}-${Date.now()}`,
            idAsignacionPedido: p.idAsignacionPedido,
            idPedido: p.idPedido,
            cliente: p.cliente || "Cliente",
            sucursal: p.sucursal || "Central",
            total: Number((p as any).totalPedido ?? p.total ?? 0),
            ruta: "/distribuidor",
            timestamp: Date.now(),
          });
        }
      });
    } catch {
      // Silenciar errores de conexión en segundo plano
    }
  }
}

export const notificacionesDistribuidorService = new NotificacionesDistribuidorManager();
