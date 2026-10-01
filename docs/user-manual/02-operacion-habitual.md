# Operación habitual: activos, préstamos y seguimiento

**Para:** Propietario y Administrador; incluye lo que Autoservicio y Base pueden hacer en sus propios recorridos.
**Objetivo:** mantener el inventario localizable, registrar quién tiene cada activo y evitar conflictos de reserva.

## Encontrar y actualizar activos

Antes de crear un registro duplicado, buscá por nombre, categoría, etiqueta, ubicación o código. Mantené actualizados la ubicación esperada y el estado del activo después de cada movimiento importante.

- Usá filtros y vistas para responder una pregunta concreta: qué está disponible, qué pertenece a una ubicación o qué necesita atención.
- Reservá los campos personalizados para datos que el equipo consulta de verdad.
- El índice avanzado sirve cuando una búsqueda simple no alcanza; sus guías locales se mantienen separadas de este recorrido inicial.

Autoservicio y Base pueden consultar los activos que su espacio les permite ver, pero no deben esperar acciones administrativas de edición o eliminación.

## Custodia: préstamos sin fecha prevista

Usá custodia cuando el activo queda bajo responsabilidad de una persona sin un período definido. Antes de asignarla, confirmá el activo y la persona; al recuperarlo, liberá la custodia para que el registro vuelva a mostrar la situación real.

[Custody Feature for Long-Term Equipment Lend-Outs](https://www.shelf.nu/knowledge-base/custody-feature-for-long-term-equipment-lend-outs) explica el flujo completo.

## Reservas: préstamos con fecha

Usá una reserva cuando necesitás apartar activos para un período. Una reserva requiere nombre, inicio, fin, activos o kits y custodio. Confirmá el período antes de sumar elementos: la disponibilidad depende de esas fechas.

1. Creá la reserva y definí el período.
2. Elegí el custodio y agregá activos o kits disponibles.
3. Reservá, entregá y devolvé según el flujo de tu espacio.
4. Si cambia el plan, actualizá o extendé la reserva antes de que venza.

Consultá [Introduction to Bookings](https://www.shelf.nu/knowledge-base/introduction-to-bookings) y [How to Create a Booking](https://www.shelf.nu/knowledge-base/how-to-create-a-booking) para estados, reglas y casos especiales.

- **Administrador/Propietario:** pueden gestionar reservas del equipo conforme a sus permisos.
- **Autoservicio:** trabaja sobre sus propias reservas y puede realizar sus operaciones permitidas, incluida su autocustodia cuando el flujo lo permita.
- **Base:** crea solicitudes propias; un Administrador realiza la entrega y devolución.

No uses custodia para simular una reserva ni una reserva sin fechas para simular custodia: elegir la herramienta correcta conserva disponibilidad e historial.

## QR y escáner

El código QR ayuda a identificar el registro físico correcto. Escaneá cuando entregás, devolvés, verificás ubicación o trabajás con un flujo que lo admita. Si el código no coincide, detenete y buscá el activo antes de confirmar una operación.

Los códigos alternativos y sus reglas se detallan en [Alternative Barcodes](https://www.shelf.nu/knowledge-base/alternative-barcodes). Las capturas del escáner quedan `PENDIENTE` hasta validar una sesión autenticada por rol.

## Kits, calendario y recordatorios

- **Kits:** agrupá activos que normalmente se entregan juntos; revisá su disponibilidad antes de reservarlos.
- **Calendario:** usalo para anticipar reservas y devoluciones. La suscripción a calendarios externos se explica en [Subscribe Your Calendar to Shelf Bookings](https://www.shelf.nu/knowledge-base/subscribe-your-calendar-to-shelf-bookings).
- **Recordatorios:** crealos para mantenimientos, vencimientos o revisiones. La guía oficial es [Asset Reminders](https://www.shelf.nu/knowledge-base/asset-reminders).

No confundas una ubicación esperada con el último lugar escaneado, ni un recordatorio con una reserva: cada dato responde una pregunta distinta.

## Rutina sugerida

Al comenzar el día, revisá próximas entregas/devoluciones y recordatorios. Al entregar, verificá activo, custodio y fecha. Al devolver, confirmá que el activo regresó y liberá o actualizá el registro correspondiente. Al finalizar, atendé cualquier elemento que haya quedado sin ubicación, con custodia inesperada o con una reserva vencida.

## Comprobación

- ¿Podemos encontrar un activo y saber si está disponible?
- ¿Registramos custodia sólo para responsabilidades sin fecha?
- ¿Usamos reservas para períodos concretos?
- ¿Las personas Base saben que sus solicitudes requieren un Administrador para la entrega/devolución?
- ¿El equipo sabe cuándo escanear y cuándo consultar el calendario o recordatorios?

Si necesitás auditorías, reportes, importación/exportación, roles o configuración, seguí con [Administración y avanzado](03-administracion-y-avanzado.md). Para un problema concreto, consultá [Ayuda por situación](04-ayuda-por-situacion.md).
