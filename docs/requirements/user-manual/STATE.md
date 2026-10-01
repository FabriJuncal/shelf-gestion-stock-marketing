# Requirement State — Manual de usuario progresivo

## Identificación

- **Ticket / slug:** user-manual
- **Title:** Manual de usuario progresivo de Shelf
- **Status:** completed
- **Phase:** cierre documental completado
- **Risk level:** N2
- **Last updated:** 2026-09-30

## Decisiones y autorizaciones

- **Discovery authorization:** approved — el usuario autorizó inicializar el
  requirement y ejecutar exclusivamente S01.
- **S01 execution authorization:** approved and completed — inventario y
  arquitectura documental.
- **S02 execution authorization:** approved and completed — Markdown
  versionado, español inicial y foco Propietario/Administrador con rutas comunes
  de Autoservicio/Base.
- **S03 execution authorization:** approved and completed — operación habitual documentada sin capturas ni cambios de aplicación.
- **S04 execution authorization:** approved and completed — administración y avanzado documentados sin capturas ni cambios de aplicación.
- **Manual delivery channel:** resolved — `docs/user-manual/`.
- **Editorial language policy:** resolved for the first edition — español.
- **S05 preparation authorization:** approved and completed — matriz ejecutable
  sin login, capturas ni publicación.
- **Editorial remediation authorization:** completed — se conciliaron estados,
  índice, roles, enlaces oficiales de CSV y la matriz S05; las capturas siguen
  `PENDIENTE`.
- **Authenticated evidence authorization:** approved conditionally on
  2026-09-30 — ejecutar M01–M19 sólo si ya existe una sesión autenticada segura
  y cobertura del rol correspondiente.
- **Captures and publication:** not authorized; permanecen como decisiones
  separadas.
- **Documentary closure decision:** approved on 2026-09-30 — manual Markdown
  completado; validación visual, capturas y publicación diferidas y no
  bloqueantes.
- **Commit, push, deploy, SMTP and Resend:** not authorized.

## Ejecución

- **Current slice:** none; S05 cerró la entrega Markdown.
- **Completed slices:** S01, S02, S03, S04 and documentary S05.
- **Pending slices:** none dentro del alcance documental aprobado.
- **Deferred optional work:** M01–M19, capturas y publicación; no bloquean el
  requirement y requieren una petición futura explícita.

## Evidencia reciente

- Ronda editorial P1/P2 del 2026-09-30: estados, índice y referencias
  reconciliados; roles contrastados contra `resources.ts` ES; las referencias
  CSV usan fuentes oficiales y se añadió `04-ayuda-por-situacion.md`.
- Verificaciones del 2026-09-30: Prettier PASS; 13 enlaces locales en 20
  archivos Markdown PASS; 20 enlaces oficiales de Shelf PASS; nueve rutas
  fuente de S05 PASS; `git diff --check` PASS. M20 quedó registrado como PASS.
- Desviación y límite: M01–M19 y todas las capturas continúan `PENDIENTE` hasta
  comprobar una sesión segura por rol.
- Intento autenticado del 2026-09-30: `list_pages` y la apertura dirigida de
  `/home` con Chrome DevTools MCP fallaron antes de navegar porque el perfil MCP
  estaba ocupado por otra instancia. No se detuvo el proceso ni se creó una
  sesión limpia; M01–M19 no recibieron resultado.
- Decisión final del 2026-09-30: la entrega requerida es el manual Markdown;
  M01–M19, capturas y publicación se difieren como trabajo opcional. La falla
  del navegador no bloquea el cierre documental.

## AI Strategy

### Planning and implementation

- **Profile:** BALANCED.
- **Preferred model:** GPT-5.6 Terra (`gpt-5.6-terra`) / Medium.
- **Fallback:** GPT-5.6 Sol (`gpt-5.6-sol`) / Medium.
- **Switch Benefit:** MEDIUM.
- **Model Gate:** no para S01; reevaluar al iniciar un slice de captura o
  revisión material.
- **Effective session configuration:** NO VERIFICADA; no se infiere del
  requirement.

### Review

- **Mode:** N2.
- **Dedicated review:** recomendada antes de una publicación material.
- **Preferred review model:** GPT-5.6 Sol (`gpt-5.6-sol`) / High.

## Próxima acción

- **Next action:** esperar una nueva petición del usuario; reabrir únicamente si
  solicita validación visual, capturas, publicación o cambios editoriales.
- **Why this is next:** el alcance Markdown aprobado está completado y no queda
  trabajo documental autorizado pendiente.
- **User action required:** true — sólo si desea iniciar un nuevo alcance.
- **Decision required:** ninguna para conservar el cierre actual.
- **Expected output:** nueva petición explícita, si corresponde.
- **After this:** crear o reabrir el alcance solicitado sin alterar este cierre.
- **Blocked by:** none.
- **Runtime limitation:** none para el cierre documental; la falla previa de
  Chrome DevTools sólo afecta el backlog visual diferido.
- **Resume instruction:** si se solicita validación visual, leer
  `slices/S05/EVIDENCE_MATRIX.md`, restablecer Chrome DevTools MCP y ejecutar
  únicamente los casos autorizados sin solicitar credenciales por chat.
