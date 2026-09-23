# Spec 01 — Internacionalización de Shelf: inglés y español

## 1. Resumen general

Implementar una experiencia bilingüe en toda la aplicación web Shelf desplegada en Vercel, incluidos sus correos y documentos. Idiomas iniciales: inglés (`en`) y español (`es`).

Estado: implementación en curso. El slice 01 está construido localmente y los slices 02/03 tienen cobertura inicial; faltan la conversión completa de módulos, configuración externa de plantillas Supabase, migración en entorno y despliegue. La revisión del plan terminó en APROBADO tras resolver I18N-01 e I18N-02.

## 2. Objetivo

Una persona puede seleccionar Español o English antes o después de autenticarse y completar los recorridos habilitados en ese idioma. Su elección persiste y se respeta en mensajes, formatos de presentación y comunicaciones, conservando los datos y reglas existentes.

## 3. Contexto

- Monorepo pnpm/Turborepo; webapp React Router 7, React y Hono. PostgreSQL/Supabase con Prisma en `@shelf/database`.
- `apps/webapp/app/components/user/language-region/language-region-form.tsx` configura fechas, horas, inicio de semana y zona horaria; aún no selecciona idioma.
- `apps/webapp/app/root.tsx` declara `lang="en"` y su revalidación actual contempla `updateFormatPrefs`.
- Existen textos ingleses en componentes, loaders/actions, servicios, errores, correos y reportes.
- `packages/datetime/src/index.ts` usa intencionalmente `en-US` para extraer partes de fechas sin alterar preferencias. Es compartido con Companion: conservar su compatibilidad.
- Referencias del proyecto: [manejo de errores](../../../apps/docs/handling-errors.md), [configuración](../../../apps/docs/app-configuration.md), [contribución](../../../apps/docs/contributing.md) y [AGENTS.md](../../../AGENTS.md).

## 4. Problema u oportunidad que se aborda

La interfaz y las comunicaciones en inglés dificultan la operación de usuarios hispanohablantes. Un selector aislado no resuelve el problema: el idioma debe propagarse al renderizado, validaciones y correos, sin alterar el comportamiento del inventario.

## 5. Alcance

- Webapp completa: acceso, bienvenida, navegación, componentes compartidos, inventario, asignaciones, kits, escaneo, reservas, auditorías, administración, reportes y funciones habilitadas.
- Selector visible en login/registro, menú de usuario y sección Idioma y región.
- Persistencia por usuario y cookie para visitantes; servidor y cliente coherentes.
- Textos visibles, títulos de página, accesibilidad, validación, estados y errores.
- Calendarios, nombres de meses, números y tiempo relativo, respetando preferencias existentes.
- Correos de Supabase Auth y de la aplicación: asunto, cuerpo y destino de los enlaces.
- Reportes y documentos para personas; preservar los contratos de archivos de reimportación.
- Migración aditiva, verificación dirigida y despliegue recuperable.

## 6. Fuera de alcance

- Traducir la app nativa Companion. Si se modifica código compartido, mantener compatibilidad con sus consumidores actuales.
- Otros idiomas, traducción automática en tiempo de ejecución o una plataforma de gestión de traducciones.
- Traducir o reescribir nombres, descripciones, notas y contenido aportado por usuarios, incluidas categorías ya guardadas.
- Cambiar reglas de inventario, permisos, autenticación, pagos, monedas o cálculos.
- Traducir productos externos fuera del control del proyecto o documentación técnica interna.
- Añadir prefijos de idioma a las URLs o cambiar contratos públicos.

## 7. Actores involucrados

- Visitante: elige idioma antes de crear cuenta o iniciar sesión.
- Usuario autenticado: guarda una preferencia personal, independiente de su organización.
- Administrador: usa las funciones ya autorizadas en su idioma.
- Destinatario de correo: recibe comunicaciones según su preferencia conocida.
- Equipo de implementación y despliegue: mantiene catálogos, valida migraciones y publica.

## 8. Requerimientos funcionales

