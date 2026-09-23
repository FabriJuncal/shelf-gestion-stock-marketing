# 06-slice — Administración, reportes y comunicaciones de la aplicación

## 1. Nombre del slice

06-slice — Administración, reportes y comunicaciones de la aplicación

Estado: pendiente de implementación. Orden sugerido: 6.

Especificación: [spec.md](spec.md).

Justificación del corte: Completa configuración y salidas que consumen vocabulario de varios módulos; mantiene separadas las pruebas de comunicación y contratos de datos.

## 2. Objetivo del slice

Completar la experiencia bilingüe de configuración y las salidas que produce la aplicación.

## 3. Problema puntual que resuelve

La traducción operativa queda incompleta si configuración, reportes, correos y notificaciones conservan inglés.

## 4. Valor observable que entrega

El usuario configura su cuenta/organización, consulta reportes y recibe comunicaciones en el idioma correspondiente.

## 5. Alcance específico

Superficies administrativas y salidas derivadas de los módulos ya localizados.

## 6. Qué incluye

- Perfil restante, organizaciones, equipo, roles, campos personalizados, configuración y pantallas administrativas habilitadas.
- Dashboard y reportes, impresión y documentos destinados a personas.
- Textos de suscripción/facturación propios de la app si están habilitados, sin modificar importes ni portales externos.
- Correos de aplicación: invitaciones, bienvenida, reservas, auditorías, recordatorios y alertas habilitadas; asunto y cuerpo según destinatario.
- Notificaciones y mensajes de sistema; revisar mecanismo existente para no fijar el idioma del emisor en nuevos mensajes.
- Clasificar cada exportación entre documento para personas y archivo de intercambio, conservando contratos de este último.

## 7. Qué no incluye

- Correos Supabase Auth ya resueltos en 02.
- Cambiar roles, precios, cálculos financieros, SMTP/cola o reglas de reportes.
- Traducir contenido libre, pies de correo personalizados o portales externos.
- Migrar retrospectivamente texto libre histórico.

## 8. Actores involucrados

- Usuario autenticado
- Administrador autorizado
- Destinatario de comunicación

## 9. Precondiciones

- Slices 02 a 05 terminados y glosario estable.
- Acceso de prueba a funciones habilitadas y transporte de correo controlado.

## 10. Entradas necesarias

- Preferencia del usuario/destinatario y catálogos de los módulos.
- Plantillas de app, reportes y contratos de exportación existentes.
- Inventario de funcionalidades habilitadas.

## 11. Flujo operativo paso a paso

1. **Localizar administración:** Convertir configuración y superficies administrativas respetando visibilidad de roles y flags.
2. **Localizar reportes:** Traducir títulos, leyendas, períodos y documentos para personas sin alterar consultas ni valores.
3. **Localizar comunicaciones:** Resolver idioma del destinatario al construir asunto/cuerpo; preservar mecanismos actuales de envío/reintento.
4. **Verificar salidas:** Comprobar documento localizado, archivo de intercambio y comunicación a destinatario de idioma distinto al emisor.

## 12. Salidas esperadas

- Administración/dashboard/reportes bilingües.
- Correos y notificaciones localizados por destinatario.
- Clasificación y comprobación de compatibilidad de salidas.

## 13. Reglas de negocio aplicables

- RF-06, RF-07 y RF-09.
- Correo usa idioma conocido del destinatario; sin preferencia, en; no inferir por dirección de correo.
- Reporte para personas usa idioma del solicitante; intercambio conserva identificadores/esquema/valores.
- Localizar presentación monetaria no convierte moneda ni recalcula importes.
- No alterar contenido libre ni permisos.

## 14. Validaciones

