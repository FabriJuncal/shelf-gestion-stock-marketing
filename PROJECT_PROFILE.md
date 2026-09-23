# PROJECT_PROFILE

Actualizado: 2026-09-22. Discovery de proyecto existente, limitado a documentación y lectura del repositorio. Presencia de código/configuración no equivale a funcionalidad verificada en producción.

## Identidad y producto

- **Nombre:** Shelf — gestión de stock y activos; repositorio local `shelf-gestion-stock-marketing`.
- **Modo:** existing. Base open source Shelf.nu, licencia AGPL-3.0 según [README](README.md) y [LICENSE](LICENSE).
- **Propósito:** registrar equipos y otros activos físicos, ubicaciones, responsables, reservas y auditorías; operar con QR/códigos de barras e importación/exportación.
- **Usuarios:** administradores y miembros de equipos; roles de organización Owner, Admin, Base y Self Service. También existen espacios personales.
- **Contexto de negocio:** el upstream soporta uso personal y equipos, niveles de servicio, suscripciones y complementos con Stripe. La monetización y los planes efectivamente habilitados en esta instalación no están verificados; no se asume un nuevo SaaS ni se agregan capacidades comerciales.
- **Mercado/idioma:** el trabajo documentado busca una web usable en inglés y español para usuarios hispanohablantes. No se ha definido aquí un segmento comercial adicional.
- **Trabajo funcional existente:** [Spec 01 — internacionalización](docs/specs/01-spec/spec.md), con siete slices y criterios aprobados consignados en el spec.

## Stack observado

Versiones/rangos **declarados en los manifests actuales**, no una auditoría de dependencias instaladas ni una recomendación de actualización.

| Área               | Tecnología existente                                                                                 | Evidencia                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime y monorepo | Node.js `>=22.20.0`, pnpm `9.15.9`, Turborepo `^2.9.14`                                              | [package.json](package.json), [workspace](pnpm-workspace.yaml), [turbo.json](turbo.json)                   |
| Web                | React `19.2.1`, React Router `7.16.0`, SSR; convenciones de Remix y `remix-flat-routes`              | [manifest web](apps/webapp/package.json), [config Router](apps/webapp/react-router.config.ts)              |
| Build y tipos web  | Vite `^7.3.5`, TypeScript `^6.0.2`                                                                   | [manifest web](apps/webapp/package.json), [Vite](apps/webapp/vite.config.ts)                               |
| UI y estado        | Tailwind CSS `^3.4.19`, Radix UI, Jotai, Zod 3, react-zorm, TanStack Table                           | [manifest web](apps/webapp/package.json)                                                                   |
| Backend            | Hono `^4.12.34`, loaders/actions de React Router, servicios por dominio                              | [servidor](apps/webapp/server/app.ts), [modules](apps/webapp/app/modules)                                  |
| Persistencia       | PostgreSQL/Supabase, Prisma `^6.19.3`, migraciones SQL                                               | [manifest database](packages/database/package.json), [schema](packages/database/prisma/schema.prisma)      |
| Autenticación      | Supabase JS `^2.103.0`, email/contraseña, OTP, confirmación, recuperación y SSO; sesión HTTP en Hono | [auth](apps/webapp/app/modules/auth/service.server.ts), [sesión](apps/webapp/server/session-middleware.ts) |
| Idiomas, en curso  | i18next `24.2.3`, react-i18next `15.4.0`, catálogos EN/ES                                            | [i18n](apps/webapp/app/i18n)                                                                               |
| Mobile             | Expo `~54.0.33`, React Native `0.81.5`, React `19.1.0`, TypeScript `~5.9.3`, Expo Router             | [Companion](apps/companion/package.json)                                                                   |
| Documentación      | VitePress `^1.6.4`                                                                                   | [manifest docs](apps/docs/package.json)                                                                    |
| Correo y trabajos  | Nodemailer `^8.0.9`, React Email, SMTP, pg-boss `^9.0.3`; correos Auth administrados por Supabase    | [mail](apps/webapp/app/emails/mail.server.ts), [scheduler](apps/webapp/app/utils/scheduler.server.ts)      |
| Billing            | Stripe `^22.0.1`, webhooks, tiers y complementos                                                     | [webhook](apps/webapp/app/routes/api+/stripe-webhook.ts), [billing](apps/webapp/app/modules/billing)       |

La descripción histórica de Remix/TypeScript 5 no sustituye los manifests: la web usa React Router 7 y declara TypeScript 6. No se realiza ninguna migración de stack durante esta adopción.

## Arquitectura existente

