# [AUTH-VERCEL] Slice: autenticación Supabase estable en Vercel

## Resumen

Corrige el flujo de confirmación de correo de Supabase y prepara el servidor Remix/Hono para ejecutarse en Vercel sin perder el contexto de autenticación. También evita que respuestas anónimas paralelas sobrescriban una sesión válida y ajusta el pool de Prisma para el entorno serverless. El área de mayor riesgo es la sesión HTTP; se cubre con pruebas unitarias, pruebas de aprovisionamiento y una verificación real del flujo desplegado.

## Tipo de cambio

- [ ] 🚀 Feature
- [x] 🐛 Bugfix
- [x] 📝 Documentación
- [x] ♻️ Refactor
- [x] ⚡ Performance
- [x] 🔒 Security
- [x] 🧪 Tests

## Slice Definition

### Objetivo

Permitir que una persona confirme su correo de Supabase, obtenga una sesión persistente y sea aprovisionada de forma idempotente en Shelf.nu cuando la aplicación se ejecuta en Vercel con PostgreSQL de Supabase.

### Incluye

- [x] Procesamiento del fragmento de confirmación de Supabase en la pantalla de login
- [x] Aprovisionamiento idempotente de usuario, organización y membresía
- [x] Adaptador Hono para Vercel con el contexto requerido por Remix
- [x] Middleware de sesión que no reemite cookies sin cambios
- [x] Configuración del pool de Prisma para cargas serverless
- [x] Pruebas del URL de base de datos, sesión y aprovisionamiento

### Excluye

- [x] Completar o rediseñar el onboarding posterior al primer acceso
- [x] Cambios de esquema o migraciones de base de datos
- [x] Inclusión de secretos o credenciales de producción en el repositorio

## Checklist

### Código

- [x] Tests agregados/actualizados
- [ ] Lint pasa sin errores — los archivos modificados pasan; el lint global conserva un error preexistente en `list-title.tsx`
- [x] Types sin errores
- [x] Build pasa correctamente

### Documentación

- [ ] README actualizado — no fue necesario para este slice
- [ ] Docs de API actualizadas (si aplica) — no aplica
- [ ] CHANGELOG actualizado (si aplica) — no aplica

### Despliegue

- [ ] Migraciones creadas (si aplica) — no aplica
- [x] Variables de entorno documentadas
- [x] Notas de despliegue agregadas

## Cómo Probar (DETTALLADO - OBLIGATORIO)

> **⚠️ IMPORTANTE:** Esta sección debe ser tan detallada que cualquier miembro del equipo pueda probar el feature sin ayuda adicional.

### Precondiciones

Node.js y pnpm disponibles, acceso a un proyecto Supabase con autenticación por correo habilitada, y un despliegue Vercel conectado a ese proyecto. La URL de producción debe estar autorizada como redirect URL en Supabase.

1. **Variables de entorno:**

   ```bash
   DATABASE_URL=<supabase-pooled-postgres-url>
   DIRECT_URL=<supabase-direct-postgres-url>
   SUPABASE_URL=<supabase-project-url>
   SUPABASE_ANON_PUBLIC=<supabase-anon-key>
   SESSION_SECRET=<random-secret>
   ```

2. **Instalar dependencias y generar Prisma:**

   ```bash
   pnpm install --frozen-lockfile
   pnpm db:generate
   ```

3. **Ejecutar las pruebas enfocadas:**

   ```bash
   pnpm --filter @shelf/webapp test -- --run \
     app/database/database-url.server.test.ts \
     server/session-middleware.test.ts \
     server/rate-limit.test.ts \
     test/routes-tests/_auth+/login.provisioning.test.ts
   ```

   Resultado esperado: todas las pruebas finalizan correctamente y Vitest no queda en modo watch.

4. **Validar tipos y build:**

   ```bash
   pnpm turbo typecheck --filter=@shelf/webapp
   pnpm turbo build --filter=@shelf/webapp
   ```

   Resultado esperado: ambos comandos terminan con código 0.

5. **Probar el flujo de confirmación en el navegador:**

   - Abrir `https://shelf-gestion-stock-marketing.vercel.app/signup`.
   - Registrar una dirección de correo nueva.
   - Abrir el correo de Supabase y pulsar **Confirm email address**.
   - Confirmar que la URL termina en `/onboarding`, sin conservar tokens en el fragmento de la barra de direcciones.
   - Recargar la página y confirmar que la sesión continúa activa.
   - Abrir `/assets`; mientras el onboarding esté pendiente, debe responder redirigiendo a `/onboarding` y no a `/login`.

6. **Evidencia obtenida:**
   - El flujo real de confirmación alcanzó `/onboarding` y sobrevivió una recarga.
   - La navegación a `/assets` respondió `302` hacia onboarding.
   - El despliegue de Vercel quedó en estado `READY`.
   - Los logs posteriores no mostraron nuevos errores Prisma `P2024`.
