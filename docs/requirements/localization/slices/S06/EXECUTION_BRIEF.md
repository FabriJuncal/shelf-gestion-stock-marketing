# Execution Brief — S06-UI administración, reportes y notificaciones

## AI Execution Profile

> Recomendación de ejecución; no afirma el modelo efectivo de esta sesión.

- **Profile:** BALANCED
- **Preferred model full name:** GPT-5.6 Terra
- **Model ID:** `gpt-5.6-terra`
- **Reasoning:** High
- **Fallback full name:** GPT-5.6 Sol
- **Fallback model ID:** `gpt-5.6-sol`
- **Fallback reasoning:** High
- **Switch benefit:** LOW
- **Model Gate required:** no; el usuario autorizó avanzar y la configuración
  recomendada conserva el nivel de S05.

## Objective

Localizar la administración, los reportes, los documentos para personas y las
notificaciones de interfaz en inglés/español sin alterar permisos, queries,
datos, totales, formatos de intercambio ni contenido libre.

## Bounded scope

- Rutas de configuración y cuenta, respetando visibilidad por rol y flags.
- Índice, cabeceras, filtros y salidas visuales de reportes.
- Documentos legibles por personas cuando su implementación se encuentre en el
  alcance de las rutas modificadas.
- Notificaciones presentadas dentro de la aplicación.

No incluye SMTP, correos salientes, plantillas alojadas de Supabase, workers,
Resend, Companion, configuración externa, cambios de precios ni portales de
terceros.

## Impact and invariants

- `requirePermission` y la visibilidad actual son contratos: no se modifican.
- Los helpers de reportes continúan devolviendo los mismos datos y totales.
- CSV y otros formatos de reimportación mantienen esquemas y encabezados
  contractuales.
- El idioma sólo cambia presentación; no cambia valores, monedas, fechas
  almacenadas ni contenido libre.

## Required validation

- Paridad estructural de los catálogos en/es para las claves añadidas.
- Pruebas dirigidas de componentes/rutas modificados y comportamiento de
  reportes cuando haya lógica afectada.
- ESLint, TypeScript y `git diff --check` sobre el alcance modificado.
- Registrar superficies cubiertas, límites y evidencia en
  `slices/S06/CLOSURE_BRIEF.md` antes de cerrar el slice.

## Escalate only if

La localización exige cambiar permisos, queries, datos/totales de reportes,
contratos de exportación, envío de correo, configuración externa o una API.
