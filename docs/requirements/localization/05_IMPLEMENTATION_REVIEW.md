# Implementation Review

## Inputs reviewed

- **Review mode:** cuatro reviews dedicados N3 recibidos el 2026-09-21 sobre los
  cambios no confirmados del working tree.
- **Reviewed base / HEAD / diff identity:** base `95c6e7c05`; cambios staged,
  unstaged y archivos nuevos.
- **Directed correction rounds:** 4. La cuarta fue la excepción de cierre
  anti-bucle autorizada explícitamente y se limitó a F18, sin otro re-review.
- **Current gate:** el re-review final no reabrió F14–F17. Detectó un defecto
  directamente introducido por F14 (F18) y dos gaps preexistentes fuera del
  alcance permitido para esta ronda (F19–F20). El loop queda detenido y sujeto
  a una decisión de cierre finita.

## Findings

| ID  | Prioridad | Hallazgo                                                     | Corrección aplicada                                                                                                                      | Evidencia local                                            | Estado                   |
| --- | --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| F01 | P1        | El root loader no se revalidaba al establecer una sesión     | Se reconocen acciones de login, OTP, callback OAuth e invitación, incluida la salida del callback                                        | `revalidation.test.ts`: transiciones positivas y negativas | VERIFICADO_CERRADO       |
| F02 | P2        | Login/OTP ignoraban errores de `getUserById` al aprovisionar | Se valida `error`, se evita crear el usuario ante fallo y se usa idioma de request validado cuando metadata no contiene idioma           | tests de aprovisionamiento login/OTP                       | VERIFICADO_CERRADO       |
| F03 | P2        | Onboarding omitía `User.language`                            | Loader y action seleccionan `language` y aplican cuenta > cookie > navegador                                                             | test con cuenta `es` y cookie/header `en`                  | VERIFICADO_CERRADO       |
| F04 | P2        | Fallos del servicio Auth llegaban en inglés                  | Los servicios etiquetan fallos estables y login, OTP, registro, reenvío y onboarding los traducen en el borde de ruta                    | tests de login y envío OTP en español                      | VERIFICADO_CERRADO       |
| F05 | P2        | La reconciliación descartaba errores devueltos por Supabase  | El reconciliador devuelve `synced`, `pending` o `skipped`; login/OTP mantienen sesión y muestran aviso localizado cuando queda pendiente | tests del reconciliador y redirect de login                | VERIFICADO_CERRADO       |
| F06 | P2        | `Accept-Language` ignoraba pesos y `q=0`                     | Se validan pesos, se excluye `q=0` y se ordena por calidad conservando orden en empates                                                  | casos `fr,es;q=0,en;q=0.8` y preferencia ponderada         | VERIFICADO_CERRADO       |
| F07 | P2        | El único caller de `timeAgo` forzaba inglés                  | El componente de notas pasa el idioma activo de i18next                                                                                  | test de componente con tiempo relativo en español          | VERIFICADO_CERRADO       |
| F08 | P1        | Guardar idioma podía vaciar nombres de miembros del equipo   | `updateUser` solo propaga el nombre cuando el payload contiene campos de nombre                                                          | test de actualización exclusiva de `language`              | VERIFICADO_CERRADO       |
| F09 | P2        | Logout conservaba el idioma de la cuenta en el root cacheado | `/logout` se reconoce como transición de sesión y fuerza revalidación                                                                    | caso positivo en `revalidation.test.ts`                    | VERIFICADO_CERRADO       |
| F10 | P2        | Un throw de Supabase convertía un guardado local en error    | El action usa el reconciliador tolerante a errores y conserva cookie, éxito local y aviso `languageSyncPending`                          | test de respuesta de éxito parcial                         | VERIFICADO_CERRADO       |
| F11 | P2        | El rechazo por dominio SSO permanecía en inglés              | `validateNonSSOSignup` adjunta un código estable y los bordes Auth lo traducen                                                           | tests del helper real y ruta OTP en español                | VERIFICADO_CERRADO       |
| F12 | P2        | Invitaciones autenticadas ignoraban `User.language`          | Loader y action resuelven cuenta > cookie > navegador para sesiones autenticadas                                                         | test con cuenta `es` y cookie/header `en`                  | VERIFICADO_CERRADO       |
| F13 | P3        | El ejemplo `MMM_DD_YYYY` español mostraba día primero        | El ejemplo ahora conserva orden mes/día/año y se distingue de `DD_MMM_YYYY`                                                              | aserciones de catálogo para ambos formatos                 | VERIFICADO_CERRADO       |
| F14 | P1        | Middleware bloquea `/api/language` para visitantes           | `/api/language` se declara público sin omitir sesión/refresh; una prueba atraviesa el middleware como visitante                          | `server/app.test.ts`                                       | VERIFICADO_CERRADO       |
| F15 | P2        | Selector autenticado solo cambia cookie                      | El action distingue visitante/cuenta: persiste `User.language`, cookie y metadata Auth con aviso de fallo parcial                        | `api+/language.test.ts`                                    | VERIFICADO_CERRADO       |
| F16 | P2        | Callbacks SSO no reconcilian metadata de idioma              | Los callbacks web y mobile reconcilian metadata después de resolver al usuario; web conserva sesión y expone estado pendiente            | `oauth-callback.language.test.ts`                          | VERIFICADO_CERRADO       |
| F17 | P2        | Fallo de proveedor SSO se muestra en inglés                  | `signInWithSSO` adjunta código estable y el borde SSO localiza el error                                                                  | tests de servicio y ruta SSO en español                    | VERIFICADO_CERRADO       |
| F18 | P2        | Endpoint público confía en una sesión opcional no validada   | Se valida el refresh token antes de cualquier escritura; sesión revocada se destruye y continúa como visitante con cookie-only           | 3 casos del action + middleware público                    | VERIFICADO_CERRADO       |
| F19 | P2        | Catch de callbacks SSO conserva ciertos errores en inglés    | Implementado después del cierre: código estable preservado por el servicio y localización en callbacks web/mobile                        | tests de servicio y ambos callbacks                        | IMPLEMENTADO_POST_REVIEW |
| F20 | P2        | Título de invitación permanece en inglés                     | Implementado después del cierre: loader devuelve título localizado y `meta` lo consume                                                   | test de meta en español                                    | IMPLEMENTADO_POST_REVIEW |

