# Closure Brief — S03 interfaz compartida y formatos regionales

## Alcance implementado

- Catálogos compartidos en inglés/español para navegación, paleta de comandos,
  paginación, accesibilidad e imágenes, con un control automático de paridad.
- Navegación lateral, menú de usuario, breadcrumbs, enlaces de salto, controles
  del sidebar, diálogos y modal contextual localizados sin cambiar rutas,
  permisos ni acciones.
- Paleta de comandos, botón de búsqueda, paginación, selector de zona horaria
  y vista previa de imágenes localizados, incluidos mensajes y etiquetas ARIA.
- `@shelf/datetime` acepta `displayLocale` solo para nombres visibles de mes,
  día, AM/PM y zona. El orden, la zona horaria y el formato horario siguen
  procediendo exclusivamente de las preferencias persistidas.
- La nota usa el idioma activo al llamar a `timeAgo`; no cambia el instante ni
  el cálculo relativo.

## Glosario y cobertura

| Inglés    | Español            | Responsable de cobertura            |
| --------- | ------------------ | ----------------------------------- |
| Asset     | Activo             | S03 shell; S04 inventario           |
| Kit       | Kit                | S03 shell; S04 inventario           |
| Booking   | Reserva            | S03 shell; S05 reservas/calendarios |
| Audit     | Auditoría          | S03 shell; S05 auditorías           |
| Workspace | Espacio de trabajo | S03 shell; S06-UI administración    |
| Custodian | Custodio           | S03 búsqueda; S04 inventario        |

Los textos de dominio, datos libres, estados internos, rutas e IDs no se
tradujeron en este slice. Inventario corresponde a S04; reservas, calendarios y
auditorías a S05; administración, reportes y documentos a S06-UI.

## Evidencia fresca

- Vitest dirigido desde `apps/webapp`: 6 archivos, 86 tests PASS. Incluye
  paridad de catálogos, i18n aislado por petición, formato de fecha en/es con
  orden persistido, tiempo relativo en español, selector de zona horaria y
  paleta de comandos.
- ESLint dirigido desde `apps/webapp` sobre los archivos modificados: PASS.
- TypeScript completo desde `apps/webapp`: `NODE_OPTIONS=--max-old-space-size=6144 ../../node_modules/.bin/tsc -b` — PASS, código 0.
- Prettier dirigido y `git diff --check`: PASS.

## Criterios verificados

- 03-AC1: navegación y controles compartidos consumen el idioma activo.
- 03-AC2: el glosario anterior asigna la cobertura pendiente por slice.
- 03-AC3: nombres de mes/día y tiempo relativo se localizan sin mutar las
  preferencias regionales guardadas.
- 03-AC4: etiquetas ARIA y estados comunes de las superficies modificadas se
  localizan; la validación visual integral responsive queda para el quality
  gate de S07.
- 03-AC5: `resources.test.ts` detecta divergencias estructurales entre los
  catálogos en/es.

## Desviaciones y riesgo residual

- No se ejecutó navegador, build ni suite completa en este cierre de slice;
  corresponden a la validación dirigida/publicación de S07.
- La primera ejecución de Vitest desde la raíz resolvía incorrectamente el
  setup de `apps/webapp`; repetida desde el paquete webapp, pasó.
- El typecheck estándar agotó el heap de Node (2 GB); repetido con 6144 MB,
  terminó correctamente.
- No hubo cambios remotos, correos, commit, push ni despliegue.

## Handoff

La próxima unidad autorizable es S04 (inventario). Antes de iniciarla debe
seguirse el protocolo de Model Gate definido en `STATE.md`.