| ID    | Requerimiento verificable                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | Selector Español / English sin banderas en los puntos definidos.                                                                      |
| RF-02 | Resolver cuenta → cookie → Accept-Language → en; normalizar variantes y rechazar valores no soportados al guardar.                    |
| RF-03 | Persistir la preferencia entre sesiones y dispositivos sin modificar la elección de otros usuarios.                                   |
| RF-04 | Cambiar idioma conservando ruta, filtros y valores de formularios abiertos.                                                           |
| RF-05 | Renderizar servidor y cliente con el mismo idioma, incluido el atributo lang.                                                         |
| RF-06 | Traducir las superficies de la aplicación, plurales, variables, errores y textos accesibles.                                          |
| RF-07 | Localizar presentación regional sin sobrescribir zona horaria, moneda, fecha, hora ni inicio de semana elegidos.                      |
| RF-08 | Sincronizar idioma con Supabase Auth antes del primer correo y después de cambios autenticados, con recuperación de fallos parciales. |
| RF-09 | Traducir correos y documentos para personas; mantener compatibles los formatos destinados a intercambio/reimportación.                |
| RF-10 | Desplegar tras la migración y poder revertir el código conservando la columna.                                                        |

## 9. Requerimientos no funcionales

- Instancia i18next independiente por petición en el servidor; sin estado mutable de idioma compartido entre usuarios.
- Catálogos versionados por idioma y módulo; claves estables, interpolaciones y plurales coherentes.
- No remontar la aplicación por idioma ni perder estado de formularios para aplicar el cambio.
- No introducir dependencias de navegador en traducciones utilizadas por servidor o correos.
- Mantener accesibilidad y distribución usable con textos españoles más largos.
- Mensajes técnicos/logs pueden conservar su idioma; traducir la presentación al usuario sin alterar códigos o contratos de error.
- Nivel global de riesgo 3 por alcance transversal, esquema e integración Auth. La verificación de cada slice será proporcional al cambio real.
- Sin pruebas de carga, auditoría general de seguridad ni regresión de reglas intactas por defecto.

## 10. Reglas de negocio

### 10.1 Idioma y preferencia

- Únicos idiomas iniciales: en y es; es-AR/es-MX/es-ES usan el catálogo es y variantes inglesas usan en.
- Resolver preferencias válidas en orden: User.language, cookie de idioma, negociación Accept-Language, en.
- Persistir `User.language` nullable. null significa sin elección almacenada, no error ni bloqueo de acceso.
- Usar cookie de idioma independiente de la sesión. Al elegir autenticado, actualizar cuenta y cookie; al salir conservar la elección del navegador. Al entrar con otra cuenta, gana la preferencia de esa cuenta.
- No inferir moneda ni zona horaria a partir del idioma; mantener las preferencias regionales existentes.
- Inglés es el respaldo ante traducción faltante, pero no permite declarar completa una superficie aún sin traducir.

### 10.2 Coherencia con Supabase Auth — I18N-01 resuelto

- Para cuentas existentes, User.language es la referencia principal; los metadatos Auth contienen una copia validada para sus correos.
- En registro, enviar el idioma resuelto en los metadatos de signUp antes de que Supabase emita la confirmación. Al aprovisionar el usuario local, copiar ese valor validado sin sobrescribir una elección existente.
- En un cambio autenticado, guardar preferencia local y cookie, y comprobar la actualización de metadatos Auth.
- Si falla la escritura local, no declarar guardado ni confirmar el nuevo idioma como persistido.
- Si se guarda localmente pero falla Auth, conservar la preferencia local, mostrar aviso de sincronización incompleta y permitir repetir el guardado aun si el valor no cambió.
- No declarar éxito completo ante ese fallo parcial. Reconciliar metadatos con la preferencia local en la siguiente autenticación; un fallo de sincronización no impide iniciar sesión.
- Recuperación anónima utiliza el idioma previamente sincronizado; no modifica la preferencia de la cuenta ni revela su existencia.
- Una cuenta sin preferencia/metadatos válidos usa respaldo en inglés para correo. En visitantes con elección conocida antes del registro se usa dicha elección.
- No se requiere añadir infraestructura nueva de colas para resolver este alcance.

### 10.3 Traducciones y salidas

- Español claro y consistente; registrar un glosario mínimo antes de convertir módulos.
- Renderizar plurales y mensajes parametrizados sin concatenar fragmentos traducidos.
- Traducir etiquetas de estados, manteniendo sus valores internos.
- Correo según destinatario, no según idioma del emisor. Invitación a persona sin preferencia conocida: respaldo en inglés.
- Reportes para personas según idioma del solicitante. Archivos de reimportación y protocolos conservan identificadores, valores y esquema esperados.
- Respetar contenido libre y firmas personalizadas de usuarios.
- El idioma no amplía roles ni visibilidad de funcionalidades.

## 11. Flujo general

