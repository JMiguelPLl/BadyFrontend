import { listarPedidos } from "./asignacionPedidoService";
import { listarDeudas } from "./pagoAdminService";
import { listarHistorialCierresAdmin } from "./cierreCajaAdminService";

export type TipoNotificacionAdmin = "pedido" | "pago" | "caja";

export interface NotificacionAdmin {
  id: string;
  tipo: TipoNotificacionAdmin;
  titulo: string;
  descripcion: string;
  detalle?: string;
  ruta: string;
  timestamp: number;
}

type Listener = (notificacion: NotificacionAdmin) => void;

class NotificacionesAdminManager {
  private listeners: Listener[] = [];
  private intervalo: any = null;
  private iniciado = false;

  private ultimoPedidoId = 0;
  private ultimoCierreId = 0;
  private deudasConocidas = new Map<number, number>(); // idPedido -> cantidadPagos / totalPagado

  public suscribir(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public emitir(notificacion: NotificacionAdmin) {
    this.listeners.forEach((listener) => {
      try {
        listener(notificacion);
      } catch (e) {
        console.error("Error en listener de notificacion:", e);
      }
    });
  }

  public iniciarMonitoreo() {
    if (this.iniciado) return;
    this.iniciado = true;

    // Carga inicial de estado base
    this.verificarNovedades(true);

    // Monitoreo periódico cada 9 segundos
    this.intervalo = setInterval(() => {
      this.verificarNovedades(false);
    }, 9000);
  }

  public detenerMonitoreo() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.iniciado = false;
  }

  private async verificarNovedades(esInicial: boolean) {
    try {
      await Promise.all([
        this.verificarPedidos(esInicial),
        this.verificarPagos(esInicial),
        this.verificarCierresCaja(esInicial),
      ]);
    } catch (e) {
      // Silenciar errores de red en segundo plano
    }
  }

  private async verificarPedidos(esInicial: boolean) {
    try {
      const pedidos = await listarPedidos();
      if (!Array.isArray(pedidos) || pedidos.length === 0) return;

      const maxId = Math.max(...pedidos.map((p) => p.id));

      if (esInicial) {
        this.ultimoPedidoId = maxId;
        return;
      }

      if (maxId > this.ultimoPedidoId) {
        const nuevos = pedidos.filter((p) => p.id > this.ultimoPedidoId);
        this.ultimoPedidoId = maxId;

        nuevos.forEach((p) => {
          this.emitir({
            id: `pedido-${p.id}-${Date.now()}`,
            tipo: "pedido",
            titulo: "¡Tienes un nuevo pedido!",
            descripcion: `Pedido #${p.id} recibido de ${p.cliente || "Cliente"}`,
            detalle: `Total: Bs ${p.total.toFixed(2)} · ${p.sucursal || "Sucursal"}`,
            ruta: "/administrador/asignacion-pedidos",
            timestamp: Date.now(),
          });
        });
      }
    } catch {}
  }

  private async verificarPagos(esInicial: boolean) {
    try {
      const deudas = await listarDeudas();
      if (!Array.isArray(deudas) || deudas.length === 0) return;

      if (esInicial) {
        deudas.forEach((d) => {
          this.deudasConocidas.set(d.idPedido, d.cantidadPagos || 0);
        });
        return;
      }

      deudas.forEach((d) => {
        const cantidadAnterior = this.deudasConocidas.get(d.idPedido) ?? 0;
        const cantidadActual = d.cantidadPagos || 0;

        if (cantidadActual > cantidadAnterior) {
          this.deudasConocidas.set(d.idPedido, cantidadActual);

          this.emitir({
            id: `pago-${d.idPedido}-${Date.now()}`,
            tipo: "pago",
            titulo: "¡Nuevo pago registrado!",
            descripcion: `Cobro recibido en Pedido #${d.idPedido} (${d.cliente})`,
            detalle: `Total pagado: Bs ${d.totalPagado.toFixed(2)} · Saldo: Bs ${d.saldoPendiente.toFixed(2)}`,
            ruta: "/administrador/pagos",
            timestamp: Date.now(),
          });
        }
      });
    } catch {}
  }

  private async verificarCierresCaja(esInicial: boolean) {
    try {
      const cierres = await listarHistorialCierresAdmin();
      if (!Array.isArray(cierres) || cierres.length === 0) return;

      const maxId = Math.max(...cierres.map((c) => c.id));

      if (esInicial) {
        this.ultimoCierreId = maxId;
        return;
      }

      if (maxId > this.ultimoCierreId) {
        const nuevos = cierres.filter((c) => c.id > this.ultimoCierreId);
        this.ultimoCierreId = maxId;

        nuevos.forEach((c) => {
          const esCerrada = c.estado === "Cerrada";
          this.emitir({
            id: `caja-${c.id}-${Date.now()}`,
            tipo: "caja",
            titulo: esCerrada ? "¡Cierre de caja registrado!" : "¡Nueva caja abierta!",
            descripcion: `Caja #${c.id} de ${c.usuario || "Distribuidor"} (${c.estado})`,
            detalle: `Recaudación: Bs ${c.totalRecaudado.toFixed(2)} (Efectivo: Bs ${c.totalEfectivo.toFixed(2)} · QR: Bs ${c.totalQR.toFixed(2)})`,
            ruta: "/administrador/cierres-caja",
            timestamp: Date.now(),
          });
        });
      }
    } catch {}
  }
}

export const notificacionesAdminService = new NotificacionesAdminManager();
