# 04-slice — Inventario y operación diaria

## 1. Nombre del slice

04-slice — Inventario y operación diaria

Estado: pendiente de implementación. Orden sugerido: 4.

Especificación: [spec.md](spec.md).

Justificación del corte: Agrupa la experiencia coherente de inventario y reutiliza infraestructura compartida sin rediseñar reglas de negocio.

## 2. Objetivo del slice

Gestionar activos y su organización en ambos idiomas sin cambiar sus reglas ni datos.

## 3. Problema puntual que resuelve

El vocabulario específico y los mensajes de operación de inventario siguen fuera del catálogo común.

## 4. Valor observable que entrega

Una persona crea, consulta, edita y asigna un activo usando textos, validaciones y resultados en su idioma.

## 5. Alcance específico

Superficies de activos, modelos, categorías, etiquetas, ubicaciones, kits, asignaciones, escaneo y sus formularios de importación.

## 6. Qué incluye

- Traducir listas, detalles, formularios, filtros, selección masiva, estados y mensajes de inventario.
- Cubrir activos, modelos, categorías, etiquetas, ubicaciones, kits y asignaciones/devoluciones fuera de reservas.
- Traducir interfaces de QR/escaneo y flujos de importación/actualización de inventario.
- Localizar mensajes de éxito/error de loaders/actions y etiquetas de actividad del sistema donde corresponda.
- Registrar cobertura real del módulo en este slice durante implementación.

## 7. Qué no incluye

- Modificar nombres/notas y otros datos almacenados por usuarios.
- Cambiar ALL_SELECTED_KEY, filtros de datos, cálculo de stock o permisos.
- Cambiar formato de archivos importados/exportados; documentos se tratan en 06.
- Flujos de reservas y auditorías de 05.

## 8. Actores involucrados

- Usuario con permisos de inventario
- Usuario que escanea un QR

## 9. Precondiciones

- Slice 03 disponible y glosario definido.
- Datos de prueba de activos, ubicaciones, kits y permisos existentes.

## 10. Entradas necesarias

- Catálogos comunes, idioma de petición y textos de módulos de inventario.
- Datos de prueba e inventario de rutas habilitadas.

## 11. Flujo operativo paso a paso

1. **Localizar superficies:** Aplicar glosario a listas, detalles, filtros, formularios y vistas de escaneo.
2. **Localizar resultados:** Traducir mensajes de operaciones/validación usando idioma de petición sin cambiar sus códigos ni datos.
3. **Comprobar recorrido:** Crear/editar/asignar un activo y usar un QR con los permisos existentes; revisar formularios de importación.
4. **Registrar cobertura:** Actualizar este slice con superficies verificadas, huecos y evidencia sin duplicar pruebas por cada texto.

## 12. Salidas esperadas

- Inventario bilingüe, incluidos formularios y respuestas de operación.
- Cobertura documentada de superficies traducidas.

## 13. Reglas de negocio aplicables

- RF-04, RF-06 y RF-07 aplican al inventario.
- Los valores internos de estados y los IDs permanecen estables.
- Los nombres de activos/categorías y notas no se traducen ni reescriben.
- El idioma no altera filtros, selecciones masivas ni reglas de stock.

## 14. Validaciones

- Smoke dirigido de crear/editar/asignar activo en en/es, con una validación negativa representativa.
- Cambiar idioma con un formulario de activo abierto y conservar valores/filtros.
- Verificación dirigida de lista/detalle de kit y ubicación, escaneo y mensajes de importación.
- Tests solo de lógica de traducción/errores modificada; no crear tests por sustituciones estáticas.

## 15. Manejo de errores o edge cases

- Nombre de activo parecido a una clave de traducción debe mostrarse literalmente.
- Mensajes de datos inválidos y permisos insuficientes deben traducirse conservando respuesta y restricciones.
- Un fallo de escaneo conserva la recuperación existente y localiza la explicación.

## 16. Criterios de aceptación

- 04-AC1: superficies de inventario inventariadas tienen en/es, incluidos vacíos, errores y accesibilidad.
- 04-AC2: recorrido representativo de activo produce los mismos datos y estados en ambos idiomas.
- 04-AC3: cambio de idioma conserva formulario y filtros; contenido libre permanece idéntico.
- 04-AC4: interfaces de importación/escaneo son bilingües sin cambiar contratos ni reglas de selección masiva.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Glosario y catálogos compartidos.
- Técnica: apps/webapp/app/routes/\_layout+/
- Técnica: apps/webapp/app/routes/qr+/
- Técnica: apps/webapp/app/components/assets/
- Técnica: apps/webapp/app/modules/

## 18. Depende de slices

- [03-slice](03-slice.md)

## 19. Riesgos / decisiones abiertas

- Confundir texto de sistema con datos del usuario puede modificar contenido que debe conservarse.
- Mensajes originados en servicios pueden quedar en inglés si solo se convierten componentes.

## 20. Pendientes / preguntas abiertas

Ninguno.

## 21. AI Execution Profile

- **Profile:** BALANCED.
- **Preferred model:** GPT-5.6 Terra (`gpt-5.6-terra`).
- **Reasoning:** Medium.
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / Medium.
- **Switch Benefit:** LOW si continúa inmediatamente después de 03 con Terra; no conviene interrumpir para otro cambio.
- **Model Gate required:** no; reutilizar la configuración suficiente confirmada para 03–04.
- **Review mode:** N2 dirigido a formularios, loaders/actions, selección masiva e importación; no requiere review crítico separado salvo que el diff cambie lógica o permisos.
- **Reason:** el volumen es alto pero el patrón queda establecido en 03; Terra es suficiente para distinguir textos de sistema de datos libres y preservar contratos de inventario.