Monorepo con backend web modular, no una arquitectura de microservicios. La web sirve UI y endpoints; Companion consume capacidades móviles. Flujo habitual: ruta/loader/action → servicio de dominio → cliente Prisma o integración externa.

- `apps/webapp/app/routes/`: grupos `_auth+`, `_welcome+`, `_layout+`, `api+` y `qr+`. Los datos de servidor se resuelven mediante loaders/actions.
- `apps/webapp/app/modules/`: activos, custodia, ubicaciones, kits, reservas, auditorías, reportes, usuarios/organizaciones, billing y otros dominios.
- `apps/webapp/app/components/`, `atoms/` y `utils/`: UI, estado Jotai y utilidades compartidas.
- `apps/webapp/server/`: contexto Hono, autenticación/sesión, protección de rutas, rate limiting y cabeceras.
- `packages/database/`: propietario del schema, migraciones y fábrica de Prisma. La web consume el wrapper [db.server.ts](apps/webapp/app/database/db.server.ts).
- `packages/datetime/`, `packages/labels/`, `packages/permissions/`, `packages/quantity-control/`: contratos reutilizados por web y Companion; conservar compatibilidad entre consumidores.
- `apps/docs/`: guías de desarrollo y arquitectura. `docs/specs/`: planes y slices propios de esta instalación. `tooling/typescript/`: configuración compartida.

## Datos, API e integraciones

- **Datos:** User, Organization y UserOrganization, activos/modelos, categorías, etiquetas, ubicaciones, kits, custodias, reservas, auditorías y eventos. PostgreSQL también contiene índices, triggers y políticas descritos en [database-triggers](apps/docs/database-triggers.md) y [protected-indexes](apps/docs/protected-indexes.md).
- **Aislamiento y permisos:** multi-workspace y roles ya existentes; permisos de aplicación y contexto organizacional. No asumir que usar Prisma garantiza por sí solo todas las restricciones de RLS.
- **API:** rutas de recursos internas, `/api/mobile/*`, SCIM opcional, webhooks Stripe, feeds ICS y notificaciones SSE. No se propone reemplazarlas ni inventar un contrato público nuevo.
- **Archivos:** Supabase Storage a través de [storage.server.ts](apps/webapp/app/utils/storage.server.ts); imágenes, adjuntos y recursos de activos.
- **Integraciones presentes:** Supabase, Stripe, SMTP, Sentry/Pino, Crisp, Clarity/PostHog y mapas/geocodificación. Su configuración efectiva depende del entorno y no fue consultada en esta adopción.
- **Configuración funcional:** [shelf.config.ts](apps/webapp/app/config/shelf.config.ts) y [guía](apps/docs/app-configuration.md); flags de premium, registro, SSO, SCIM y onboarding. Conservar capacidades existentes sin activarlas automáticamente.

## Deployment y configuración

- **Destino documentado de esta instalación:** Vercel con Supabase; [nota AUTH-VERCEL](docs/PRs/auth-supabase-vercel.md) registra una verificación histórica de autenticación. El adaptador [server/vercel.ts](apps/webapp/server/vercel.ts) y el preset de React Router están presentes. No se comprobó la versión actualmente desplegada.
- **Origen conservado:** Docker/Fly.io, scripts de deploy y `.github/workflows/deploy.yml`; documentación en [deployment](apps/docs/deployment.md). La existencia de estos archivos no demuestra que Fly esté activo para este fork.
- **Jobs:** [entry.server.tsx](apps/webapp/app/entry.server.tsx) omite inicializar scheduler/workers cuando `VERCEL` está definido. Antes de depender de recordatorios, reservas programadas o reintentos de correo en producción, verificar qué ejecutor real los atiende. No se prescribe otro proveedor.
- **Variables:** Prisma carga explícitamente `.env` en la raíz desde ambos `prisma.config.ts`. Vite tiene `envDir: "../.."`; por ello no debe generalizarse que `.env.local` es irrelevante para todos los comandos. `start:local` carga `.env`; staging/production tienen scripts explícitos.
- **Nombres relevantes:** `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_PUBLIC`, `SUPABASE_SERVICE_ROLE`, `SESSION_SECRET`, `SERVER_URL`; SMTP/Stripe según funcionalidades. Ningún valor secreto se incluye aquí.
- `.env` y `.env.local` están ignorados por Git según verificación local del discovery. No se leyeron sus valores ni se consultaron servicios externos.

## Testing y convenciones

