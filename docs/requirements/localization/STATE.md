# Requirement State — Internacionalización EN/ES

## Identificación

- **Ticket / slug:** localization
- **Title:** Internacionalización de Shelf: inglés y español
- **Status:** in-progress
- **Phase:** slice-06-ui-in-progress
- **Risk level:** N3
- **Last updated:** 2026-09-22

## Decisiones

- **Acceptance criteria:** approved — `docs/specs/01-spec/spec.md`, secciones 8, 9 y 15.2.
- **Selected option:** i18next/react-i18next integrado en la arquitectura existente; preferencia `User.language` + cookie + `Accept-Language`, sin prefijos de URL.
- **Email provider:** Resend seleccionado el 2026-09-22; SMTP manual para Supabase Auth porque la integración nativa no aparece en el Dashboard, más una clave `Sending access` separada para el SMTP existente de Shelf, sin SDK nuevo.
- **Scope amendment:** aprobado por el usuario el 2026-09-22: completar toda la webapp EN/ES y diferir únicamente SMTP, plantillas alojadas y correos salientes. Auth y sus errores dentro de la interfaz siguen dentro del alcance actual.
- **Test profile:** T3, dirigido a persistencia, aislamiento por petición, Auth, migración aditiva y recorridos afectados; sin regresión general ni carga por defecto.
- **Plan version:** `docs/specs/01-spec/spec.md` y slices 01–07 en el working tree del 2026-09-21.
- **Plan review:** approved — revisión proporcional registrada en el spec tras resolver I18N-01 e I18N-02.
- **Human plan approval:** approved — aprobación explícita del usuario previa a la creación y ejecución de slices, persistida aquí el 2026-09-21.
- **Execution authorization:** approved — el usuario autorizó el 2026-09-21 reanudar los cambios de código del plan, las rondas dirigidas registradas y luego eligió `R`, autorizando inspección, respaldo, configuración alojada de Supabase y correos controlados. No incluye commit, push ni deploy.
- **Autonomous slice execution:** approved — el 2026-09-22 el usuario autorizó ejecutar todos los slices aprobados en secuencia, sin confirmaciones intermedias. Solo se detiene por una decisión/acción humana real o antes de un cambio recomendado de modelo/reasoning; no amplía permisos de commit, push, deploy o configuración externa.
- **S05 model decision:** approved — el usuario aprobó `A + High` el 2026-09-22 para continuar con GPT-5.6 Terra (`gpt-5.6-terra`) / High. Reiteró la ejecución autónoma: S06-UI conserva Terra / High y no requiere una nueva detención.
- **Workflow size:** full

## Ejecución

- **Current slice:** 06-UI — activo; brief en `slices/S06/EXECUTION_BRIEF.md`. Excluye correo saliente, SMTP y configuración alojada.
- **Completed slices:** 03 y 04 cerrados localmente; 05 cerrado localmente con evidencia en `slices/S05/CLOSURE_BRIEF.md`; 01 está implementado localmente con evidencia alojada pendiente y 02 tiene cierre parcial en `slices/S02/CLOSURE_BRIEF.md`.
- **Pending slices:** cierre remoto/evidencia 01–02; 06-UI, 07 y 06-Mail diferido.
- **Pending required findings:** ninguno; F19–F20 fueron implementados sin reabrir el review.
- **Implementation review:** `APROBADO CON NOTAS`, terminal; F18 corregido mediante la excepción anti-bucle autorizada y verificado sin otro `/review` — ver `05_IMPLEMENTATION_REVIEW.md`.
- **Review scope/evidence:** base `95c6e7c05`; cuatro reviews sobre `Review uncommitted changes`; cierre anti-bucle de F18 mediante evidencia dirigida.
- **Directed correction rounds:** 4; la cuarta fue una excepción final autorizada, limitada a F18 y sin otro re-review.

## AI Strategy

