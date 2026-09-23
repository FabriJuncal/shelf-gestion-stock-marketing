# 03-slice — Interfaz compartida y formatos regionales

## 1. Nombre del slice

03-slice — Interfaz compartida y formatos regionales

Estado: implementación inicial en curso; navegación, preferencias y formatos piloto construidos localmente. Orden sugerido: 3.

Especificación: [spec.md](spec.md).

Justificación del corte: Convierte una sola vez los componentes y formatos reutilizados para reducir duplicación en los módulos posteriores.

## 2. Objetivo del slice

Ofrecer navegación, mensajes comunes y formatos de presentación consistentes en en/es.

## 3. Problema puntual que resuelve

Los componentes reutilizados y formateadores mantienen inglés aunque cambie una pantalla individual.

## 4. Valor observable que entrega

El usuario cambia idioma desde el menú y ve navegación, diálogos comunes, fechas textuales y números coherentes, conservando sus preferencias regionales.

## 5. Alcance específico

Catálogo común y adaptadores de presentación reutilizados por módulos, con inventario de cobertura y glosario.

## 6. Qué incluye

- Selector del menú, navegación/breadcrumbs, botones, tablas/paginación, búsqueda, diálogos, estados vacíos, tooltips y textos accesibles.
- Establecer glosario mínimo y mantener inventario de superficies en spec/slices; asignar cada módulo a su slice.
- Traducir errores comunes y validaciones con códigos/claves estables sin cambiar contratos de negocio.
- Adaptar nombres de meses/días, tiempo relativo, calendarios y presentación numérica respetando formatos existentes.
- Controles de claves faltantes, variables y plurales entre catálogos; revisión de textos aún fuera de catálogos.

## 7. Qué no incluye

- Textos específicos de inventario, reservas y administración.
- Cambiar zona horaria, moneda o cálculos por seleccionar idioma.
- Cambiar formatos de intercambio o localizar Companion.
- Modificar retrospectivamente contenido libre guardado.

## 8. Actores involucrados

- Usuario autenticado
- Visitante ante errores comunes
- Usuarios de lectores de pantalla

## 9. Precondiciones

- Slice 01 implementado.
- Revisar @shelf/datetime, formateadores y consumidores antes de sustituir locales.

## 10. Entradas necesarias

- Idioma resuelto, preferencias de fecha/hora/zona/semana y moneda existente.
- Textos compartidos y catálogo de componentes utilizados.

## 11. Flujo operativo paso a paso

1. **Inventariar:** Identificar componentes y rutas habilitadas, registrar glosario y responsables de cobertura por slice.
2. **Traducir componentes:** Migrar mensajes comunes, títulos, accesibilidad y etiquetas conservando valores y acciones.
3. **Separar formato y cálculo:** Localizar texto de fechas/números manteniendo extracción de partes, instantes y preferencias explícitas.
4. **Validar reutilización:** Revisar componentes representativos en móvil/escritorio, errores y ambas variantes lingüísticas.

## 12. Salidas esperadas

- Catálogo común en/es y glosario.
- Formatos de presentación localizados y compatibles.
- Inventario por módulo en la documentación del spec y comprobaciones de catálogos.

## 13. Reglas de negocio aplicables

- RF-01 y RF-06/RF-07.
- Cambiar idioma no cambia moneda, zona, orden de fecha, formato horario ni inicio de semana guardados.
- No traducir códigos internos ni etiquetas de datos libres.
- Clave faltante usa inglés como respaldo operativo, pero la superficie queda pendiente de cobertura.
- Evitar concatenar fragmentos y mantener variables/plurales equivalentes.

## 14. Validaciones

- Comprobación automatizada de paridad de claves/variables/plurales y revisión dirigida de textos hardcoded.
- Unitarias de formateadores modificados con mismo instante y distintas zonas/preferencias; comparar SSR/cliente.
- Una prueba de tiempo relativo y nombres de meses/días en ambos idiomas.
- Revisión visual/teclado de menú, modal y tabla representativos en móvil/escritorio.
- Si cambia @shelf/datetime, probar compatibilidad del contrato utilizado por Companion sin ampliar a una regresión móvil completa.

## 15. Manejo de errores o edge cases

- Idioma no admitido: aplicar resolución establecida, sin excepción de Intl.
- Falta de traducción: respaldo en inglés y detección en controles de cobertura.
- Textos largos: ajustar contenedor conservando legibilidad y acción accesible.
- Errores comunes sin root loader disponible deben tener un respaldo traducible seguro.

## 16. Criterios de aceptación

- 03-AC1: menú permite cambiar idioma y navegación/componentes comunes se actualizan.
- 03-AC2: glosario e inventario asignan cobertura de módulos a los slices sin dejar rutas habilitadas sin responsable.
- 03-AC3: meses, días y tiempo relativo se localizan; zona/moneda/preferencias se mantienen.
- 03-AC4: textos accesibles y estados comunes tienen traducción; no hay recortes que impidan operar los ejemplos revisados.
- 03-AC5: controles de catálogo detectan claves/variables faltantes y no se confunden con cobertura de textos aún hardcoded.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Idioma de petición disponible.
- Técnica: apps/webapp/app/components/
- Técnica: apps/webapp/app/utils/error.ts
- Técnica: apps/webapp/app/utils/date-format.ts
- Técnica: apps/webapp/app/utils/time-ago.ts
- Técnica: packages/datetime/src/index.ts

## 18. Depende de slices

- [01-slice](01-slice.md)

## 19. Riesgos / decisiones abiertas

- Sustituir en-US a ciegas puede alterar cálculos/preferencias del formateador existente.
- Revalidar solo root puede dejar mensajes de loaders hijos anteriores: comprobar consumidores al cambiar idioma.

## 20. Pendientes / preguntas abiertas

- Fijar en el glosario el término de asset y los verbos de custody/check-out según el contexto, manteniendo español claro.

## 21. AI Execution Profile

- **Profile:** BALANCED.
- **Preferred model:** GPT-5.6 Terra (`gpt-5.6-terra`).
- **Reasoning:** Medium.
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / Medium.
- **Switch Benefit:** HIGH al comenzar esta fase: queda trabajo transversal y repetitivo suficiente para que Terra reduzca latencia/costo sin perder capacidad para React, SSR, accesibilidad e Intl.
- **Model Gate required:** sí antes de iniciar la implementación material si la configuración de sesión no está confirmada; no repetirlo durante 03–04.
- **Review mode:** N2 dirigido sobre componentes compartidos y formateadores; el cierre N3 global se realiza en 07.
- **Reason:** es frontend transversal con reglas claras, pero no puramente mecánico porque debe preservar estado de formularios, SSR/cliente y preferencias regionales.
