# S05 — cierre local

Reservas, calendarios y auditorías usan los catálogos `booking` y `audit` para
sus estados, avisos operativos, formularios, disponibilidad y resultados de
escaneo. Los enums, URLs, acciones, permisos, zonas horarias y wires de fecha
se conservan sin cambios.

La capa de calendario selecciona el locale activo de `react-day-picker` y de
`date-fns`; el valor enviado continúa siendo `YYYY-MM-DD` o
`YYYY-MM-DDTHH:mm`.

## Evidencia

- ESLint dirigido: PASS.
- Catálogos EN/ES estructuralmente alineados: PASS.
- Vitest dirigido: 5 archivos, 33 pruebas PASS.
- TypeScript (`tsc -b`, heap 6144 MB): PASS.
- `git diff --check`: PASS.

No se ejecutó navegador autenticado, build de producción ni deploy; pertenecen
al cierre S07. El warning de Tailwind por `duration-[2500ms]` es preexistente y
no fue modificado por este slice.
