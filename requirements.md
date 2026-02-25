# 📘 Documento de Requerimientos – Sistema Administrativo **Arte Textil**

## 1. Requerimientos Funcionales (RF)

---

## 🧩 Módulo RF-01 – Administración General

### 🔐 Roles

* **RF-01-001** Crear nuevos roles en el sistema.
* **RF-01-002** Visualizar el listado de roles registrados.
* **RF-01-003** Modificar roles existentes.
* **RF-01-004** Desactivar roles existentes.

### 👤 Usuarios

* **RF-01-005** Crear nuevos usuarios con cualquier tipo de rol.
* **RF-01-006** Visualizar el listado de usuarios registrados.
* **RF-01-007** Filtrar usuarios según su rol.
* **RF-01-008** Modificar usuarios existentes.
* **RF-01-009** Desactivar usuarios existentes.
* **RF-01-008 (Gerente)** Visualizar colaboradores de la empresa.

### 🏭 Proveedores

* **RF-01-010** Crear nuevos proveedores.
* **RF-01-011** Visualizar proveedores registrados.
* **RF-01-012** Modificar proveedores.
* **RF-01-013** Desactivar proveedores.

### 📦 Productos de Catálogo (Administración)

* **RF-01-014** Crear productos de catálogo.
* **RF-01-015** Visualizar productos del catálogo.
* **RF-01-016** Modificar productos del catálogo.
* **RF-01-017** Desactivar productos del catálogo.

---

## 🧑‍💼 Módulo RF-02 – Recursos Humanos

### ⏱️ Asistencia

* **RF-02-001** Visualizar asistencias de colaboradores.
* **RF-02-002** Modificar asistencias por fecha.
* **RF-02-003** Registrar check-in y check-out (colaborador).
* **RF-02-004** Visualizar asistencias (gerente).

### 🌴 Vacaciones

* **RF-02-005** Solicitar vacaciones.
* **RF-02-006** Aprobar o rechazar solicitudes de vacaciones.

### 💰 Planillas

* **RF-02-007** Recibir colilla de pago por correo electrónico.
* **RF-02-009** Aplicar ajustes a planillas (horas extra o rebajos).
* **RF-02-010** Notificar pago de planillas.
* **RF-02-010** Definir parámetros de cálculo de planillas.

---

## 📊 Módulo RF-03 – Inventario

* **RF-03-001** Visualizar inventario con información detallada.
* **RF-03-002** Registrar entradas y salidas de inventario.
* **RF-03-003** Consultar disponibilidad de materiales.
* **RF-03-004** Filtrar productos del inventario.
* **RF-03-005** Generar reportes de inventario.
* **RF-03-006** Recibir alertas por stock bajo.

---

## 🛍️ Módulo RF-04 – CMS y Promociones

### 🧾 CMS – Gestión de Productos

* **RF-04-001** Visualizar listado de productos.
* **RF-04-002** Crear categorías.
* **RF-04-003** Crear productos con imágenes, precio, stock y categoría.
* **RF-04-004** Modificar productos.
* **RF-04-005** Cambiar estado de visibilidad de productos.
* **RF-04-006** Filtrar productos en el CMS.

### 🎯 Promociones

* **RF-04-007** Visualizar promociones.
* **RF-04-008** Crear promociones.
* **RF-04-009** Modificar promociones.
* **RF-04-010** Activar o desactivar promociones.
* **RF-04-011** Eliminar promociones de forma lógica.

---

## 🛒 Módulo RF-05 – Catálogo (Cliente)

* **RF-05-001** Visualizar productos activos.
* **RF-05-002** Visualizar promociones con vigencia.
* **RF-05-003** Filtrar productos por categoría, precio o promoción.
* **RF-05-004** Ver disponibilidad de stock.
* **RF-05-005** Visualizar detalle ampliado del producto.
* **RF-05-006** Agregar productos al carrito.
* **RF-05-007** Modificar productos del carrito.
* **RF-05-008** Eliminar productos del carrito.
* **RF-05-009** Validar stock antes de agregar al carrito.
* **RF-05-010** Validar datos antes de enviar cotización.
* **RF-05-011** Enviar cotización por correo o WhatsApp.

---

## 📈 Módulo RF-06 – Predicción de Demanda

* **RF-06-001** Predecir demanda futura por producto y temporada.
* **RF-06-002** Generar gráficos y reportes de predicción.
* **RF-06-003** Filtrar resultados de predicción.

---

## 👥 Módulo RF-07 – Segmentación de Clientes

* **RF-07-001** Clasificar clientes (frecuentes, nuevos, inactivos).
* **RF-07-002** Filtrar segmentación de clientes.
* **RF-07-003** Actualizar segmentación automáticamente.

---

## 🚨 Módulo RF-08 – Alertas Automáticas

* **RF-08-001** Detectar anomalías y cotizaciones masivas y enviar alertas.

---

## 📦 Módulo RF-09 – Pedidos y Producción

### 📋 Gestión de Pedidos

* **RF-09-001** Registrar pedidos.
* **RF-09-002** Actualizar estado del pedido.
* **RF-09-003** Visualizar pedidos (gerente).
* **RF-09-004** Modificar pedidos.
* **RF-09-005** Cancelar pedidos de forma lógica.

### 🏭 Gestión de Producción

* **RF-09-006** Registrar progreso de producción.
* **RF-09-007** Visualizar etapa de producción.
* **RF-09-008** Recibir alertas por retrasos.
* **RF-09-009** Asignar tareas de producción.
* **RF-09-010** Generar reportes de producción.

---

## 📊 Módulo RF-10 – Dashboard

* **RF-10-001** Visualizar indicadores clave del negocio.
* **RF-10-002** Visualizar productividad por empleado o área.
* **RF-10-003** Visualizar alertas automáticas.
* **RF-10-004** Filtrar datos del dashboard.
* **RF-10-005** Actualización en tiempo real.

---

## 📑 Módulo RF-11 – Reportes

* **RF-11-001** Reportes de ventas.
* **RF-11-002** Reportes de productividad.
* **RF-11-003** Reportes de inventario.
* **RF-11-004** Comparativos mensuales.

---

## 2. Requerimientos No Funcionales (RQNF)

* **RQNF-001** Tiempo de respuesta < 3 segundos.
* **RQNF-002** Disponibilidad del sistema del 99%.
* **RQNF-003** Soporte para ≥ 50 usuarios concurrentes.
* **RQNF-004** Comunicación segura mediante HTTPS.
* **RQNF-005** Contraseñas cifradas (bcrypt o SHA-256).
* **RQNF-006** Copias de seguridad automáticas diarias.
* **RQNF-007** Interfaz intuitiva, responsiva y accesible.
* **RQNF-008** Cumplimiento de normas ISO/IEC 25000, 9126, 9001, 15504.
* **RQNF-009** Código limpio, documentado y versionado con GitHub.
* **RQNF-010** Portabilidad en Linux (Apache o Nginx).
* **RQNF-011** Registro de logs de eventos críticos.
* **RQNF-012** Arquitectura modular y escalable.
* **RQNF-013** Mensajes de error claros y amigables.
* **RQNF-014** Carga de vistas < 5 segundos.
* **RQNF-015** Base de datos normalizada hasta 3FN
