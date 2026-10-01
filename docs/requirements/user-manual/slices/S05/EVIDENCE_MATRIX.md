# S05 — Matriz ejecutable de evidencia editorial y visual

## Estado de esta matriz

**CIERRE DOCUMENTAL COMPLETADO.** M20 está verificado sin autenticación.
M01–M19 se conservan como validación visual opcional y diferida; no bloquean la
entrega Markdown. Sus campos permanecen como **PENDIENTE** porque no existe
evidencia autenticada y no deben interpretarse como ejecutados.

| ID  | Ruta exacta / función                                    | Rol           | Idioma  | Precondición                                                     | Resultado esperado                                                                               | Resultado real                                                     | PASS/FAIL | Evidencia                                                                 | Fecha      |
| --- | -------------------------------------------------------- | ------------- | ------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------- | ---------- |
| M01 | `/home` — checklist inicial                              | Propietario   | ES      | Espacio de prueba con cuenta Propietario; sin datos de terceros. | El checklist y sus enlaces coinciden con `01-primeros-pasos.md`.                                 | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M02 | `/home` — checklist inicial                              | Propietario   | EN      | M01 con idioma inglés seleccionado.                              | La interfaz equivalente está en EN; no invalida la edición inicial ES del manual.                | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M03 | `/assets` y `/assets/new` — crear, buscar y editar       | Administrador | ES      | Cuenta Administrador y activo de prueba.                         | Existen las acciones descritas; búsqueda y edición no exponen datos ajenos.                      | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M04 | `/assets` — consulta y solicitud propia                  | Base          | ES      | Cuenta Base y activo de prueba visible.                          | No aparecen reportes, configuración ni check-in/out como acciones propias.                       | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M05 | `/assets` — custodia y reserva propia                    | Autoservicio  | ES      | Cuenta Autoservicio y activo de prueba visible.                  | Sólo se muestran las acciones propias permitidas, incluida autocustodia si el flujo la habilita. | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M06 | `/bookings` y detalle de reserva                         | Base          | ES      | Cuenta Base y solicitud de prueba propia.                        | Puede solicitar/ver lo propio; no realiza entrega ni devolución administrativa.                  | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M07 | `/bookings` y detalle de reserva                         | Autoservicio  | ES      | Cuenta Autoservicio y reserva de prueba propia.                  | Las acciones propias visibles coinciden con el manual y no habilitan gestión ajena.              | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M08 | `/bookings` y detalle de reserva                         | Administrador | ES y EN | Cuenta Administrador y reserva de prueba.                        | Puede gestionar entrega/devolución; textos, fechas y estados se entienden en ambos idiomas.      | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M09 | `/scanner` — lectura QR/código                           | Administrador | ES      | Código de prueba y permiso de cámara o lector disponibles.       | Identifica el activo y sólo ofrece acciones autorizadas por su estado.                           | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M10 | `/audits` y detalle de auditoría                         | Propietario   | ES y EN | Auditorías habilitadas y datos de prueba.                        | Puede crear/gestionar; lista, detalle y escaneo respetan los idiomas seleccionados.              | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M11 | `/audits` y detalle asignado                             | Base          | ES      | Auditoría de prueba asignada a la cuenta.                        | Sólo accede a la tarea asignada; no crea, administra ni elimina auditorías.                      | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M12 | `/audits` y detalle asignado                             | Autoservicio  | ES      | Auditoría de prueba asignada a la cuenta.                        | Sólo accede a la tarea asignada; no crea, administra ni elimina auditorías.                      | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M13 | `/reports` — índice, filtro y CSV/PDF                    | Propietario   | ES y EN | Reportes habilitados y datos de prueba.                          | Accede a reportes; filtros, período y exportaciones no se describen de forma errónea.            | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M14 | `/reports` — acceso y exportación                        | Administrador | ES      | Reportes habilitados y datos de prueba.                          | Accede a reportes de acuerdo con sus permisos delegados.                                         | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M15 | `/reports` — restricción de acceso                       | Base          | ES      | Cuenta Base.                                                     | La ruta no muestra reportes ni permite acceder mediante enlace directo.                          | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M16 | `/reports` — restricción de acceso                       | Autoservicio  | ES      | Cuenta Autoservicio.                                             | La ruta no muestra reportes ni permite acceder mediante enlace directo.                          | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M17 | `/assets/import` y `/assets` — importar/exportar         | Administrador | ES y EN | CSV de prueba reversible; nunca datos productivos.               | Importación y exportación coinciden con las fuentes oficiales, sin alterar contratos CSV.        | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M18 | `/settings/team` y configuración de organización         | Propietario   | ES      | Equipo de prueba y sin invitaciones reales.                      | Distingue acciones de propiedad, roles y preferencias sin atribuirlas al Administrador.          | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M19 | `/settings/team` y configuración delegable               | Administrador | ES      | Equipo de prueba y sin invitaciones reales.                      | Sólo se documentan acciones de equipo/configuración realmente delegadas.                         | PENDIENTE                                                          | PENDIENTE | PENDIENTE                                                                 | PENDIENTE  |
| M20 | `docs/user-manual/README.md` y capítulos 01–04 — enlaces | Sin sesión    | ES      | Copia local actual del repositorio.                              | Todo enlace local resuelve y todo vínculo oficial abre el artículo esperado.                     | 13 enlaces locales y 20 oficiales resolvieron al destino esperado. | PASS      | Comprobación local con Node y apertura de las 20 URLs oficiales de Shelf. | 2026-09-30 |

## Criterios de aprobación editorial

- Si se reactiva la validación visual, M01–M19 deben tener resultado real,
  estado `PASS` o `FAIL`, evidencia y fecha; una fila pendiente no acredita el
  recorrido.
- Todos los enlaces locales y oficiales referidos por los capítulos resuelven
  al destino esperado.
- Ningún capítulo promete una acción que el rol de la prueba no puede realizar.
- La terminología visible coincide con ES; EN se comprueba donde la matriz lo
  exige.
- Las capturas, si se autorizan, usan cuenta y datos de prueba, identifican
  rol/idioma y no incluyen secretos ni datos de terceros.
- Un `FAIL` registra ruta, rol, idioma, texto observado y capítulo afectado; no
  autoriza cambios de código bajo esta slice.

## Dependencias y límites

- Requiere una sesión autenticada segura e independiente para cada rol.
- Requiere autorización separada para generar capturas y para publicar el
  manual.
- Una prueba de Propietario no prueba restricciones de Base ni de Autoservicio.
- La evidencia de localización autenticada sigue siendo un trabajo paralelo;
  esta matriz no declara cerrado su gate global.
