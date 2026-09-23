# PROJECT_STATE

## Identificación

- **Project:** Shelf — `shelf-gestion-stock-marketing`.
- **Last updated:** 2026-09-22.
- **Status:** internacionalización completa de la webapp EN/ES aprobada; correos y Resend documentados y diferidos.
- **Current phase:** Slice 06-UI en ejecución local; S05 cuenta con cierre y evidencia dirigida.
- **Current focus:** traducir toda la experiencia dentro de la aplicación y preparar una beta cerrada; SMTP, plantillas y envíos de correo quedan en un alcance posterior.
- **Active requirement:** internacionalización EN/ES, contrato en [docs/specs/01-spec/spec.md](docs/specs/01-spec/spec.md) y estado en [docs/requirements/localization/STATE.md](docs/requirements/localization/STATE.md).
- **Current slice:** `06-UI` en progreso; administración, reportes, documentos para personas y notificaciones de interfaz se conectarán a los catálogos sin modificar permisos, datos, totales ni contratos de intercambio.
- **Requirement STATE:** creado y activo; es la fuente operativa para reanudar el trabajo.

## Alcance y autorizaciones

La adopción documental inicial se cerró sin cambiar código. El 2026-09-21 el usuario autorizó reanudar los cambios de aplicación comprendidos en el plan de internacionalización existente. Posteriormente eligió `R`, autorizando inspección, respaldo, configuración alojada de Supabase y correos controlados para cerrar 01–02. La autorización sigue sin incluir commit, push ni deploy. No se aplicó una mutación remota porque el proyecto requiere SMTP personalizado y las credenciales locales disponibles son ficticias.

El 2026-09-22 el usuario seleccionó Resend como proveedor. La integración nativa no aparece en el Dashboard de esta organización, por lo que se usará la configuración SMTP manual oficialmente soportada para Supabase Auth y una API key de `Sending access` separada para el transporte SMTP existente de Shelf; no se agrega SDK ni se cambia arquitectura.

El usuario pidió dejar la ejecución de Resend pendiente y priorizar el lanzamiento. El procedimiento quedó en [apps/docs/resend-smtp.md](apps/docs/resend-smtp.md). Puede avanzarse con validación, PR y Preview, pero Resend sigue siendo P0 antes de abrir registro/OTP/recuperación a usuarios públicos.

El 2026-09-22 el usuario resolvió el alcance de idioma: se completará toda la webapp en inglés y español, incluidos Auth, onboarding, navegación, inventario, reservas, administración, reportes, documentos y mensajes dentro de la interfaz. Se difieren únicamente la infraestructura SMTP, las plantillas alojadas y los correos salientes. Esta separación permite preparar una beta cerrada, pero no habilita registro, OTP ni recuperación por correo para público general hasta completar Resend.

El 2026-09-22 el usuario fijó además el protocolo de model routing: antes de cada slice se debe informar modelo completo + ID, reasoning, fallback/Gate y el mensaje literal de inicio. Cada slice requiere su confirmación explícita `continuar con slice <ID>`; una recomendación persistida no demuestra qué modelo está activo en la sesión.

El 2026-09-22 el usuario reemplazó las confirmaciones intermedias por ejecución autónoma: completar en secuencia todos los slices aprobados sin detenerse mientras no exista una acción/decisión humana real ni una recomendación justificada de cambiar modelo o reasoning. Antes de cada cambio recomendado de modelo o reasoning se debe informar el motivo y esperar la decisión correspondiente. Esta autorización no incluye commits, push, deploy ni configuración externa con credenciales.

El usuario confirmó el 2026-09-22 el aumento de S05 a GPT-5.6 Terra (`gpt-5.6-terra`) / High y reiteró la ejecución autónoma: no pausar por actualizaciones, resúmenes ni aprobaciones intermedias; detenerse solo ante una acción/decisión humana real o cambio de modelo/reasoning. S06-UI conserva Terra / High y por lo tanto no requiere otra decisión.

El spec registra revisión del plan APROBADA y decisiones I18N-01/I18N-02 resueltas. La ejecución local del plan fue autorizada y está en curso; commit, push, cambios remotos, envíos reales y deploy siguen fuera de la autorización vigente.

