# 01-slice — Preferencia personal e infraestructura bilingüe

## 1. Nombre del slice

01-slice — Preferencia personal e infraestructura bilingüe

Estado: implementado localmente; pendiente de validación de migración en entorno y despliegue. Orden sugerido: 1.

Especificación: [spec.md](spec.md).

Justificación del corte: La base común se incluye en la primera experiencia demostrable de perfil y habilita todos los módulos posteriores.

## 2. Objetivo del slice

Cambiar y guardar el idioma desde el perfil, con renderizado coherente y sincronización recuperable con Supabase Auth.

## 3. Problema puntual que resuelve

No existe preferencia de idioma ni una infraestructura compartida para traducir servidor y cliente.

## 4. Valor observable que entrega

En desarrollo/preview, una persona cambia Español / English en Idioma y región, ve ese formulario traducido y conserva su elección al recargar.

## 5. Alcance específico

Entrega vertical mínima: esquema, resolución, catálogos, renderizado y formulario de perfil; desbloquea la conversión de los demás módulos.

## 6. Qué incluye

- Instalar i18next/react-i18next compatibles mediante pnpm y crear catálogos en/es por módulo.
- Migración aditiva nullable de User.language con validación en/es, propiedad de @shelf/database.
- Resolver cuenta → cookie → Accept-Language → en; normalizar variantes regionales.
- Integrar root loader, entradas servidor/cliente, lang del documento y acción de preferencia con revalidación.
- Selector y traducción de la sección Idioma y región como pantalla piloto.
- Actualizar User.language, cookie independiente y copia en metadatos Auth; aviso/reintento ante fallo parcial y reconciliación en próxima autenticación.

## 7. Qué no incluye

- Traducir todas las demás pantallas.
- Modificar plantillas de correos Auth; se realiza en 02.
- Desplegar una experiencia parcial como funcionalidad completa.
- Cambiar permisos, moneda, zona horaria o formatos guardados.

## 8. Actores involucrados

- Usuario autenticado
- Visitante como entrada al resolvedor
- Equipo de implementación

## 9. Precondiciones

- Leer spec.md y revisar loaders/sesión y esquema existentes.
- Disponer de base de prueba con usuarios existentes y acceso de prueba a Supabase Auth.

## 10. Entradas necesarias

- User.language nullable, cookie, Accept-Language y selección en/es.
- Preferencias regionales existentes y credenciales de prueba mediante configuración segura.

## 11. Flujo operativo paso a paso

1. **Preparar preferencia:** Crear migración y cliente Prisma; ensayarla en prueba conservando usuarios existentes.
2. **Resolver y renderizar:** Inicializar traducción por petición y compartir idioma/recursos iniciales con el cliente.
3. **Guardar selección:** Validar en/es y usuario de sesión; guardar solo su preferencia y cookie sin sobrescribir preferencias regionales.
4. **Sincronizar Auth:** Actualizar metadatos y devolver estado completo o parcial; si falló la escritura local no declarar éxito.
5. **Actualizar interfaz y recuperar:** Revalidar sin remontar formularios; permitir repetir el mismo valor para reintentar Auth y reconciliar en siguiente autenticación.

## 12. Salidas esperadas

- Preferencia persistida y resultado de sincronización completo o parcial.
- Formulario de perfil traducido y catálogos iniciales.
- Migración aditiva y pruebas de resolución/persistencia.

## 13. Reglas de negocio aplicables

- RF-01 a RF-05 y RF-08; spec 10.1 y 10.2.
- User.language es fuente principal para cuentas existentes; null no bloquea acceso.
- Fallo Auth posterior al guardado no revierte preferencia local ni impide login; sí requiere aviso sin éxito completo.
- Valores inválidos no se persisten; cookie inválida se ignora para resolver.
- La cookie se conserva al cerrar sesión; otra cuenta con preferencia propia tiene prioridad.

## 14. Validaciones

- Unitarias del orden de resolución, variantes es-AR/en-GB, null y entradas inválidas.
- Integración del guardado de la propia preferencia, cookie/revalidación y fallo local/externo.
- Prueba con dos peticiones de idiomas distintos sin contaminación de instancias.
- Componente o navegador: cambio conserva texto ingresado en formulario representativo y coincide con HTML inicial.
- Comprobar en base de prueba que filas existentes permanecen y código anterior tolera columna adicional.

## 15. Manejo de errores o edge cases

- Si falla persistencia local, informar error y no confirmar guardado.
- Si falla Auth, mantener local/cookie, aviso de pendiente y reintento aun con el mismo valor.
- Si falla reconciliación al autenticar, mantener sesión y señalar sincronización pendiente.
- Preferencias inexistentes o no válidas resuelven por la siguiente fuente; no sobrescribirlas por efectos del render.

## 16. Criterios de aceptación

- 01-AC1: en y es se guardan; otros valores no; usuarios anteriores siguen accediendo.
- 01-AC2: prioridad de cuenta/cookie/navegador/respaldo demostrada, incluida otra cuenta en el mismo navegador.
- 01-AC3: perfil cambia sin navegación forzada, conserva datos ingresados y sobrevive recarga y nueva sesión/dispositivo.
- 01-AC4: SSR/cliente y lang coinciden; dos peticiones independientes no mezclan idioma.
- 01-AC5: éxito completo, fallo local y fallo Auth tienen resultados distinguibles; reintento y reconciliación restauran metadatos.
- 01-AC6: la migración no modifica preferencias regionales ni borra datos.

## 17. Dependencias técnicas, funcionales o externas

- Funcional: Plan aprobado y reglas de sincronización I18N-01.
- Técnica: apps/webapp/app/root.tsx
- Técnica: apps/webapp/app/components/user/language-region/language-region-form.tsx
- Técnica: apps/webapp/app/routes/\_layout+/account-details.general.tsx
- Técnica: apps/webapp/app/modules/user/
- Técnica: apps/webapp/server/
- Técnica: packages/database/prisma/schema.prisma
- Externa: Supabase Auth de prueba

## 18. Depende de slices

Ninguno.

## 19. Riesgos / decisiones abiertas

- Cambiar shouldRevalidate sin revalidar consumidores deja textos anteriores; revisar loaders afectados.
- Recrear el árbol React perdería formularios; actualizar contexto/datos sin key por idioma.
- Metadatos y base no son una transacción; aplicar resultados parciales definidos.

## 20. Pendientes / preguntas abiertas

- Definir nombres internos de cookie/intent siguiendo convenciones existentes; no cambia el comportamiento aprobado.

## 21. AI Execution Profile

- **Profile:** ADVANCED.
- **Preferred model:** GPT-5.6 Sol (`gpt-5.6-sol`).
- **Reasoning:** High.
- **Fallback:** GPT-5.6 Terra (`gpt-5.6-terra`) / XHigh.
- **Switch Benefit:** HIGH por Auth, migración, persistencia y reconciliación entre PostgreSQL y Supabase.
- **Model Gate required:** no actualmente; la implementación local ya existe. Requerido al reabrir trabajo material si la configuración suficiente no está confirmada.
- **Review mode:** N3, review dedicado con GPT-5.6 Sol (`gpt-5.6-sol`) / High cuando sea técnicamente posible.
- **Reason:** una preferencia aparentemente simple cruza sesión, datos, metadatos Auth y compatibilidad de migración; una configuración menor aumenta el riesgo de pérdida o precedencia incorrecta.
