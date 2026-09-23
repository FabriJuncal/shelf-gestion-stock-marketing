# 07-slice — Verificación dirigida y publicación recuperable

## 1. Nombre del slice

07-slice — Verificación dirigida y publicación recuperable

Estado: pendiente de implementación. Orden sugerido: 7.

Especificación: [spec.md](spec.md).

Justificación del corte: Cierre operacional separado que integra evidencia previa y comprueba solo las dependencias transversales y el despliegue.

## 2. Objetivo del slice

Publicar la experiencia completa con evidencia de cobertura y un procedimiento de recuperación probado.

## 3. Problema puntual que resuelve

Entregas parciales no acreditan cobertura global ni garantizan compatibilidad del orden de despliegue.

## 4. Valor observable que entrega

El usuario dispone de toda la webapp en en/es, con correos consistentes y una versión de producción recuperable.

## 5. Alcance específico

Cierre de aceptación, prueba de migración/compatibilidad y publicación de los slices implementados.

## 6. Qué incluye

- Consolidar inventario y evidencia de RF-01 a RF-10 y G-01 a G-06 en spec/slices.
- Verificar huecos de traducción y recorrido final dirigido sin repetir pruebas aprobadas innecesariamente.
- Ensayar migración aditiva con usuarios existentes y código anterior en entorno de prueba.
- Preparar recuperación de código y plantillas; aplicar migración antes del código consumidor.
- Publicar en Vercel dentro del alcance autorizado y observar errores de acceso/carga/sincronización en herramientas existentes.

## 7. Qué no incluye

- Añadir funcionalidades o idiomas.
- Regresión general de reglas intactas, carga masiva o auditoría de seguridad no motivada.
- Eliminar usuarios, resetear base o borrar columna para revertir.
- Afirmar pruebas/despliegues hechos sin evidencia.

## 8. Actores involucrados

- Responsable de implementación/despliegue
- Usuario de prueba

## 9. Precondiciones

- Slices 01 a 06 completos con evidencia.
- Entorno de prueba y accesos de publicación identificados; despliegue incluido en la autorización vigente.
- Versión anterior recuperable y respaldo de plantillas localizados.

## 10. Entradas necesarias

- Matriz de cobertura, resultados de pruebas y artefacto de build.
- Migración aditiva de 01, plantillas de 02 y configuración del entorno objetivo.

## 11. Flujo operativo paso a paso

1. **Cerrar evidencia:** Revisar cobertura/criterios por slice y ejecutar solo pruebas pendientes o invalidadas por cambios nuevos.
2. **Ensayar compatibilidad:** Aplicar migración en prueba, conservar filas existentes y verificar que la versión anterior funciona con columna adicional.
3. **Preparar recuperación:** Identificar versión previa y respaldar plantillas; ensayar restauración del código conservando columna en prueba.
4. **Publicar en orden:** Aplicar/verificar migración en objetivo, configurar plantillas bilingües y desplegar código consumidor en Vercel.
5. **Comprobar y observar:** Smoke de acceso/cambio de idioma/correo y revisión de errores existentes; recuperar versión previa si el cambio rompe acceso/carga o pierde datos de formularios.

## 12. Salidas esperadas

- Cobertura completa documentada y aceptación verificada.
- Despliegue identificado, smoke posterior y procedimiento de recuperación comprobado.
- Estado real de ejecución actualizado en los documentos del spec.

## 13. Reglas de negocio aplicables

- RF-10, G-01 a G-06 y orden del spec 14.1.
- Migración siempre antes de código consumidor; columna nullable conservada al revertir.
- No publicar como completa una cobertura parcial.
- La sincronización parcial tiene aviso/reintento; no debe impedir autenticación.
- No usar db:reset ni usuarios reales para pruebas destructivas.

## 14. Validaciones

- Verificar matriz de catálogos y revisión de textos fuera de ellos; ninguna superficie habilitada queda sin responsable/evidencia.
- Registro/confirmación/login/recuperación en ambos idiomas y preferencia entre sesiones/dispositivos con evidencia vigente de 01/02.
- Comprobar cambio con formulario abierto, formatos y muestras visuales de móvil/escritorio.
- Ensayo de migración/código anterior y reversión en prueba conservando datos.
- Ejecutar validación habitual de repo antes de commits sustantivos y build de producción; registrar fallos preexistentes con evidencia, sin declarar verde si no lo está.
- Smoke posterior y comprobación de errores de acceso/carga/sincronización, sin instrumentación adicional por defecto.

## 15. Manejo de errores o edge cases

- Migración no aplicada/verificable: detener publicación del código consumidor.
- Fallo de plantillas: restaurar anteriores y comprobar envío/enlaces.
- Regresión de acceso/carga atribuible al cambio: restaurar versión previa conservando columna.
- Cobertura faltante: resolver en slice propietario antes de declarar completo.
- Falta de autorización/acceso de publicación: dejar artefactos y evidencia preparados, sin inventar despliegue.

## 16. Criterios de aceptación

- 07-AC1: RF-01 a RF-10 y G-01 a G-06 tienen evidencia y estado final documentados.
- 07-AC2: no hay traducciones faltantes en superficies habilitadas; revisión visual dirigida satisfactoria.
- 07-AC3: migración preserva usuarios y código previo funciona con columna agregada.
- 07-AC4: recuperación de código/plantillas está ensayada y documentada sin eliminar columna.
- 07-AC5: despliegue sigue el orden definido y smoke posterior confirma acceso, persistencia y correo.
- 07-AC6: resultados distinguen pruebas aprobadas, fallos y limitaciones reales; no se reporta finalizado un despliegue pendiente.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Todos los recorridos y salidas dentro de alcance traducidos.
- Técnica: Scripts pnpm existentes
- Técnica: Migración @shelf/database
- Técnica: Artefacto/build y configuración Vercel
- Técnica: Herramientas de logs existentes
- Externa: Supabase del entorno objetivo
- Externa: Vercel y entrega de correo
- Externa: Buzón de prueba

## 18. Depende de slices

- [01-slice](01-slice.md)
- [02-slice](02-slice.md)
- [03-slice](03-slice.md)
- [04-slice](04-slice.md)
- [05-slice](05-slice.md)
- [06-slice](06-slice.md)

## 19. Riesgos / decisiones abiertas

- Publicar código antes de migración rompe consultas del root loader.
- Preview y producción pueden diferir en plantillas o redirect URLs; verificar configuración del destino.
- No confundir presencia de selector con cobertura completa.

## 20. Pendientes / preguntas abiertas

- Identificar entorno de prueba y versión concreta de recuperación al ejecutar el slice; no son datos necesarios para aprobar el plan.

## 21. AI Execution Profile

- **Profile:** ADVANCED.
- **Preferred model:** GPT-5.6 Sol (`gpt-5.6-sol`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Terra (`gpt-5.6-terra`) / XHigh.
- **Switch Benefit:** HIGH por cierre N3, compatibilidad de migración, rollback, infraestructura y despliegue.
- **Model Gate required:** sí al activar publicación si la configuración suficiente no está confirmada; no autoriza deploy por sí solo.
- **Review mode:** N3 dedicado con GPT-5.6 Sol (`gpt-5.6-sol`) / High y evidencia reciente antes de cierre.
- **Reason:** consolidar documentación puede ser mecánico, pero las decisiones de publicación y recuperación tienen impacto de producción y requieren ADVANCED.
