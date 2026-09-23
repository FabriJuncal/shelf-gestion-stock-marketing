# Execution Brief — S04 inventario y operación diaria

## AI Execution Profile

> Recomendación de ejecución; no afirma el modelo efectivo de esta sesión.

- **Profile:** BALANCED
- **Preferred model full name:** GPT-5.6 Terra
- **Model ID:** `gpt-5.6-terra`
- **Reasoning:** Medium
- **Fallback full name:** GPT-5.6 Sol
- **Fallback model ID:** `gpt-5.6-sol`
- **Fallback reasoning:** Medium
- **Switch benefit:** LOW
- **Model Gate required:** no; el usuario confirmó `continuar con slice 04` y
  esta fase conserva la configuración suficiente de S03.

## Objective

Localizar las superficies de inventario para inglés/español sin modificar datos
libres, contratos, permisos, filtros, formatos de archivos ni reglas de stock.

## Bounded scope

- Activos, kits, modelos, categorías, etiquetas, ubicaciones, custodia,
  escaneo QR e interfaces de importación/actualización.
- Textos visibles, accesibles y de éxito/error originados en esas superficies.
- Catálogo `inventory` y helpers localizados de errores cuando sean necesarios.

No incluye reservas/auditorías, documentos/exportaciones, correo, Companion ni
cambios al patrón `ALL_SELECTED_KEY`.

## Required validation

- Tests dirigidos de lógica de traducción/error y del comportamiento modificado.
- Smoke de formulario/lista representativa en ambos idiomas donde el entorno lo
  permita; conservar valores al alternar idioma.
- ESLint, TypeScript y `git diff --check` sobre el alcance modificado.
- Registrar superficies cubiertas, límites y evidencia en `CLOSURE_BRIEF.md`.

## Escalate only if

Una traducción requiere cambiar permisos, forma de una API, persistencia,
selección masiva, cálculo de stock o un contrato de archivo.