## Discovery realizado

- Producto de gestión de activos, web React Router 7/Hono, monorepo pnpm/Turborepo, PostgreSQL/Supabase/Prisma; Companion Expo/React Native y documentación VitePress presentes.
- Multi-workspace, roles, inventario, custodia, reservas, auditorías, reportes, Stripe, SMTP y pg-boss ya existen. Clasificación y evidencia en [CAPABILITY_MAP](CAPABILITY_MAP.md).
- [PROJECT_PROFILE](PROJECT_PROFILE.md) documenta arquitectura, stack declarado, convenciones, configuración, pruebas y política de IA.
- Integración documental con la Factory canónica; no copia masiva ni reemplazo de convenciones. Las instrucciones globales recibidas ya contienen el snippet Factory; AGENTS local se conserva sin edición.
- La verificación de inicialización del 2026-09-22 confirmó que `PROJECT_PROFILE.md`, `CAPABILITY_MAP.md`, `PROJECT_STATE.md` y el `STATE.md` activo de localization están presentes. No hay skills específicas bajo `.agents/skills/`.

## Estado funcional encontrado (no equivale a aceptación)

| Slice                                | Evidencia del checkout                                                                                                                                              | Trabajo restante / límite de evidencia                                                                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [01](docs/specs/01-spec/01-slice.md) | Archivos i18n, resolución por cuenta/cookie/navegador, formulario de preferencia, `User.language` nullable y migración `20260916120000_add_user_language` presentes | La documentación marca implementación local. El estado remoto de migración no fue consultado: verificar en modo lectura antes de cualquier aplicación, sin repetir efectos históricos. Faltan evidencias completas de persistencia, SSR y fallo parcial. |
| [02](docs/specs/01-spec/02-slice.md) | Auth, onboarding, bienvenida y planes conectados a en/es; F01–F20 resueltos localmente; fuentes de plantillas versionadas                                           | Configuración/prueba externa de plantillas, asuntos y correos reales; no se afirma cierre remoto.                                                                                                                                                        |
| [03](docs/specs/01-spec/03-slice.md) | Menú de usuario y preferencias regionales parcialmente traducidos                                                                                                   | Navegación, diálogos/tablas, errores, accesibilidad, formatos/glosario y controles de cobertura pendientes.                                                                                                                                              |
| [04](docs/specs/01-spec/04-slice.md) | Estado documental pending                                                                                                                                           | Inventario, custodia, kits, escaneo e importación bilingües.                                                                                                                                                                                             |
| [05](docs/specs/01-spec/05-slice.md) | Estado documental pending                                                                                                                                           | Reservas, calendarios y auditorías bilingües.                                                                                                                                                                                                            |
| [06](docs/specs/01-spec/06-slice.md) | Estado documental pending                                                                                                                                           | Completar administración, reportes, documentos y notificaciones en la interfaz; diferir correos salientes y sus pruebas.                                                                                                                                 |
| [07](docs/specs/01-spec/07-slice.md) | Estado documental pending                                                                                                                                           | Cerrar evidencia y Preview del alcance UI; registrar correo como follow-up y no abrir Auth público antes de Resend.                                                                                                                                      |

## Discrepancias y verificaciones pendientes

1. El spec contiene contexto previo a implementación y una frase «Todos los slices están pendientes», aunque sus estados/código muestran progreso en 01–03. Se registra aquí la diferencia; no se modifica el contrato en esta adopción.
2. No hay evidencia persistida local que permita afirmar el estado remoto actual de la migración. La existencia del SQL no demuestra su ejecución. Próxima verificación: `pnpm --filter @shelf/database exec prisma migrate status`, con conexión del entorno correcto y sin exponer secretos.
3. La nota [AUTH-VERCEL](docs/PRs/auth-supabase-vercel.md) registra un deploy histórico y un lint pendiente en `list-title.tsx`. No se volvieron a ejecutar checks ni se consultó producción; no se presentan como resultados actuales.
4. El preset/adaptador Vercel coexiste con workflows y guías Fly. Workers pg-boss se omiten en Vercel según `app/entry.server.tsx`; no está verificado otro ejecutor. Examinar esa dependencia al validar funcionalidades que usan jobs, sin ampliar automáticamente infraestructura.
5. Los manifests web declaran TypeScript 6 y React Router 7. `validate` ejecuta Prisma/tests/lint/tipos, sin Prettier/autofix. Vite apunta `envDir` a la raíz; Prisma carga `.env` explícitamente. Estas precisiones reemplazan suposiciones generales para futuros comandos.
6. La ruta canónica vigente indicada por `AGENTS.md` es `ai-software-factory-v2.3.0-rc.1`; se consultó su contrato compartido y catálogo, sin copiar ni modificar la Factory.

