# S01 — Inventario de fuentes para el manual

**Fecha de verificación:** 2026-09-30
**Regla:** una fuente oficial existente se enlaza o adapta; no se copia como
contenido nuevo sin un vacío comprobado.

## Clasificación de fuentes existentes

| Área                              | Fuente                                                                                                                                                                            | Clasificación    | Uso previsto                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Entrada al producto               | `apps/webapp/app/components/dashboard/checklist.tsx`                                                                                                                              | REUTILIZAR       | Punto de partida en la aplicación: primer activo, categoría, etiqueta, equipo, custodia y campo personalizado. |
| Inicio general                    | [Getting Started with Shelf](https://www.shelf.nu/knowledge-base/getting-started)                                                                                                 | ENLAZAR          | Referencia oficial para crear espacio, añadir activos, QR e invitar equipo.                                    |
| Activos y organización            | Artículos oficiales de Assets, categorías, etiquetas, ubicaciones y QR                                                                                                            | ENLAZAR          | Detalle por tarea desde los capítulos de inicio y operación.                                                   |
| Custodia                          | [Custody Feature for Long-Term Equipment Lend-Outs](https://www.shelf.nu/knowledge-base/custody-feature-for-long-term-equipment-lend-outs)                                        | ENLAZAR          | Concepto y operación de préstamos sin fecha de retorno.                                                        |
| Reservas                          | [Introduction to Bookings](https://www.shelf.nu/knowledge-base/introduction-to-bookings) y [How to Create a Booking](https://www.shelf.nu/knowledge-base/how-to-create-a-booking) | ENLAZAR          | Conceptos, creación, disponibilidad y estados de reservas.                                                     |
| Calendario                        | [Subscribe Your Calendar to Shelf Bookings](https://www.shelf.nu/knowledge-base/subscribe-your-calendar-to-shelf-bookings)                                                        | ENLAZAR          | Integración del calendario de reservas.                                                                        |
| Auditorías                        | [Run Your First Audit](https://www.shelf.nu/knowledge-base/run-your-first-audit)                                                                                                  | ENLAZAR          | Guía completa de auditoría física, incluida su disponibilidad por plan.                                        |
| Reportes                          | [Getting Started with Reports](https://www.shelf.nu/knowledge-base/getting-started-with-reports)                                                                                  | ENLAZAR          | Primer reporte, filtros, CSV/PDF, significado y límite de acceso.                                              |
| Roles y permisos                  | [User Roles and Their Permissions](https://www.shelf.nu/knowledge-base/user-roles-and-their-permissions)                                                                          | ENLAZAR          | Matriz canónica de Propietario, Administrador, Autoservicio y Base.                                            |
| Inventario avanzado               | `apps/docs/advanced-index/*.md`                                                                                                                                                   | ADAPTAR          | Reaprovechar sólo explicaciones orientadas a uso; excluir detalles de implementación.                          |
| Uso del índice avanzado           | [Availability View: Complete Guide](https://www.shelf.nu/knowledge-base/availability-view-complete-guide)                                                                         | ENLAZAR          | Disponibilidad y calendario dentro del índice avanzado.                                                        |
| Equipo y propiedad                | Enlaces de equipo y traspaso presentes en rutas de Settings                                                                                                                       | ENLAZAR          | Mantener la fuente oficial como referencia de permisos y traspaso.                                             |
| Recordatorios y campos            | Enlaces de ayuda en componentes de recordatorios y campos personalizados                                                                                                          | ENLAZAR          | Detalle de recordatorios y asociación de campos a categorías.                                                  |
| Documentación de desarrollo       | `README.md`, `apps/docs/index.md`, despliegue, Supabase, Docker y contribución                                                                                                    | FUERA_DE_ALCANCE | No son instrucciones para quienes usan la aplicación.                                                          |
| Configuración técnica y seguridad | `apps/docs/*.md` técnicos, guías de esquema, SSO técnico y scanner de desarrollo                                                                                                  | FUERA_DE_ALCANCE | Sólo pueden ser referencias internas de soporte, no capítulos de usuario.                                      |
| Orientación de esta instancia     | Ruta de inicio, glosario, qué hacer primero, diferencias por rol y enlaces curados                                                                                                | CREAR            | Vacío comprobado: no existe un manual integral y progresivo dentro del repositorio.                            |
| Capturas de la instancia          | Pantallas autenticadas ES/EN verificadas                                                                                                                                          | CREAR            | Se producirán en S05 sólo con sesión segura y rutas reales.                                                    |

## Hallazgos que fijan el alcance

- La base oficial declara 83 artículos repartidos entre inicio, activos,
  reservas/custodia, equipo, espacios, auditorías y resolución de problemas.
- El repositorio no contiene un manual integral de usuario; el material local
  es mayormente técnico, salvo el checklist y las guías parciales de índice
  avanzado.
- Los enlaces dentro de la aplicación ya dirigen a artículos oficiales para
  activos, categorías, equipo, custodia, recordatorios, códigos y campos.
- Reportes se reservan para Administrador y Propietario. Las rutas de menor permiso
  necesitan capítulos diferentes, no una versión recortada de administración.

## Contenido que requerirá material propio

| Capítulo propio                                | Motivo                                                                                                      | Captura propia                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Cómo elegir el recorrido según rol             | La base oficial explica permisos, pero no ofrece una portada de aprendizaje por perfil para esta instancia. | No al inicio; diagrama simple opcional.                             |
| Primera media hora                             | Une checklist, resultado esperado y enlaces oficiales sin repetir instrucciones detalladas.                 | Sí, inicio y checklist cuando haya sesión segura.                   |
| Mapa de navegación y glosario                  | Orienta los nombres locales de la interfaz en EN/ES.                                                        | Sí, sólo si el texto final depende de la pantalla real.             |
| Cuándo usar custodia, reserva, kit o auditoría | Ayuda a elegir una herramienta; enlaza luego al artículo canónico.                                          | No necesariamente.                                                  |
| Rutas de operación por rol                     | Evita que Base/Autoservicio intenten acciones administrativas.                                              | Sí, para controles visibles por rol si se publica dentro de la app. |