## Evidence after correction

- TypeScript dirigido con heap 6144 MB después de F08–F13: PASS, código 0.
- ESLint dirigido sobre archivos modificados de la segunda ronda: PASS, código 0.
- Vitest de regresión dirigida consolidada: 21 archivos, 135 tests: PASS,
  código 0. Incluye pruebas explícitas de F08–F13 para `updateUser`, logout,
  fallo parcial de sincronización, etiquetado/localización SSO, loader/action de
  invitaciones y formatos de fecha.
- `git diff --check`: PASS, código 0.
- Tercer review independiente: F01–F13 no fueron reabiertos; identificó F14–F17
  con evidencia directa en middleware, selector, callbacks SSO y manejo de
  errores.
- Tercera y última ronda autorizada: TypeScript con heap 6144 MB, ESLint
  dirigido y Prettier dirigido: PASS, código 0.
- Vitest específico de F14–F17: 5 archivos, 13 tests: PASS, código 0.
- Vitest de regresión i18n/Auth consolidada: 24 archivos, 142 tests: PASS,
  código 0. Incluye los 21 archivos de la ronda anterior y tres archivos nuevos
  para middleware, action de idioma y callbacks SSO.
- `git diff --check`: PASS, código 0 después de la tercera ronda.
- Re-review final: F14–F17 no fueron reabiertos. F18 se admite porque deriva
  directamente de hacer público `/api/language`; F19–F20 se difieren porque ya
  eran observables antes de la última corrección y no cumplen la regla para
  agregar nuevos bloqueantes en un re-review limitado.
- Cierre anti-bucle autorizado para F18: prueba específica de action y
  middleware, 2 archivos/4 tests: PASS. Cubre visitante, sesión válida, sesión
  revocada y acceso público.
- Regresión i18n/Auth posterior a F18: 24 archivos/143 tests: PASS. TypeScript
  con heap 6144 MB, ESLint dirigido y Prettier dirigido: PASS.
- La sesión revocada destruye la sesión local, conserva únicamente la cookie de
  idioma y no invoca `updateUser` ni la sincronización privilegiada de metadata.
- Implementación posterior del backlog F19–F20: pruebas dirigidas 3
  archivos/28 tests PASS; regresión i18n/Auth 24 archivos/146 tests PASS;
  TypeScript, ESLint y Prettier dirigidos PASS.
- No se ejecutaron build, suite completa, navegador real, correo real, cambios
  remotos de Supabase, commit, push ni deploy.

## Verdict

- **Status:** APROBADO CON NOTAS.
- **Reason:** F01–F18 están verificados y cerrados; F19–F20 fueron implementados
  posteriormente como backlog ordinario sin reabrir el review.
- **Pending:** ninguno para esta ronda de review; no ejecutar otro `/review`.