1. Resolver idioma de la petición antes de renderizar.
2. Entregar HTML y recursos iniciales en el mismo idioma.
3. Visitante selecciona idioma y lo guarda en cookie.
4. En registro enviar metadatos antes del primer correo; después de confirmación aprovisionar preferencia local.
5. Autenticado selecciona idioma: guardar, sincronizar Auth, revalidar loaders y actualizar interfaz conservando estado.
6. Si Auth falla tras el guardado, avisar, permitir reintento y reconciliar al autenticar.
7. Navegar y operar; usar traductor de la petición para respuestas y preferencia del destinatario para comunicaciones.
8. Recargar o acceder desde otro dispositivo: volver a resolver desde la cuenta.

## 12. Entradas y salidas relevantes

| Entrada                                          | Salida                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| language: en o es en acción de preferencia       | Preferencia persistida y estado de sincronización completo o parcial |
| User.language nullable, cookie y Accept-Language | Idioma de petición normalizado                                       |
| Clave, parámetros y cantidad                     | Mensaje traducido con plural correcto                                |
| Instante, idioma y preferencias regionales       | Presentación localizada sin alterar el instante                      |
| Destinatario y preferencia conocida              | Asunto y cuerpo de correo en su idioma                               |
| Reporte y propósito del archivo                  | Documento localizado o archivo de intercambio compatible             |

Los nombres concretos de acción/cookie y forma de respuesta se definirán en el slice 01 siguiendo los patrones existentes. No es un nuevo contrato público.

## 13. Dependencias