## Contexto Git a preservar

- Branch observada: `fix/supabase-auth-vercel`; HEAD al relevar: `95c6e7c05` (`fix(auth): support Supabase confirmation on Vercel`).
- Hay cambios staged, unstaged y archivos nuevos de internacionalización, schema, dependencia/lockfile, specs y adopción Factory. Se conservan como un único working tree no confirmado para el review dedicado.
- No hubo commit ni push. `.env` y `.env.local` están ignorados por Git; sus valores no se expusieron.

## Evidencia reciente

- Lectura de manifests, configuración y rutas de servidor, schema, integración Auth/Storage, CI, guías relevantes y spec/slices.
- Snapshot SHA-256 inicial de 2915 archivos existentes no ignorados por Git, para verificar que el discovery no cambia contenido preexistente.
- Verificación local del 2026-09-21: los 2915 archivos del snapshot mantienen el mismo SHA-256; las únicas altas son PROJECT_PROFILE.md, CAPABILITY_MAP.md y PROJECT_STATE.md.
- Comprobación de enlaces y estructura con Node: 106 enlaces locales existentes, 31 capacidades con clasificación válida y los nueve campos requeridos de próxima acción presentes; cero errores. Distribución: 22 KEEP, 4 IMPROVE, 1 WRAP, 2 ADD y 2 IGNORE; ningún reemplazo propuesto.
- `./node_modules/.bin/prettier --check PROJECT_PROFILE.md CAPABILITY_MAP.md PROJECT_STATE.md`: código 0. `git diff --check`: código 0. Las correcciones de esta verificación se limitaron al formato de los nuevos documentos y a dos enlaces a `entry.server.tsx`.
- La adopción documental original no ejecutó tests de aplicación; la evidencia de implementación posterior se registra por separado a continuación.
- Riesgo residual: plantillas/correos externos y recorridos reales pendientes; no se presenta producción como validada.
- Implementación i18n/Auth del 2026-09-21: TypeScript PASS con heap 6144 MB; ESLint dirigido PASS; Vitest dirigido 19 archivos/113 tests PASS; `git diff --check` PASS.
- Corrección de review del 2026-09-21: F01–F07 aplicados; TypeScript y ESLint dirigidos PASS; Vitest de regresión dirigida 19 archivos/109 tests PASS y subconjunto específico 9 archivos/37 tests PASS; `git diff --check` PASS.
- Segunda corrección autorizada del 2026-09-21: F08–F13 aplicados; TypeScript y ESLint dirigidos PASS; Vitest de regresión dirigida consolidada 21 archivos/135 tests PASS con casos explícitos para los seis hallazgos; `git diff --check` PASS.
- Tercer review N3 del 2026-09-21: F01–F13 no fueron reabiertos; F14–F17 son obligatorios y cubren middleware público, persistencia autenticada, reconciliación SSO y localización del error de proveedor.
- Tercera y última ronda autorizada del 2026-09-21: F14–F17 corregidos localmente; TypeScript, ESLint y Prettier dirigidos PASS; Vitest específico 5 archivos/13 tests y regresión consolidada 24 archivos/142 tests PASS; `git diff --check` PASS.
- Cuarto review del 2026-09-21: F14–F17 no reabiertos. F18 se acepta por derivar directamente del endpoint público; F19–F20 se difieren porque eran preexistentes y no pueden ampliar retroactivamente el re-review limitado.
- Cierre anti-bucle del 2026-09-21: F18 valida sesiones opcionales antes de escrituras privilegiadas; TypeScript, ESLint y Prettier dirigidos PASS; prueba específica 2 archivos/4 tests y regresión consolidada 24 archivos/143 tests PASS. Review terminal `APROBADO CON NOTAS`; no se repetirá.
- Backlog local F19–F20 del 2026-09-21: callbacks SSO localizan errores etiquetados y la invitación expone título localizado; pruebas específicas 3 archivos/28 tests y regresión consolidada 24 archivos/146 tests PASS; TypeScript, ESLint y Prettier dirigidos PASS.
- Inspección alojada del 2026-09-21: proyecto Supabase `vpkluswpxegekakcwiyx` `ACTIVE_HEALTHY`; migración Prisma `20260916120000_add_user_language` finalizada el 2026-09-17 y no revertida; `User.language` existe como `public.AppLanguage` nullable; el correo de prueba tiene una fila Auth y una local, ambas con idioma aún `null`.
- Dashboard Auth del 2026-09-21: plan Free creado después del cambio de Supabase del 2026-06-03; SMTP personalizado desactivado y editor bloqueado con «Set up custom SMTP to edit templates». Las cinco variables SMTP del `.env` coinciden exactamente con `.env.example`, por lo que no son credenciales utilizables. No se modificó configuración ni se envió correo.
- Runbook Resend creado el 2026-09-22 con estado `PENDIENTE`, SMTP manual para Supabase, key separada para Shelf, configuración Vercel, pruebas y rollback. El PR personal `#1` está abierto y mergeable, pero contiene solo el commit `95c6e7c05`; los cambios actuales de internacionalización y documentación siguen sin commit y no están en el PR.
- Validación documental del 2026-09-22: enlaces relativos del runbook comprobados, Prettier PASS, `git diff --check` PASS y build VitePress 1.6.4 PASS. No se ejecutó el quality gate ni build de la aplicación en esta tarea documental.
- Model routing del 2026-09-22: los siete slices tienen perfil, modelo exacto, reasoning, fallback, Switch Benefit, Model Gate y modo de review; cobertura documental 7/7, Prettier PASS y `git diff --check` PASS. La configuración efectiva de la sesión no se infirió.
- Inicialización Factory verificada el 2026-09-22: perfiles, capacidades y estado central presentes; el mapa conserva 31 filas con clasificación válida. Esta comprobación fue documental y no modificó arquitectura, stack ni código de aplicación.
- Evidencia detallada en [CLOSURE_BRIEF S02](docs/requirements/localization/slices/S02/CLOSURE_BRIEF.md). Build, suite completa, navegador, migración remota, correos reales y deploy no ejecutados.

