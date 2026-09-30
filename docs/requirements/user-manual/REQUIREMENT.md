# Requerimiento — Manual de usuario progresivo

## Propósito

Dar a cada persona usuaria un camino claro desde el primer acceso hasta las
funciones avanzadas de Shelf, sin duplicar la base de conocimiento oficial ni
exponer acciones que su rol no puede realizar.

El manual será una guía curada para esta instancia: explica por dónde empezar,
qué resultado buscar en cada etapa y cuándo abrir un artículo oficial para el
detalle. No reemplaza la documentación técnica del repositorio ni modifica la
aplicación.

## Alcance de este requerimiento

- Inventariar las fuentes existentes y decidir si se reutilizan, enlazan,
  adaptan o necesitan contenido nuevo.
- Diseñar un recorrido de aprendizaje: preparación, operación habitual y uso
  avanzado.
- Diferenciar el contenido por audiencia y permisos.
- Producir un manual de usuario y sus capturas únicamente después de aprobar
  la arquitectura de información.

## Fuera de alcance

- Cambios de código, arquitectura, stack, permisos, planes, precios o flujos.
- Reescritura masiva de la base de conocimiento oficial.
- Cambios a documentación de desarrollo, despliegue u operación técnica.
- Validar visualmente rutas autenticadas hasta contar con una sesión segura;
  ese límite se registra, pero no reabre el requerimiento de localización.

## Audiencias y límites de permisos

| Audiencia                   | Necesidad principal                           | Alcance del manual                                                                                                                       |
| --------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Propietario                 | Preparar el espacio, decidir reglas y delegar | Inicio, equipo, configuración que le corresponde, suscripciones y traspaso de propiedad.                                                 |
| Administrador               | Operar y mantener el inventario del equipo    | Recorrido completo de operación, auditorías, reportes, importación y configuración delegable.                                            |
| Autoservicio                | Reservar y operar sus propios préstamos       | Activos visibles, custodia propia, reservas propias y auditorías asignadas; no se infiere gestión ajena.                                 |
| Base                        | Solicitar activos y realizar tareas asignadas | Búsqueda, solicitud de reserva propia y auditorías asignadas; no se presentan como disponibles check-in/out, reportes ni administración. |
| Miembro no registrado (NRM) | Ser custodio identificado sin acceso          | No es lector del manual: se explica al Propietario/Administrador cómo usarlo como registro sin credenciales.                             |

La matriz detallada se mantendrá enlazada a la fuente oficial de roles para no
duplicar ni desactualizar permisos.

## Criterios de aceptación

- **UM-AC1:** existe una única tabla de contenidos progresiva que guía desde el
  primer resultado útil hasta la operación avanzada.
- **UM-AC2:** cada capítulo identifica audiencia, objetivo, requisitos y
  enlace a la fuente oficial cuando ésta ya cubre el detalle.
- **UM-AC3:** ningún capítulo promete una acción vedada a su rol;
  Propietario, Administrador, Autoservicio, Base y NRM se distinguen
  explícitamente.
- **UM-AC4:** el contenido propio queda limitado a contexto de esta instancia,
  orientación y vacíos reales; no duplica artículos oficiales vigentes.
- **UM-AC5:** cada capítulo que necesite evidencia visual queda marcado con la
  ruta, rol, idioma y estado de captura, sin inventar imágenes.
- **UM-AC6:** la versión final valida enlaces, terminología EN/ES, permisos y
  recorrido con al menos un Propietario/Administrador y una persona usuaria común.

### Decisión de cierre documental

El 2026-09-30 el usuario definió como resultado requerido el manual Markdown
versionado. La validación visual autenticada, las capturas y la publicación se
difieren y no bloquean este cierre. UM-AC5 y UM-AC6 quedan como criterios de una
eventual edición verificada/publicada, no como condición de aceptación de la
entrega Markdown actual.

## Slices propuestos

| Slice                           | Propósito                                                                         | Estado                                                 |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| S01 — inventario y arquitectura | Consolidar fuentes, audiencias, recorrido, índice y criterios.                    | Completado y aprobado.                                 |
| S02 — inicio guiado             | Redactar el camino de primera configuración y primer resultado útil.              | Contenido y revisión dirigida P1/P2 completados.       |
| S03 — operación habitual        | Cubrir activos, custodia, reservas, QR, calendario y recordatorios.               | Contenido y revisión dirigida P1/P2 completados.       |
| S04 — administración y avanzado | Cubrir auditorías, reportes, importación/exportación, configuraciones y permisos. | Contenido y revisión dirigida P1/P2 completados.       |
| S05 — cierre documental         | Comprobar estructura, enlaces, roles y consistencia de la entrega Markdown.       | Completado; validación visual y publicación diferidas. |

## Decisiones editoriales resueltas

1. **Canal de entrega:** Markdown versionado en `docs/user-manual/`.
2. **Idioma editorial inicial:** español; una edición EN/ES equivalente queda
   para la validación previa a una publicación bilingüe.
3. **Público inicial:** Propietario y Administrador primero, con orientación
   común para Autoservicio y Base y referencia administrativa para NRM.
