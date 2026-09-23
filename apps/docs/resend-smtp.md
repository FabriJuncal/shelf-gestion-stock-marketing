# Resend SMTP para Supabase Auth y Shelf

**Estado:** PENDIENTE

**Prioridad de lanzamiento:** P0 antes de habilitar registro público

**Última revisión documental:** 2026-09-22

## Objetivo

Configurar Resend como proveedor SMTP de:

1. los correos de Supabase Auth: confirmación, OTP y recuperación;
2. los correos transaccionales propios de Shelf enviados con Nodemailer.

La implementación conserva la arquitectura existente. No agrega el SDK de
Resend ni React Email: Supabase usa sus plantillas Go y Shelf ya dispone de un
transporte SMTP en `apps/webapp/app/emails/transporter.server.ts`.

## Motivo del cambio

Este proyecto Supabase Free fue creado después del 3 de junio de 2026. En ese
caso, el proveedor SMTP predeterminado no permite personalizar plantillas Auth y
solo está pensado para pruebas limitadas. Se requiere SMTP personalizado para
habilitar las plantillas bilingües y entregar correos a usuarios externos.

## Decisiones

- Proveedor: Resend.
- Integración: SMTP manual, porque Resend no aparece en **Integrations** del
  Dashboard Supabase de esta organización.
- Dominio inicial: un único subdominio transaccional, por ejemplo
  `mail.example.com`, para reducir tiempo de lanzamiento.
- Credenciales: dos API keys `Sending access`, una para Supabase Auth y otra
  para Shelf. Restringir ambas al dominio verificado cuando Resend lo permita.
- Transporte: SMTPS en `smtp.resend.com:465`.
- Tracking: mantener desactivado el click tracking para Auth; la reescritura de
  enlaces puede invalidar confirmaciones y recuperaciones.

## Precondiciones

- [ ] Cuenta Resend disponible.
- [ ] Control DNS de un dominio o subdominio de envío.
- [ ] Acceso de administrador al proyecto Supabase
      `vpkluswpxegekakcwiyx`.
- [ ] Acceso al proyecto Vercel `shelf-gestion-stock-marketing`.
- [ ] Buzón de prueba autorizado.

No guardar API keys en Git, documentación, tickets, capturas ni chat.

## 1. Verificar el dominio en Resend

1. Abrir <https://resend.com/domains>.
2. Crear un dominio, por ejemplo `mail.example.com`.
3. Agregar en el proveedor DNS exactamente los registros DKIM, SPF y los demás
   registros que muestre Resend.
4. Esperar hasta que Resend muestre el dominio como `Verified`.
5. Desactivar click tracking para el dominio usado por Auth.

No inventar valores DNS ni copiar valores de otro dominio.

## 2. Crear la key exclusiva para Supabase Auth

En **Resend → API Keys → Create API Key**:

```text
Name: shelf-supabase-auth
Permission: Sending access
Domain: dominio verificado
```

Copiar el valor `re_...` en un gestor seguro. Resend no vuelve a mostrar la key
completa.

## 3. Configurar SMTP manual en Supabase

Abrir:

<https://supabase.com/dashboard/project/vpkluswpxegekakcwiyx/auth/smtp>

Activar **Enable custom SMTP** y completar:

```text
Sender name: Shelf
Sender email: auth@mail.example.com
Host: smtp.resend.com
Port: 465
Username: resend
Password: API key shelf-supabase-auth
```

Guardar y comprobar que el Dashboard muestre SMTP personalizado habilitado. Si
el entorno rechazara SMTPS en 465, el fallback permitido por Resend es 587 con
STARTTLS; no cambiar de puerto sin observar primero el error real.

## 4. Respaldar y aplicar las plantillas bilingües

Antes de editar, copiar asunto y cuerpo actuales a un respaldo privado fuera
del repositorio. Luego abrir **Authentication → Emails → Templates** y aplicar:

