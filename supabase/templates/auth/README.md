# Supabase Auth templates — English and Spanish

These files are the versioned source for the hosted Supabase Auth templates
used by Shelf. The application writes a normalized `language` value (`en` or
`es`) to `auth.users.user_metadata`; the templates read it as
`{{ .Data.language }}` and deliberately fall back to English.

## Dashboard mapping

| Supabase template | Subject                                                                                         | Body source         |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------- |
| Confirm signup    | `{{ if eq .Data.language "es" }}Confirmá tu cuenta{{ else }}Confirm your account{{ end }}`      | `confirmation.html` |
| Magic link / OTP  | `{{ if eq .Data.language "es" }}Tu código de acceso{{ else }}Your sign-in code{{ end }}`        | `magic-link.html`   |
| Reset password    | `{{ if eq .Data.language "es" }}Restablecé tu contraseña{{ else }}Reset your password{{ end }}` | `recovery.html`     |

## Safe application procedure

1. Export or copy the current subject and body of each hosted template before
   changing it. Keep that export outside the repository if it contains project
   configuration.
2. Confirm that the hosted project allows custom Auth templates. New Free-plan
   projects using Supabase's default SMTP may require custom SMTP first.
3. Set Auth email OTP length to six digits; Shelf validates six-digit codes.
4. Apply each subject and matching HTML body in **Authentication → Email
   Templates**.
5. Send controlled English and Spanish messages for signup, existing-user OTP,
   and recovery. Verify subject, body, six-digit token, and successful return to
   the existing Shelf flow.
6. If any flow fails, restore the previously exported subject/body before
   debugging application code.

Do not paste real tokens or complete confirmation URLs into test evidence.

References:

- <https://supabase.com/docs/guides/auth/auth-email-templates>
- <https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q>