Los perfiles son recomendaciones de Factory resueltas contra `MODEL_CATALOG.md` v2.2.2, verificado el 2026-09-20. No describen el modelo activo de la sesión.

### Planning

- **Profile:** BALANCED
- **Preferred model:** GPT-5.6 Terra
- **Model ID:** `gpt-5.6-terra`
- **Reasoning:** medium
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / medium

### Implementation routing

No se usa un único modelo para todo el requirement. Las recomendaciones por slice son:

| Slice / fase                                            | Perfil   | Modelo y reasoning                       | Switch Benefit | Gate                                             |
| ------------------------------------------------------- | -------- | ---------------------------------------- | -------------- | ------------------------------------------------ |
| 01 — preferencia, migración y Auth metadata             | ADVANCED | GPT-5.6 Sol (`gpt-5.6-sol`) / High       | HIGH           | Solo si se reabre trabajo material               |
| 02 — Auth y correo de acceso diferido                   | ADVANCED | GPT-5.6 Sol (`gpt-5.6-sol`) / High       | HIGH           | Al reanudar correo/Auth externo                  |
| 03 — interfaz compartida y formatos                     | BALANCED | GPT-5.6 Terra (`gpt-5.6-terra`) / Medium | HIGH           | Sí, antes de la fase 03–04 si no está confirmado |
| 04 — inventario                                         | BALANCED | GPT-5.6 Terra (`gpt-5.6-terra`) / Medium | LOW            | No; conservar configuración de 03                |
| 05 — reservas, calendarios y auditorías                 | BALANCED | GPT-5.6 Terra (`gpt-5.6-terra`) / High   | MEDIUM         | No; escalamiento suave                           |
| 06-UI — admin, reportes, documentos y notificaciones UI | BALANCED | GPT-5.6 Terra (`gpt-5.6-terra`) / High   | LOW            | No; conservar configuración de 05                |
| 06-Mail — correos salientes diferidos                   | ADVANCED | GPT-5.6 Sol (`gpt-5.6-sol`) / High       | HIGH           | Sí al reanudar si no está confirmado             |
| 07 — cierre, rollback y publicación                     | ADVANCED | GPT-5.6 Sol (`gpt-5.6-sol`) / High       | HIGH           | Sí al activar si no está confirmado              |

GPT-5.6 Luna (`gpt-5.6-luna`) / Low solo se recomienda para lotes mecánicos sustanciales de catálogos o documentación cuando el inventario, glosario y patrón ya estén fijados; no para loaders/actions, formatos, calendarios, permisos, Auth ni publicación. GPT-6 Astra (`gpt-6-astra`) no está justificado por la evidencia actual.

### Protocolo obligatorio antes de cada slice

Por instrucción explícita del usuario del 2026-09-22, antes de comenzar cualquier slice el agente debe:

1. identificar el slice y la tarea inmediata;
2. indicar nombre completo e ID exacto del modelo recomendado;
3. indicar el reasoning recomendado;
4. indicar el fallback y si existe un AI Model Gate real;
5. proporcionar el mensaje literal que el usuario debe enviar para autorizar el inicio;
6. no comenzar el slice hasta recibir ese mensaje;
7. no afirmar que el runtime cambió de modelo: ante una sesión nueva o Gate HIGH, pedir `/status` y, si corresponde, `/model`.

Mensajes de inicio canónicos:

- `continuar con slice 01`
- `continuar con slice 02`
- `continuar con slice 03`
- `continuar con slice 04`
- `continuar con slice 05`
- `continuar con slice 06-UI`
- `continuar con slice 06-Mail`
- `continuar con slice 07`

Aunque dos slices consecutivos compartan modelo, el agente vuelve a informar la configuración antes del siguiente slice. No repite `/model` si la configuración suficiente ya fue confirmada en la misma sesión/fase y no existe evidencia de cambio.

### Review

- **Profile:** ADVANCED
- **Preferred model:** GPT-5.6 Sol
- **Model ID:** `gpt-5.6-sol`
- **Reasoning:** high
- **Dedicated review:** required para el cierre N3 cuando el runtime lo permita