## Política operativa

Usar la AI Policy de [PROJECT_PROFILE](PROJECT_PROFILE.md): BALANCED como preferencia general, ECONOMICAL/ADVANCED según fase y riesgo; no hay configuración efectiva de sesión ni costo inferidos. Perfiles son recomendaciones y no cambios realizados del runtime. Review/testing proporcionales. Nuevos requirements planificados en `docs/requirements/<ticket>/`; conservar los specs existentes mediante referencias.

## Próxima acción

- **Next action:** completar las superficies administrativas, reportes, documentos para personas y notificaciones de interfaz de S06-UI.
- **Why this is next:** S05 cuenta con cierre local y el usuario autorizó avanzar con la secuencia recomendada; los correos permanecen diferidos.
- **User action required:** false.
- **Decision required:** ninguna.
- **Expected output:** administración, reportes, documentos para personas y notificaciones de interfaz bilingües, sin alterar permisos, datos, totales ni contratos de intercambio.
- **After this:** cerrar la evidencia dirigida de S06-UI y preparar S07; commit, push, Preview y deploy requieren autorización explícita.
- **Blocked by:** ninguno; Resend permanece pendiente y bloquea únicamente la apertura pública de Auth por correo.
- **Runtime limitation:** none.
- **Resume instruction:** continuar S06-UI desde los puntos de entrada de administración y reportes; no alterar permisos, queries, valores internos, totales, CSV ni envíos de correo.
