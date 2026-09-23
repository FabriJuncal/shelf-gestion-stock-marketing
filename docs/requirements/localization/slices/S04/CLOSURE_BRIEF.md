# Cierre local — S04 Inventario y operación diaria

## Alcance cubierto

- Índices, filtros, formularios y acciones masivas de activos.
- Modelos de activos, categorías, etiquetas, ubicaciones, kits y custodia que
  no depende de una reserva.
- Ajuste de cantidad, ubicaciones múltiples, códigos QR, escáner base y
  descarga de QR.
- Importación y actualización de activos, incluyendo confirmación, resultados,
  errores de CSV y ayudas visibles. Los identificadores de columnas, enums y
  ejemplos del contrato CSV permanecen literalmente estables.

## Invariantes preservadas

- No se modificaron IDs, filtros, `ALL_SELECTED_KEY`, permisos, stock ni
  contratos de API/CSV.
- Nombres, notas y otros datos escritos por personas no se traducen.
- La ruta de reservas/check-in/check-out de los drawers de escáner se deja para
  S05, que es su propietario funcional.

## Evidencia local

- Catálogos EN/ES: `app/i18n/resources.test.ts` PASS.
- Ubicaciones múltiples: `manage-placements-form.test.tsx` PASS (5 casos).
- Descarga QR: `bulk-download-qr-dialog.test.tsx` PASS (2 casos) en la ronda
  dirigida previa.
- ESLint y Prettier dirigidos PASS sobre los bloques modificados.
- TypeScript de la webapp PASS antes del cierre de este slice.
- `git diff --check` PASS en las validaciones dirigidas.

## Límites de evidencia

No se ejecutó un navegador autenticado contra un entorno real en esta ronda;
la validación de recorrido y publicación corresponde a S07. No se afirma que
el correo saliente esté localizado: quedó explícitamente diferido.

## Próximo paso

Iniciar S05 tras decidir el cambio recomendado de razonamiento a High para
reservas, calendarios, auditorías y drawers de scanner vinculados a ellas.