### Switch policy

- **Switch threshold:** HIGH
- **Current phase switch benefit:** HIGH para iniciar la fase extensa 03–04 con GPT-5.6 Terra (`gpt-5.6-terra`) / Medium; la configuración efectiva de la sesión es desconocida hasta verificarla.
- **Escalation triggers:** cambios de autenticación/autorización, pérdida o sobrescritura de preferencias, migración incompatible, divergencia entre Supabase Auth y PostgreSQL, o debugging ambiguo del flujo real de correo.
- **Downgrade opportunities:** lotes mecánicos sustanciales de claves o documentación después de fijar el patrón; no cambiar por tareas cortas ni bajar para volver a subir inmediatamente.
- **Why these profiles:** Auth, correo y publicación conservan ADVANCED; la traducción funcional 03–06-UI usa Terra para reducir latencia y costo, elevando reasoning donde fechas, reportes o contratos lo exigen.
- **Estimated AI consumption:** medium para 03–06-UI y high para 06-Mail/07; no es una autorización de gasto ni una medición de la sesión.
- **Catalog verified date:** 2026-09-20

## Progreso

### Completed

- Plan y siete slices creados y revisados.
- Base i18n local presente: catálogos en/es, resolución de idioma, selector, cookie y columna/migración aditiva.
- Cobertura inicial local en acceso y preferencias regionales.
- Adopción documental de AI Software Factory completada.
- Model Gate N3 confirmado por el usuario y ejecución local de Auth autorizada.
- Propagación de idioma implementada para OTP, contraseña/invitación y nuevos usuarios SSO.
- Pantallas de Auth, onboarding, bienvenida y selección de plan conectadas al catálogo en/es.
- Fuentes versionadas de plantillas Supabase Auth y procedimiento de rollback creados en `supabase/templates/auth/`.
- Evidencia dirigida local: TypeScript, ESLint y 113 tests aprobados.
- Review N3 recibido con siete findings obligatorios y una ronda dirigida aplicada: revalidación post-Auth, metadata/provisioning, precedencia de onboarding, errores Auth localizados, fallo parcial de sincronización, negociación `Accept-Language` y tiempo relativo.
- Evidencia posterior a la corrección: TypeScript y ESLint PASS; 19 archivos/109 tests de regresión dirigida y 9 archivos/37 tests específicos PASS; `git diff --check` PASS.
- Segundo review N3 recibido; el usuario autorizó aplicar sus seis hallazgos. F08–F13 corrigen integridad de nombres al guardar idioma, revalidación en logout, fallo parcial por throw de Supabase, localización de dominio SSO, precedencia de cuenta en invitaciones y el ejemplo español mes/día/año.
- Evidencia posterior a F08–F13: TypeScript y ESLint PASS; regresión dirigida consolidada de 21 archivos/135 tests, con casos explícitos para los seis hallazgos; `git diff --check` PASS.
- Tercer review N3 registrado: F01–F13 no fueron reabiertos; F14–F17 detectan bloqueo del selector visitante por middleware, persistencia incompleta del selector autenticado, reconciliación ausente en callbacks SSO y error de proveedor SSO sin localizar.
- Tercera y última ronda autorizada aplicada: `/api/language` público con sesión conservada, persistencia autenticada completa, reconciliación en callbacks SSO y error de proveedor localizado.
- Evidencia posterior a F14–F17: TypeScript, ESLint y Prettier dirigidos PASS; prueba específica 5 archivos/13 tests y regresión consolidada 24 archivos/142 tests PASS; `git diff --check` PASS.
- Cuarto review dedicado: F14–F17 no reabiertos; F18 aceptado por derivar directamente de F14. F19–F20 diferidos por ser gaps preexistentes que no cumplen la regla de nuevos hallazgos del re-review limitado.
- F18 cerrado: `/api/language` valida la sesión opcional antes de escribir, destruye sesiones revocadas y conserva acceso cookie-only. Prueba específica 2 archivos/4 tests y regresión consolidada 24 archivos/143 tests PASS; TypeScript, ESLint y Prettier dirigidos PASS.
- F19–F20 implementados: errores etiquetados de callbacks SSO se localizan en web/mobile y el título de invitación deriva del loader localizado. Pruebas específicas 3 archivos/28 tests y regresión consolidada 24 archivos/146 tests PASS; TypeScript, ESLint y Prettier dirigidos PASS.

