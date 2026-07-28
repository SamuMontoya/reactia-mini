# Sistema de diseño

Reactia Mini adopta la base visual de `~/CRAFTING/claude-ds` (Kreanding) y la
adapta al contexto de un funnel de diagnóstico: una secuencia corta, móvil y
orientada a completar un formulario.

## Tokens adoptados

- Colores: `ink` (#111010), `paper` (#f5f2ed), `paper-warm` (#ede9e1),
  `white` (#fdfcfa), `amber` (#c8860a), `amber-dim` (#a06d08), `stone`
  (#7a7570) y `dust` (#c8c2b8).
- Tipografía: Bricolage Grotesque para titulares y DM Sans para lectura,
  cargadas en `app/layout.tsx` con `next/font`.
- Estructura: medida máxima cercana a 1080 px, fondo de papel cálido, líneas
  finas `dust`, grano sutil y halo ámbar. El ámbar se reserva para acciones,
  énfasis y progreso.
- Movimiento: una sola curva de easing y transiciones breves; no hay
  animaciones decorativas que retrasen el flujo.

## Desviaciones deliberadas

- **Radios:** el sistema origen usa superficies rectas y botones de 6 px.
  Reactia Mini usa 10 px en botones/campos y 14 px en tarjetas. Los formularios
  y el dashboard se leen como superficies enfocadas sin abandonar el carácter
  editorial de la marca.
- **Sombras:** el sistema origen evita sombras. Aquí hay dos elevaciones muy
  suaves para separar tarjetas, campos y filas editables del fondo cálido; no
  se usan sombras pesadas ni como adorno.
- **Colores de señal:** `signal-low` (#a4402f), `signal-mid` (#b7791f) y
  `signal-high` (#4c6b3c) son exclusivos de resultados, validación y estado.
  Un diagnóstico de 0–100 necesita expresar riesgo y avance sin convertir los
  CTA en semáforos; el ámbar sigue siendo el único acento de conversión.
- **Texto base:** 17 px y line-height 1.7, frente a la escala editorial de
  12–16 px. Mejora la lectura de una audiencia de dueños de negocio en móvil y
  reduce el esfuerzo al completar preguntas.

## Prácticas de conversión implementadas

La landing sigue la secuencia dolor → promesa → prueba → CTA: primero nombra
el cuello de botella de crecimiento, después promete claridad concreta, aporta
prueba/explicación del escáner y termina con una acción inequívoca. «Gratis» se
repite como reducción de riesgo y el CTA invita a iniciar, no a comprar.

No hay tabla comparativa: añade carga de decisión antes del primer paso. El
funnel captura los datos mínimos, permite que todos continúen al diagnóstico y
solo registra la calificación comercial. El wizard muestra una pregunta por
pantalla, guarda un borrador y ofrece una revisión editable antes de generar.

El resultado es un dashboard de una sola página, sin tabs que oculten valor.
El radar y las barras se dibujan con SVG propio: reduce dependencia y peso de
cliente frente a una librería de gráficos para seis valores. El único CTA de
alto intento abre WhatsApp con el contexto precargado; queda deshabilitado,
visiblemente, cuando el número de producción aún no se configuró.