- Smoke de configuración y vista administrativa representativa en en/es usando roles ya existentes.
- Correo representativo a destinatario con idioma diferente al emisor y a destinatario sin preferencia; verificar asunto/cuerpo.
- Verificar plantillas restantes mediante renderizado y paridad de catálogos, sin enviar un correo real por cada plantilla.
- Comparar datos/totales del reporte representativo y encabezados/textos localizados.
- Reimportar archivo de prueba del formato afectado o validar su contrato, según el alcance real del cambio.
- Comprobar notificación de sistema en ambos idiomas y conservar datos/firmas personalizadas.

## 15. Manejo de errores o edge cases

- Destinatario sin User.language conocido: respaldo en inglés.
- Fallo de envío mantiene comportamiento de reintento/error existente; no cambiar idioma al reintentar un mensaje ya renderizado.
- Archivos con esquema requerido por importadores no traducen sus cabeceras contractuales.
- Texto histórico de sistema debe inventariarse: elegir representación compatible sin reescribir contenido libre.

## 16. Criterios de aceptación

- 06-AC1: configuración y superficies administrativas habilitadas inventariadas están localizadas.
- 06-AC2: correos nuevos usan idioma del destinatario, incluido respaldo y asunto.
- 06-AC3: reportes/documentos localizados conservan datos y totales.
- 06-AC4: archivos de intercambio conservan compatibilidad comprobada.
- 06-AC5: notificaciones de sistema tienen presentación localizada; contenido libre y permisos permanecen intactos.
- 06-AC6: inventario de cobertura completa todas las superficies pendientes de los slices anteriores, sin exclusiones silenciosas.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Vocabulario/catálogos operativos y resolución por destinatario.
- Técnica: apps/webapp/app/routes/\_layout+/settings\*
- Técnica: apps/webapp/app/routes/\_layout+/account-details\*
- Técnica: apps/webapp/app/routes/\_layout+/admin-dashboard+/
- Técnica: apps/webapp/app/modules/reports/
- Técnica: apps/webapp/app/emails/
- Técnica: apps/webapp/app/utils/csv.server.ts
- Externa: Entrega de correo de prueba ya configurada

## 18. Depende de slices

- [02-slice](02-slice.md)
- [03-slice](03-slice.md)
- [04-slice](04-slice.md)
- [05-slice](05-slice.md)

## 19. Riesgos / decisiones abiertas

- Localizar CSV indiscriminadamente puede romper reimportación.
- Mensajes compartidos entre destinatarios no deben adoptar idioma del emisor.
- Notificaciones históricas pueden almacenar texto final: inventariar su representación antes de afirmar cobertura.

## 20. Pendientes / preguntas abiertas

- Durante implementación, clasificar formatos concretos y mecanismos de notificación existentes; conservar contratos y contenido libre conforme al spec.

## 21. AI Execution Profile

### 06-UI — alcance actual

- **Profile:** BALANCED.
- **Preferred model:** GPT-5.6 Terra (`gpt-5.6-terra`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / High.
- **Switch Benefit:** LOW si continúa desde 05; conservar Terra/High evita alternancias innecesarias.
- **Model Gate required:** no.
- **Review mode:** N2 dirigido a administración, visibilidad, reportes, totales, documentos, exportaciones y notificaciones dentro de la aplicación.
- **Reason:** el trabajo actual excluye correo, pero cruza superficies administrativas y contratos de exportación; necesita mayor razonamiento sin justificar todavía ADVANCED.

### 06-Mail — alcance diferido

- **Profile:** ADVANCED.
- **Preferred model:** GPT-5.6 Sol (`gpt-5.6-sol`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Terra (`gpt-5.6-terra`) / XHigh.
- **Switch Benefit:** HIGH al reanudarlo por resolución de idioma por destinatario, jobs/reintentos y entrega externa.
- **Model Gate required:** sí al activar este alcance si la configuración suficiente no está confirmada.
- **Review mode:** N3 dirigido a aislamiento por destinatario, contenido renderizado, reintentos y fallos parciales.
- **Reason:** los correos fueron diferidos explícitamente y no deben forzar el costo de Sol durante la traducción de la interfaz.