### In progress

- Slice 01: migración alojada verificada; quedan las pruebas funcionales alojadas que dependen del recorrido Auth.
- Slice 02: review y backlog local cerrados; configuración alojada bloqueada hasta disponer de SMTP real.
- Slice 03: implementación local cerrada; cobertura de navegación, componentes compartidos, accesibilidad y formatos regionales registrada en `slices/S03/CLOSURE_BRIEF.md`.
- Slice 04: cierre local documentado en `slices/S04/CLOSURE_BRIEF.md`; incluye inventario, custodia no asociada a reserva, QR/escáner base e importación. Los drawers de reservas corresponden a S05.
- Slice 06-UI: en ejecución con el perfil BALANCED recomendado, GPT-5.6 Terra (`gpt-5.6-terra`) / High; Switch Benefit LOW y sin Model Gate. Comprende administración, reportes, documentos para personas y notificaciones de interfaz; no comprende correo saliente.
- S06-UI, lote inicial: catálogo `reports`, índice de reportes, estados vacíos, indicador de actualización y períodos visibles localizados. Las queries, permisos, exportación CSV y datos de reporte no se modificaron.
- S06-UI, lote administrativo: pestañas y títulos SSR de configuración/cuenta, cabeceras de configuración general y reservas, listado de campos personalizados (incluidos estados y pluralización) y cabeceras de modelos de activos localizados. Límites de plan, permisos, acciones y datos se conservaron.

### Pending

- Ejecutar el runbook [Resend SMTP](../../../apps/docs/resend-smtp.md), documentado con estado `PENDIENTE` y diferido por decisión del usuario.
- Verificar o configurar plantillas/asuntos bilingües de Supabase mediante una acción remota autorizada por separado.
- Recorrer correos controlados de registro OTP y recuperación en en/es sin exponer tokens.
- Completar S06-UI y cerrar su evidencia dirigida; después preparar S07, manteniendo los criterios de correo explícitamente diferidos y sin declarar Auth público listo.

### Hosted validation evidence

