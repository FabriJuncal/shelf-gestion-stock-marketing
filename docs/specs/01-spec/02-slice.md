# 02-slice — Acceso y correos de autenticación en ambos idiomas

## 1. Nombre del slice

02-slice — Acceso y correos de autenticación en ambos idiomas

Estado: implementación en curso; login, registro, OTP, recuperación, SSO y aceptación de invitación usan el catálogo bilingüe. Siguen pendientes las plantillas externas de Supabase, bienvenida/onboarding y la validación del recorrido real de correo. Orden sugerido: 2.

Especificación: [spec.md](spec.md).

Justificación del corte: Aísla la integración Auth y permite demostrar el idioma desde el primer contacto antes de convertir módulos operativos.

## 2. Objetivo del slice

Completar registro, confirmación, login y recuperación en el idioma elegido.

## 3. Problema puntual que resuelve

Las pantallas y correos de acceso pueden quedar en inglés y el primer correo se emite antes del usuario local.

## 4. Valor observable que entrega

Una persona inicia el registro en español, recibe confirmación en español y vuelve a una pantalla coherente; puede recuperar el acceso en el idioma guardado.

## 5. Alcance específico

Recorridos de autenticación/bienvenida y plantillas Supabase, usando la preferencia del slice 01.

## 6. Qué incluye

- Selector visible antes de login/registro y cookie de visitante.
- Traducir acceso, OTP, confirmación, recuperación, invitación/SSO si están habilitados y bienvenida/onboarding.
- Enviar idioma validado en metadatos de signUp antes del primer correo; copiarlo al aprovisionar User sin sobrescribir elección previa.
- Asunto y cuerpo de correos Supabase, textos de error y continuidad en destinos de enlaces.
- Configurar respaldo para cuentas antiguas y recuperación anónima sin mutar preferencias.

## 7. Qué no incluye

- Cambiar mecanismos de autenticación o controles de seguridad.
- Correos de negocio de la aplicación; corresponden al slice 06.
- Traducir sitios de proveedores externos.
- Agregar un proveedor de correo nuevo por defecto.

## 8. Actores involucrados

- Visitante
- Usuario que confirma/recupera acceso
- Destinatario de invitación

## 9. Precondiciones

- Slice 01 disponible en entorno de prueba.
- Acceso a plantillas Supabase y cuentas/buzones de prueba autorizados.

## 10. Entradas necesarias

- Idioma de visitante/cuenta y metadatos Auth.
- Plantillas actuales, URLs de confirmación/recuperación y configuración de envío.

## 11. Flujo operativo paso a paso

1. **Localizar acceso:** Traducir formularios, validaciones y estados sin modificar las decisiones de autenticación.
2. **Registrar con idioma:** Adjuntar metadatos a signUp antes de emisión; aprovisionar User.language desde el valor validado.
3. **Preparar correos:** Adaptar asunto/cuerpo con respaldo en inglés y conservar semántica de tokens y destinos.
4. **Confirmar y recuperar:** Verificar enlaces reales en ambos idiomas y recuperación según preferencia previamente sincronizada.

## 12. Salidas esperadas

- Pantallas de acceso bilingües.
- Plantillas Auth localizadas y respaldo de configuración anterior.
- Preferencia transferida al usuario aprovisionado y enlaces funcionales.

## 13. Reglas de negocio aplicables

- RF-01, RF-02 a RF-05 en acceso y RF-08/RF-09 para Auth.
- No editar idioma de una cuenta mediante solicitud anónima de recuperación.
- Sin preferencia conocida para correo, usar en; sin usuario local en registro, usar idioma resuelto del signUp.
- Un aprovisionamiento repetido no sobrescribe una elección existente.
- No registrar tokens ni contenido sensible de enlaces en evidencias.

## 14. Validaciones

- Prueba dirigida de metadatos presentes antes de emitir confirmación y copia idempotente al aprovisionar.
- Recorrer registro/confirmación/login y recuperación en en/es con enlaces válidos.
- Verificar asunto/cuerpo, destino y respaldo de cuenta sin metadatos.
- Comprobar mensajes de enlace vencido/invalidado y credenciales inválidas con respuestas de prueba, sin enumerar cuentas.
- Verificar que cookie de visitante no modifica preferencia de una cuenta por recuperar.

## 15. Manejo de errores o edge cases

- Metadato faltante/no soportado: respaldo documentado; no impedir acceso.
- Token vencido: mensaje localizado y acción existente de reenvío.
- Fallo de envío: conservar el comportamiento de error y permitir recuperación existente.
- Si las plantillas no permiten localizar el asunto, resolver el mecanismo en este slice antes de declararlo completo; un hook solo si es necesario.

## 16. Criterios de aceptación

- 02-AC1: selector y todas las pantallas del recorrido de acceso están traducidos y persisten la elección.
- 02-AC2: primer correo tiene idioma elegido antes de crear User local; se preserva al confirmar y aprovisionar.
- 02-AC3: registro/confirmación/login/recuperación funcionan en ambos idiomas con asunto y cuerpo localizados.
- 02-AC4: recuperación anónima no modifica idioma ni revela existencia de cuenta.
- 02-AC5: enlaces y sesión siguen funcionando; pruebas no exponen tokens; plantillas anteriores son recuperables.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Preferencia canónica y fallo parcial definidos en 01.
- Técnica: apps/webapp/app/routes/\_auth+/
- Técnica: apps/webapp/app/routes/\_welcome+/
- Técnica: apps/webapp/app/modules/auth/
- Técnica: apps/webapp/app/modules/user/
- Externa: Supabase Auth y sus plantillas/configuración de envío
- Externa: Buzones de prueba

## 18. Depende de slices

- [01-slice](01-slice.md)

## 19. Riesgos / decisiones abiertas

- Modificar plantillas puede afectar enlaces: mantener tokens y callbacks existentes.
- La capacidad de localizar asuntos debe comprobarse en la configuración real.

## 20. Pendientes / preguntas abiertas

- Confirmar mecanismo de localización de asuntos; documentar elección y usar hook solo si las plantillas resultan insuficientes.

## 21. AI Execution Profile

- **Profile:** ADVANCED.
- **Preferred model:** GPT-5.6 Sol (`gpt-5.6-sol`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Terra (`gpt-5.6-terra`) / XHigh.
- **Switch Benefit:** HIGH por autenticación, tokens, callbacks, metadata y configuración externa de correo.
- **Model Gate required:** no mientras el alcance de SMTP, plantillas y correos reales permanezca diferido; reevaluar al reanudarlo.
- **Review mode:** N3, review dedicado con GPT-5.6 Sol (`gpt-5.6-sol`) / High.
- **Reason:** los formularios visibles ya se localizaron, pero reanudar confirmación, recuperación o plantillas puede afectar acceso y seguridad; no es un lote editorial.
