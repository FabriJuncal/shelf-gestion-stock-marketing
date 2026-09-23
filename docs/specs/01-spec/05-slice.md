# 05-slice — Reservas, calendarios y auditorías

## 1. Nombre del slice

05-slice — Reservas, calendarios y auditorías

Estado: pendiente de implementación. Orden sugerido: 5.

Especificación: [spec.md](spec.md).

Justificación del corte: Separa flujos temporales que requieren verificar calendarios/estados, sin repetir la revisión de inventario.

## 2. Objetivo del slice

Completar recorridos de reserva y auditoría con idioma consistente.

## 3. Problema puntual que resuelve

Los calendarios, estados y mensajes específicos de estos flujos requieren localización adicional al inventario.

## 4. Valor observable que entrega

El usuario crea una reserva, registra entrega/devolución y consulta una auditoría con controles y resultados localizados.

## 5. Alcance específico

Módulos operativos temporales: reservas, disponibilidad, calendarios y auditorías; conservar reglas e instantes.

## 6. Qué incluye

- Reservas: listas, detalles, formularios, disponibilidad, entrega, devolución y estados.
- Calendarios utilizados en reservas: controles, días/meses y textos de eventos de sistema.
- Auditorías: listas, creación, detalle, escaneo, estados, resultados y actividad de sistema.
- Errores y avisos de estos recorridos en idioma de petición.

## 7. Qué no incluye

- Cambiar reglas de conflictos, vencimientos, disponibilidad, auditoría o permisos.
- Traducir texto libre de títulos/comentarios.
- Cambiar protocolos ICS o exportaciones; su compatibilidad se verifica en 06.
- Correos derivados de reservas/auditorías; se localizan en 06.

## 8. Actores involucrados

- Usuario con permisos de reservas
- Usuario con permisos de auditoría

## 9. Precondiciones

- Slices 03 y 04 disponibles.
- Datos de prueba y funcionalidades correspondientes habilitadas en entorno de prueba.

## 10. Entradas necesarias

- Idioma, formatos regionales resueltos y catálogos.
- Reservas/auditorías de prueba y sus estados existentes.

## 11. Flujo operativo paso a paso

1. **Localizar reservas:** Convertir formularios, estados y acciones con glosario; preservar valores internos.
2. **Localizar calendarios:** Configurar locale de presentación y respetar zona horaria/inicio de semana/horas elegidos.
3. **Localizar auditorías:** Convertir vistas y mensajes de escaneo/resultado conservando reglas.
4. **Validar recorridos:** Comprobar una reserva y una auditoría, incluyendo un error funcional representativo.

## 12. Salidas esperadas

- Controles y mensajes bilingües de reservas/auditorías.
- Evidencia de conservación de fechas y reglas en recorridos representativos.

## 13. Reglas de negocio aplicables

- RF-06 y RF-07 aplican a estos módulos.
- Fechas límite, instantes y disponibilidad no dependen del idioma.
- Traducir etiquetas de estados, no los estados internos.
- No alterar títulos/notas libres ni resultados numéricos.

## 14. Validaciones

- Recorrido dirigido de reserva y entrega/devolución en ambos idiomas; misma operación produce los mismos estados.
- Una validación de disponibilidad/fechas muestra mensaje localizado conservando la decisión existente.
- Auditoría representativa con escaneo/resultado y controles traducidos.
- Prueba de adaptación de calendario con preferencias explícitas y fecha cercana a cambio de día si se modifica ese formateo.

## 15. Manejo de errores o edge cases

- Fecha inválida o activo no disponible: traducción de la explicación sin modificar validación.
- Funciones deshabilitadas siguen sin habilitarse por cambiar idioma.
- Nombres de eventos introducidos por usuarios permanecen literales.

## 16. Criterios de aceptación

- 05-AC1: recorridos de reservas y auditorías inventariados funcionan en en/es.
- 05-AC2: calendarios localizan texto y conservan zona, inicio de semana, hora y fecha guardados.
- 05-AC3: resultado de reserva/auditoría y restricciones son independientes del idioma.
- 05-AC4: errores representativos y textos accesibles están traducidos sin alterar contenido libre.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Activos/kits y formatos compartidos disponibles.
- Técnica: apps/webapp/app/routes/\_layout+/bookings\*
- Técnica: apps/webapp/app/routes/\_layout+/audits\*
- Técnica: apps/webapp/app/components/booking/
- Técnica: apps/webapp/app/modules/booking/
- Técnica: apps/webapp/app/modules/audit/

## 18. Depende de slices

- [03-slice](03-slice.md)
- [04-slice](04-slice.md)

## 19. Riesgos / decisiones abiertas

- Un calendario puede usar su locale por defecto aunque el resto de la interfaz esté traducida.
- La localización debe preservar instantes y no cambiar interpretación de inputs de fecha.

## 20. Pendientes / preguntas abiertas

Ninguno.

## 21. AI Execution Profile

- **Profile:** BALANCED.
- **Preferred model:** GPT-5.6 Terra (`gpt-5.6-terra`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / High.
- **Switch Benefit:** MEDIUM; mantener el mismo modelo y elevar razonamiento evita un cambio de familia para calendarios, zonas horarias y estados temporales.
- **Model Gate required:** no; el escalamiento suave se aplica al comenzar 05 si el runtime lo permite.
- **Review mode:** N2 dirigido a calendarios, instantes, disponibilidad y resultados; escalar a review crítico solo si se modifica lógica temporal.
- **Reason:** la localización sigue siendo acotada, pero fechas, límites de día y disponibilidad necesitan más profundidad que una sustitución de etiquetas.