- Proyecto Supabase enlazado `vpkluswpxegekakcwiyx`: estado `ACTIVE_HEALTHY`, plan Free, creado el 2026-09-16.
- `_prisma_migrations` confirma `20260916120000_add_user_language` finalizada el 2026-09-17 y no revertida; `User.language` es `public.AppLanguage`, nullable.
- Existe una cuenta Auth y una fila local para `juncalfabri@gmail.com`; ambas conservan idioma `null`, caso compatible para usuario previo.
- Dashboard Auth muestra SMTP personalizado desactivado y bloquea la edición de plantillas hasta configurarlo, comportamiento consistente con el cambio de Supabase del 2026-06-03 para proyectos Free nuevos.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PWD` y `SMTP_FROM` en `.env` coinciden exactamente con `.env.example`; no se transmitieron ni se guardaron. No se enviaron correos.

## Próxima acción

- **Next action:** iniciar S06-UI con Terra / High, sin incluir los correos diferidos.
- **Why this is next:** S05 cuenta con cierre local y evidencia dirigida en `slices/S05/CLOSURE_BRIEF.md`.
- **User action required:** false
- **Decision required:** ninguna.
- **Expected output:** administración, reportes, documentos y notificaciones de interfaz bilingües.
- **After this:** cerrar S06-UI y solicitar el Gate de modelo para S07.
- **Blocked by:** ninguno; Resend diferido bloquea solo registro/OTP/recuperación públicos.
- **Runtime limitation:** none.

## Decision Boundary

- **Decision needed:** ninguna durante S05.
- **Execution handoff:** S05 usa GPT-5.6 Terra (`gpt-5.6-terra`) / High aprobado; fallback GPT-5.6 Sol (`gpt-5.6-sol`) / High si aparece un gate real.
- **Simple response format:** no aplica.

## Reanudación

- **Resume instruction:** continuar S06-UI desde el brief, preservando permisos, queries, valores internos, totales, contratos CSV y contenido libre; no modificar correo saliente ni configuración externa.

## Bloqueos

### Blocking

- Ninguno en la ronda de review cerrada.

### Non-blocking

- Plantillas Supabase verificadas como bloqueadas por falta de SMTP personalizado; no guardar los placeholders actuales.
- Working tree con cambios previos staged/unstaged; conservarlos y no confirmar commits sin pedido explícito.

## Evidencia relevante

- TypeScript con heap 6144 MB: PASS, código 0 después de la corrección.
- ESLint dirigido desde `apps/webapp`: PASS, código 0 después de la corrección.
- Vitest de regresión dirigida consolidada: 21 archivos y 135 tests PASS después de F08–F13, con casos explícitos para los seis hallazgos.
- Después de F14–F17: TypeScript, ESLint y Prettier dirigidos PASS; Vitest específico 5 archivos/13 tests y regresión consolidada 24 archivos/142 tests PASS.
- Después de F18: TypeScript, ESLint y Prettier dirigidos PASS; prueba específica 2 archivos/4 tests y regresión consolidada 24 archivos/143 tests PASS.
- Después de F19–F20: TypeScript, ESLint y Prettier dirigidos PASS; pruebas específicas 3 archivos/28 tests y regresión consolidada 24 archivos/146 tests PASS.
- `git diff --check`: PASS, código 0.
- S06-UI, lote inicial: prueba estructural de catálogos `app/i18n/resources.test.ts` PASS (1 prueba) y ESLint dirigido PASS. El typecheck completo no entregó resultado terminal antes del límite de 30 segundos de la herramienta; no se registra como PASS y debe repetirse al cerrar el slice.
- S06-UI, lote administrativo: Prettier, ESLint dirigido, prueba estructural de catálogos (1 prueba) y `git diff --check` PASS. No se repitió el typecheck completo; permanece pendiente para el cierre del slice.
- No se ejecutaron build, suite completa, migraciones/consultas remotas, cambios Supabase, correos reales, commit, push ni deploy.
- Consultas alojadas de solo lectura y Dashboard Auth: PASS para estado del proyecto, migración/columna y diagnóstico SMTP; no hubo mutaciones ni correos reales.
- Runbook `apps/docs/resend-smtp.md`: creado y marcado `PENDIENTE`; enlaces relativos, Prettier, `git diff --check` y build VitePress 1.6.4 PASS el 2026-09-22. No se ejecutaron checks nuevos de aplicación.
- Routing por slice: perfiles y modelos exactos documentados en 01–07; comprobación 7/7, Prettier y `git diff --check` PASS el 2026-09-22. No se afirma cuál es el modelo efectivo de la sesión.
- Slice 03: Vitest dirigido 6 archivos/86 tests PASS; ESLint y Prettier dirigidos PASS; TypeScript completo PASS con heap 6144 MB; `git diff --check` PASS. Build, suite completa y navegador no se ejecutaron en este corte — ver `slices/S03/CLOSURE_BRIEF.md`.
- Slice 04, avance actual: ESLint y Prettier dirigidos PASS; Vitest de catálogo/formulario 2 archivos/12 tests PASS; TypeScript completo PASS con heap 6144 MB. Los tests de tooltip de la unidad previa emitieron advertencias `act(...)` preexistentes, pero finalizaron correctamente. Navegador, build y cierre de S04 aún no ejecutados.