| Plantilla Supabase | Asunto                                                                                                                                                                 | Fuente versionada                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Confirm sign up    | <code>&#123;&#123; if eq .Data.language "es" &#125;&#125;Confirmá tu cuenta&#123;&#123; else &#125;&#125;Confirm your account&#123;&#123; end &#125;&#125;</code>      | `supabase/templates/auth/confirmation.html` |
| Magic link / OTP   | <code>&#123;&#123; if eq .Data.language "es" &#125;&#125;Tu código de acceso&#123;&#123; else &#125;&#125;Your sign-in code&#123;&#123; end &#125;&#125;</code>        | `supabase/templates/auth/magic-link.html`   |
| Reset password     | <code>&#123;&#123; if eq .Data.language "es" &#125;&#125;Restablecé tu contraseña&#123;&#123; else &#125;&#125;Reset your password&#123;&#123; end &#125;&#125;</code> | `supabase/templates/auth/recovery.html`     |

Confirmar además en **Authentication → Sign In / Providers → Email** que el OTP
tenga seis dígitos, que es el contrato actual de Shelf.

## 5. Crear la key exclusiva para Shelf

Crear otra key en Resend:

```text
Name: shelf-webapp-production
Permission: Sending access
Domain: dominio verificado
```

Usarla como contraseña SMTP en el `.env` de la raíz:

```dotenv
SMTP_HOST="smtp.resend.com"
SMTP_PORT=465
SMTP_USER="resend"
SMTP_PWD="re_REEMPLAZAR_EN_LOCAL"
SMTP_FROM="Shelf <notifications@mail.example.com>"
```

El remitente debe pertenecer al dominio verificado. No agregar
`RESEND_API_KEY`: la aplicación conserva su integración SMTP existente.

## 6. Configurar Vercel

En **Vercel → shelf-gestion-stock-marketing → Settings → Environment
Variables**, crear estas variables para `Production` y para `Preview` si se
probará el PR desplegado:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PWD
SMTP_FROM
```

Los cambios de variables solo se aplican a despliegues nuevos. Hacer primero un
Preview y promover/desplegar a Production únicamente después del smoke test.

## 7. Validación obligatoria

Ejecutar envíos controlados en inglés y español para:

- [ ] registro y confirmación;
- [ ] OTP de usuario existente;
- [ ] recuperación de contraseña.

Para cada envío verificar:

- [ ] asunto y cuerpo en el idioma esperado;
- [ ] OTP de seis dígitos cuando corresponda;
- [ ] enlace con destino válido y sin reescritura por tracking;
- [ ] retorno correcto al flujo Shelf;
- [ ] evento `Delivered` en Resend;
- [ ] ausencia de tokens, API keys y URLs completas de confirmación en la
      evidencia persistida.

## 8. Rollback

Si la entrega falla:

1. detener las pruebas para evitar rate limits y mensajes duplicados;
2. restaurar asunto y cuerpo respaldados;
3. restaurar la configuración SMTP anterior si era funcional;
4. si no existe proveedor alternativo, deshabilitar registro público hasta
   recuperar el correo Auth;
5. conservar la sesión de usuarios ya autenticados y diagnosticar con los
   eventos de Resend y logs Auth de Supabase.

Desactivar SMTP personalizado devuelve el proyecto al proveedor predeterminado,
pero no es un rollback apto para producción pública por sus restricciones.

## Criterio de cierre

Este pendiente puede marcarse completo cuando:

- [ ] dominio verificado;
- [ ] dos keys separadas creadas y almacenadas de forma segura;
- [ ] SMTP de Supabase habilitado;
- [ ] tres plantillas bilingües aplicadas;
- [ ] variables locales y Vercel configuradas;
- [ ] registro, OTP y recuperación pasan en inglés y español;
- [ ] evidencia y rollback quedan registrados sin secretos.

## Referencias

- [Supabase: Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase: Email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase: cambio de plantillas en Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier)
- [Resend: SMTP](https://resend.com/changelog/smtp-service)
- [Vercel: Environment Variables](https://vercel.com/docs/environment-variables)
- Fuentes Auth locales: `supabase/templates/auth/README.md`
