# Bady's - Plataforma de Distribución de Agua Purificada (Frontend) 💧🚛

Frontend multiplataforma (Web y Móvil) desarrollado con **React Native**, **Expo SDK 57** y **Expo Router** para la gestión comercial, logística de distribución y control contable de la distribuidora **Bady's** (Tupiza, Potosí, Bolivia).

---

## 🚀 Módulos del Sistema

### 👑 Panel de Administrador (`/administrador`)
- **Dashboard Gerencial:** Métricas en tiempo real, resumen de ventas mensuales y actividad reciente.
- **Gestión de Pedidos y Asignaciones:** Asignación de choferes y vehículos a pedidos pendientes.
- **Control de Clientes y Sucursales:** Registro con integración de mapas geográficos interactivos.
- **Inventario y Productos:** Catálogo con fotografías, control de stock mínimo y reposición.
- **Flota de Vehículos:** Control de capacidades de carga y asignación a personal.
- **Control Contable de Deudas:** Registro de pagos a cuenta y cuentas por cobrar.
- **Arqueos y Cierres de Caja:** Auditoría de recaudación de choferes en efectivo y QR.
- **Módulo de Reportes Gerenciales (HU-47, HU-48, HU-49):**
  - Reporte comercial de ventas y pedidos por rango de fechas.
  - Reporte contable de cobranzas, arqueos y deudas.
  - Reporte de inventario y rotación de existencias.
  - Descarga nativa a **Microsoft Excel (.xlsx)** con columnas autoajustadas y generación de **PDFs corporativos** completos.

### 🚚 Panel de Distribuidor / Chofer (`/distribuidor`)
- **Ruta de Entregas:** Pedidos asignados con mapa satelital/híbrido interactivo y navegación GPS directa a Google Maps.
- **Gestión de Cobranzas:** Registro de cobros en efectivo o transferencias/QR.
- **Cierre de Caja:** Arqueo diario de recaudación al finalizar la jornada.

### 🛒 Portal de Cliente (`/cliente`)
- **Pedidos en Línea:** Creación ágil de pedidos de bidones y botellas con selección de sucursal.
- **Seguimiento en Tiempo Real:** Estado de entregas y confirmación de recepción.
- **Notificaciones:** Alertas modales ante ediciones de pedidos o motivos de devolución.
- **Historial de Pagos:** Estado de cuenta y saldos pendientes.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React Native / Expo (SDK 57)
- **Enrutamiento:** Expo Router (File-based Routing, SPA)
- **Lenguaje:** TypeScript
- **Estilos:** React Native StyleSheet con soporte para Modo Oscuro y Modo Claro
- **Mapas:** Componente interactivo multiplataforma (Web Leaflet/OSM y React Native Maps)
- **Reportes:** SheetJS (`xlsx`) para libros Excel binarios e impresión HTML paginada

---

## 🌐 Conexión al Backend

El frontend se conecta al backend oficial desplegado en Render:
- **API URL:** `https://badyback.onrender.com/api`
- **Configuración centralizada:** [`src/constants/api.ts`](./src/constants/api.ts)
- Permite sobreescritura dinámica mediante la variable de entorno `EXPO_PUBLIC_API_BASE`.

---

## 💻 Comandos de Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo (Expo):**
   ```bash
   npm start
   ```

3. **Ejecutar en la Web:**
   ```bash
   npm run web
   ```

4. **Compilar para producción Web (Static Site):**
   ```bash
   npm run build
   ```
   *Genera los bundles estáticos listos para desplegar en la carpeta `dist/`.*

---

## ☁️ Despliegue en Render (Static Site)

1. En Render, crea un nuevo **Static Site**.
2. Conecta este repositorio: `https://github.com/JMiguelPLl/BadyFrontend.git`
3. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. En la pestaña **Redirects/Rewrites**, agrega una regla:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