- i18next/react-i18next, con versiones compatibles con el stack instalado y fijadas mediante pnpm.
- Root loader, entradas servidor/cliente y contexto Hono; esquema/migraciones en @shelf/database.
- Supabase Auth y acceso a configuración de plantillas. Verificar durante slice 02 el mecanismo necesario para traducir también asuntos, antes de optar por un hook.
- Código de correos y entrega existente; no asumir un worker nuevo ni cambiar la arquitectura de envío.
- Calendarios y formateadores ya utilizados por la aplicación.
- Documentación de referencia: [SSR de react-i18next](https://react.i18next.com/latest/ssr), [correos por idioma en Supabase](https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q).
- El plan permite trabajo local/documental; cada despliegue futuro debe seguir el alcance autorizado por el usuario.

## 14. Riesgos, restricciones o consideraciones

- I18N-01: dos persistencias pueden divergir; aplicar el tratamiento definido en 10.2 y probar la recuperación.
- I18N-02: consultar una columna inexistente rompe loaders; aplicar y comprobar migración antes del código consumidor.
- No sustituir globalmente en-US en @shelf/datetime: separar texto presentado de extracción/cálculo de fechas.
- No usar un cambio de key del árbol React para cambiar idioma: perdería formularios abiertos.
- La cobertura de claves no detecta por sí sola textos aún escritos directamente en componentes. Complementar con inventario y revisión dirigida.
- Solo aceptar como diferencia de idioma un cambio de presentación, nunca de valores de negocio.
- No publicar la experiencia completa como terminada mientras falten slices. Los avances parciales se demuestran en desarrollo/preview.

### 14.1 Orden de despliegue y recuperación — I18N-02 resuelto

1. Ensayar migración aditiva nullable con usuarios existentes en base de prueba; comprobar que la versión anterior puede seguir leyendo/escribiendo usuarios.
2. Aplicar la migración de @shelf/database al entorno objetivo y verificar la columna. No usar db:reset.
3. Guardar las plantillas anteriores y configurar versiones bilingües con respaldo para metadatos ausentes.
4. Desplegar el código consumidor en Vercel una vez satisfecha la cobertura funcional del alcance.
5. Comprobar acceso, persistencia y correos; observar errores de carga y sincronización en las herramientas existentes.
6. Si falla la nueva versión, restaurar el despliegue anterior sin eliminar la columna. Restaurar plantillas anteriores si el fallo afecta correos.
7. Errores de login/carga causados por el cambio o pérdida de valores de formularios requieren recuperación; una sincronización parcial debe seguir el aviso/reintento definido.

## 15. Estrategia de slicing

Siete entregas: primero preferencia y base común con una pantalla demostrable; luego acceso y comunicaciones Auth; después superficies compartidas y módulos operativos; finalmente administración/salidas y publicación verificada.

Cada slice mantiene su alcance y evidencia propia. El slice 07 integra evidencia existente; no repite indiscriminadamente pruebas ya aprobadas. El inventario de cobertura se mantiene en este spec y los slices correspondientes, sin crear documentación auxiliar fuera del estándar.

### 15.1 Matriz de trazabilidad

| Requerimiento              | Slices responsables                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| RF-01                      | 01, 02, 03                                                          |
| RF-02, RF-03, RF-04, RF-05 | 01; recorridos Auth en 02; comprobación final en 07                 |
| RF-06                      | 02, 03, 04, 05, 06                                                  |
| RF-07                      | 03; consumidores en 04, 05, 06                                      |
| RF-08                      | 01, 02                                                              |
| RF-09                      | 02 para Auth; 06 para correos de app y documentos                   |
| RF-10                      | 01 prepara migración; 07 ensaya/verifica publicación y recuperación |

### 15.2 Criterios de cierre global

- G-01: RF-01 a RF-10 tienen evidencia satisfactoria de los slices responsables.
- G-02: los recorridos habilitados y superficies de error tienen cobertura en ambos idiomas; ninguna clave ni texto inglés accidental queda como sustituto de una traducción pendiente.
- G-03: el idioma persiste, no se mezcla entre peticiones y no se pierden valores en el formulario representativo.
- G-04: primer correo, cambio de idioma y recuperación usan la preferencia definida; el fallo parcial tiene aviso/reintento verificables.
- G-05: formato regional y archivos de intercambio conservan valores y compatibilidad.
- G-06: migración, orden de despliegue y recuperación están comprobados sin borrar usuarios ni datos.

### 15.3 Pruebas y evidencias

- Unitarias de resolución, normalización, traducciones parametrizadas y lógica modificada.
- Integración dirigida de persistencia, revalidación, metadatos Auth y fallo parcial.
- Dos peticiones con distinto idioma en una prueba de aislamiento; no una campaña de carga.
- Recorrido completo de registro/confirmación/login/recuperación en ambos idiomas con cuentas de prueba.
- Verificación visual de componentes representativos en escritorio y móvil; no snapshots de todas las pantallas.
- Reportes/exportaciones modificados: comprobar texto y estabilidad de datos/contratos.
- Tests de rutas en apps/webapp/test/routes-tests/, mocks externos justificados con // why: y factories existentes.
- Usar Vitest con --run; cumplir pnpm webapp:validate antes de commits sustantivos de código según AGENTS.md.
- No exigir tests nuevos por cada sustitución estática ni auditorías o pruebas de carga ajenas al alcance.
- Esta entrega documental solo necesita verificar estructura, JSON, dependencias y consistencia Markdown/JSON.

## 16. Roadmap de slices

| Orden | Slice                                                       | Resultado                                                                              | Dependencias           |
| ----- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| 01    | [Preferencia e infraestructura bilingüe](01-slice.md)       | Cambiar y guardar idioma desde perfil, con sincronización Auth y renderizado coherente | Ninguna                |
| 02    | [Acceso y correos de autenticación](02-slice.md)            | Registrarse y recuperar acceso en el idioma elegido                                    | 01                     |
| 03    | [Interfaz compartida y formatos](03-slice.md)               | Navegación, errores comunes y presentación regional coherentes                         | 01                     |
| 04    | [Inventario y operación diaria](04-slice.md)                | Gestionar inventario en ambos idiomas                                                  | 03                     |
| 05    | [Reservas y auditorías](05-slice.md)                        | Completar reservas y auditorías en ambos idiomas                                       | 03, 04                 |
| 06    | [Administración, reportes y comunicaciones](06-slice.md)    | Configurar y recibir salidas en el idioma esperado                                     | 02, 03, 04, 05         |
| 07    | [Verificación integral dirigida y publicación](07-slice.md) | Experiencia completa validada y despliegue recuperable                                 | 01, 02, 03, 04, 05, 06 |

Orden sugerido secuencial; las dependencias expresan requisitos reales, no autorización para ejecutar todo el spec. Todos los slices están pendientes de implementación.

## 17. Supuestos, pendientes y preguntas abiertas

- Decisiones aprobadas: webapp y comunicaciones; en/es; preferencia individual; prioridad definida; recuperación de sincronización y migración aditiva.
- Supuesto de redacción: español general claro. El glosario del slice 03 fijará términos según su contexto funcional; no implica una nueva ronda de aprobación del plan.
- Pendiente técnico del slice 02: comprobar localización de asuntos en el mecanismo de plantillas disponible. Si requiere un hook, documentar la necesidad y reutilizar el envío existente cuando sea compatible.
- Pendiente operativo del slice 07: identificar el entorno de prueba y la versión concreta recuperable, sin inventar IDs ni afirmar despliegues realizados.
- Durante cada slice, registrar aquí o en su propio archivo las superficies realmente inventariadas, resultados y exclusiones justificadas por configuración. El alcance no se reduce silenciosamente a las pantallas más usadas.
- No hay preguntas bloqueantes para crear esta documentación. La implementación debe conservar los acuerdos aprobados.