- Vitest `^2.1.9`, Happy DOM, Testing Library y MSW para web; Playwright configurado para recorridos dirigidos. Companion usa Node test runner y Maestro. Paquetes compartidos tienen sus propias pruebas.
- `.github/workflows/test.yml` contiene lint, tipos, pruebas web/paquetes/Companion y tooling. El job Playwright está comentado: no se considera una cobertura E2E automática activa.
- El comando real `webapp:validate` genera Prisma y ejecuta tests, lint y typecheck en paralelo. **No incluye Prettier ni lint con autofix** en su definición actual, aunque AGENTS lo describa así; `format`/`lint:fix` son comandos separados.
- Usar pnpm. Vitest siempre con `--run`. Tests de rutas en `apps/webapp/test/routes-tests/`, nunca en `app/routes/`; mocks externos con comentario `// why:` y factories reutilizables.
- Conservar convenciones de [AGENTS.md](AGENTS.md), manejo de errores y [ALL_SELECTED_KEY](apps/docs/select-all-pattern.md). Mantener código cliente y módulos `*.server` separados.
- Conventional Commits y PR revisables; no commit sin pedido explícito. No crear worktrees/agentes paralelos por defecto. Preservar cambios preexistentes.
- Esta adopción documental requiere validar enlaces, clasificación y ausencia de cambios de aplicación. No requiere build, DB, regresión funcional ni E2E.

## Integración con AI Software Factory

- Instalación canónica: `/Users/fabrijk/Documents/Work/Proyectos Personales/nika/frameworks/ai-software-factory-v2.3.0-rc.1`.
- La ruta indicada por las instrucciones locales existe y fue consultada para este discovery. No se copia la Factory ni se modifica su instalación.
- Procedimiento: instrucciones locales → [PROJECT_STATE](PROJECT_STATE.md) → requirement activo y su estado si existe → `workflow/00_SHARED_CONTRACT.md` de la instalación canónica → solo workflow/skill de la fase.
- El snippet de Factory revisado ya está cubierto por las instrucciones globales suministradas y por esta política persistida. Se conserva `AGENTS.md` local sin sustitución; no se copia el template genérico encima de sus convenciones.
- La adopción agrega únicamente estos tres documentos. No instala herramientas ni copia la Factory. Knowledge tooling: ninguno agregado.
- **Compatibilidad documental:** conservar `docs/specs/01-spec/` como contrato funcional existente. El estado operativo de internacionalización ya está en `docs/requirements/localization/STATE.md` y enlaza el spec y sus slices sin duplicarlos ni renumerarlos. Para trabajos nuevos usar `docs/requirements/<ticket>/`.
- Clasificaciones de capacidades y mejoras son orientación documentada, no autorización para implementarlas durante este discovery.

## AI Policy

Política recomendada, no declaración de configuración efectiva de la sesión. Catálogo local consultado el 2026-09-22: `config/MODEL_CATALOG.md` de la instalación canónica.

- **Default profile:** BALANCED; modelo preferido GPT-5.6 Terra (`gpt-5.6-terra`), reasoning Medium. Fallback: GPT-5.6 Sol (`gpt-5.6-sol`), Medium, sujeto a disponibilidad/costo.
- **Prioridades:** calidad alta, velocidad media, costo medio; optimizar retrabajo y tiempo total.
- **ECONOMICAL:** GPT-5.6 Luna (`gpt-5.6-luna`), Low, para documentación mecánica o cambios triviales; fallback GPT-5.6 Terra (`gpt-5.6-terra`), Low.
- **ADVANCED:** GPT-5.6 Sol (`gpt-5.6-sol`), High, cuando el riesgo de Auth, permisos, pagos, integridad o concurrencia lo justifique. Fallback GPT-5.6 Terra (`gpt-5.6-terra`), High/XHigh, solo si cubre materialmente el riesgo.
- **Excepción:** GPT-6 Astra (`gpt-6-astra`), High/XHigh, únicamente con necesidad y disponibilidad verificadas.
- **Switch threshold:** HIGH; downgrade solo al cambiar de fase y cuando compense. No se impone un modelo único ni se afirma un cambio de runtime.
- **Review:** N0/N1 verificación propia proporcional; N2 review dedicado recomendado para cambios materiales; N3 review dedicado requerido cuando sea técnicamente posible. Si no es posible, registrar causa y aprobar alternativa antes del cierre. Esto no autoriza agentes paralelos automáticamente.

## Incertidumbres que no bloquean la adopción

Versión/despliegue vivo, estado remoto de migraciones, plantillas y asuntos Auth, flags activos, SMTP/Stripe y ejecutor de jobs no verificados. Las discrepancias documentales y el trabajo de idiomas pendiente se detallan en [PROJECT_STATE](PROJECT_STATE.md). No constituyen evidencia de fallos actuales ni justifican una reescritura.
