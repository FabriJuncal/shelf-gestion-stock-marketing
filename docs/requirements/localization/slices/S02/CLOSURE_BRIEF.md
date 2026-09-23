# Closure Brief — S02 acceso y correos de autenticación

## Criteria to verify

- 02-AC1: selector y pantallas de acceso/bienvenida en inglés y español.
- 02-AC2: idioma adjunto antes del primer correo y preservado al aprovisionar.
- 02-AC3: registro, OTP, login y recuperación conservan su comportamiento y
  usan mensajes localizados.
- 02-AC4: recuperación anónima no modifica idioma ni enumera cuentas.
- 02-AC5: plantillas recuperables y enlaces/tokens verificados en el entorno
  alojado.

## Evidence to record

- El diff local desde `95c6e7c05` propaga `language` por registro con
  contraseña, OTP, invitación y nuevo usuario SSO; no cambia mecanismos de
  autenticación ni permisos.
- `apps/webapp/app/i18n/resources.ts` contiene catálogos en/es para Auth,
  onboarding y selección de plan; `welcome` está registrado como namespace.
- `supabase/templates/auth/` contiene fuentes bilingües y un procedimiento de
  respaldo/aplicación. No fueron aplicadas al proyecto alojado.
- La implementación usa `{{ .Data.language }}` y fallback inglés conforme a la
  documentación oficial de Supabase consultada el 2026-09-21.

## Tests to report

- `node --max-old-space-size=6144 ./node_modules/typescript/bin/tsc -p apps/webapp/tsconfig.json --noEmit` — PASS, código 0.
- ESLint dirigido desde `apps/webapp` sobre archivos i18n/Auth/welcome y tests
  unitarios — PASS, código 0.
- Vitest dirigido: 19 archivos, 113 tests — PASS, código 0. Incluye idioma en
  metadata OTP, validación española, aprovisionamiento login/OTP, invitación,
  SSO, recuperación anti-enumeración y onboarding.
- `git diff --check` — PASS, código 0.
- Corrección de F01–F07: TypeScript y ESLint dirigidos PASS; Vitest de
  regresión dirigida 19 archivos/109 tests PASS y subconjunto específico 9
  archivos/37 tests PASS; `git diff --check` PASS.
- Corrección autorizada de F08–F13: TypeScript y ESLint dirigidos PASS; Vitest
  de regresión dirigida consolidada 21 archivos/135 tests PASS, con casos
  explícitos para los seis hallazgos; `git diff --check` PASS.
- Corrección final autorizada de F14–F17: TypeScript, ESLint dirigido y Prettier
  dirigido PASS; Vitest específico 5 archivos/13 tests PASS; regresión dirigida
  consolidada 24 archivos/142 tests PASS; `git diff --check` PASS.
- Cierre anti-bucle de F18: TypeScript, ESLint y Prettier dirigidos PASS;
  prueba específica de sesión opcional 2 archivos/4 tests PASS; regresión
  consolidada 24 archivos/143 tests PASS.
- Backlog F19–F20 posterior al review: TypeScript, ESLint y Prettier dirigidos
  PASS; pruebas específicas 3 archivos/28 tests PASS; regresión consolidada 24
  archivos/146 tests PASS.
- Build, suite completa, navegador y correo real — NOT RUN en este cierre
  parcial.

## Deviations

- La plantilla alojada y los asuntos todavía no se modificaron porque la
  autorización vigente excluye cambios remotos de Supabase y envíos reales.
- La primera invocación directa de ESLint desde la raíz no pudo cargar
  `eslint-plugin-local-rules`; se repitió desde `apps/webapp`, que es el cwd
  requerido por la configuración, y pasó.
- TypeScript requirió ampliar el heap de Node a 6144 MB; con ese límite terminó
  correctamente.

## Risks / pending

- La ronda de review queda terminal en `APROBADO CON NOTAS`: F01–F18 cerrados.
  F19–F20 se implementaron posteriormente como backlog ordinario, sin reabrir
  esa ronda.
- Confirmar plan/SMTP del proyecto Supabase: los proyectos Free nuevos con SMTP
  predeterminado pueden no permitir personalizar plantillas Auth.
- Respaldar y aplicar las tres plantillas, verificar asunto/cuerpo/token y hacer
  recorridos controlados en/es sin registrar tokens.
- Este brief acredita preparación local, no cierre del slice ni despliegue.

## Hosted inspection — 2026-09-21

- Supabase `vpkluswpxegekakcwiyx` está `ACTIVE_HEALTHY` y la migración Prisma
  `20260916120000_add_user_language` figura finalizada, sin rollback.
- La columna alojada `User.language` es `public.AppLanguage`, nullable. La
  cuenta de prueba existe una vez en Auth y una vez en la tabla local; ambas
  conservan idioma `null`, como se espera para una cuenta previa.
- El Dashboard confirma plan Free, SMTP personalizado desactivado y edición de
  plantillas bloqueada hasta configurar SMTP. El proyecto fue creado después
  del cambio de Supabase del 2026-06-03 para proyectos Free nuevos.
- Las cinco variables SMTP del `.env` coinciden exactamente con
  `.env.example`; no son credenciales utilizables. No se guardó configuración,
  no se transmitieron secretos y no se enviaron correos.
- Próxima evidencia: habilitar SMTP con credenciales reales mantenidas fuera del
  chat, respaldar la configuración editable, aplicar las tres fuentes y probar
  registro, OTP y recuperación en ambos idiomas sin registrar tokens.
