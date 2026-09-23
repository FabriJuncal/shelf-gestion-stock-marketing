# Execution Brief — S03 interfaz compartida y formatos regionales

## AI Execution Profile

> Recomendación para esta slice. No representa el modelo activo real de la sesión.

- **Profile:** BALANCED
- **Preferred model full name:** GPT-5.6 Terra
- **Model ID:** `gpt-5.6-terra`
- **Reasoning:** Medium
- **Fallback full name:** GPT-5.6 Sol
- **Fallback model ID:** `gpt-5.6-sol`
- **Fallback reasoning:** Medium
- **Switch benefit:** HIGH
- **Model Gate required:** no; el usuario confirmó `continuar con slice 03` el 2026-09-22 para esta fase.
- **Why:** el trabajo es transversal de frontend, pero los contratos de negocio, persistencia y Auth ya están definidos. Requiere preservar SSR, accesibilidad y preferencias regionales.
- **Escalate if:** una modificación de formato altera instantes, zona horaria, datos guardados o contratos compartidos con Companion.
- **Downgrade after:** solo para lotes grandes y mecánicos de catálogos, una vez estabilizados el glosario y los patrones.
- **Resolved against catalog date:** 2026-09-20.

## Objective

Localizar navegación y componentes reutilizados, con formatos de fechas y tiempo relativo coherentes en inglés/español, sin cambiar reglas de negocio ni preferencias regionales persistidas.

## Ordered steps

1. Completar catálogos compartidos y registrar el glosario de interfaz.
2. Localizar navegación lateral, paleta de comandos, diálogos, paginación y selector de zona horaria, manteniendo rutas, permisos y atajos.
3. Permitir que los formateadores presenten nombres de mes/día en el idioma de interfaz sin cambiar orden, zona horaria o formato horario guardados.
4. Agregar comprobaciones dirigidas de catálogos, navegación, accesibilidad y formateo.
5. Registrar cobertura, resultados y límites en el cierre de S03.

## Constraints

- No traducir datos libres ni claves, estados internos, IDs, rutas o contratos de importación/exportación.
- No modificar SMTP, plantillas ni correos.
- No cambiar zona horaria, moneda, orden de fecha, formato horario ni inicio de semana por seleccionar idioma.
- Mantener los cambios limitados a superficies compartidas; inventario, reservas y administración son slices posteriores.

## Required tests

- Tests unitarios dirigidos de formateo en en/es, mismo instante y preferencias regionales distintas.
- Tests de componente o comportamiento para navegación/paleta/controles compartidos modificados.
- Comprobación automática de paridad de claves en catálogos afectados.
- TypeScript y ESLint dirigidos; `git diff --check`.

## Definition of done

- Se cumplen 03-AC1 a 03-AC5 dentro de las superficies compartidas inventariadas.
- La evidencia distingue cobertura implementada de textos de módulos asignados a 04–06.
- No hay regresión demostrada de formatos regionales, rutas, permisos o accesibilidad de controles modificados.
