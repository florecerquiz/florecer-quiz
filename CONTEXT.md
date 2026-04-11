# CONTEXT — Proyecto Florecer

## Qué es la empresa
Marca digital de bienestar y mejora personal basada en un quiz funnel interactivo.
Mercado: hispanohablante, especialmente Argentina.
Referencia de modelo: Liven (adaptado al español).

## Modelo de negocio
1. Usuario entra a la landing
2. Se identifica con un problema (estrés, ansiedad, cansancio, falta de motivación, sueño)
3. Hace un quiz interactivo de 13 preguntas
4. Recibe un "resultado personalizado"
5. Se le ofrece un plan pago digital (4 semanas, 12 semanas, etc.)

El producto es 100% digital (app).

## Objetivo del quiz
No es solo informativo — es una herramienta de conversión.
- Generar identificación emocional
- Hacer que el usuario sienta que el sistema lo entiende
- Aumentar el compromiso progresivamente
- Preparar psicológicamente al usuario para comprar

## Temáticas principales
- Estrés
- Ansiedad
- Procrastinación
- Falta de energía
- Problemas de sueño
- Bienestar general
- Hábitos negativos

## Público objetivo
- Adultos de 25 a 55 años
- Mayoría mujeres, pero no exclusivo
- Personas con estrés, cansancio mental o emocional
- Buscan soluciones simples, rápidas y accesibles
- No buscan contenido técnico — buscan sentirse mejor

## Tono y estilo
- Lenguaje simple, cercano y emocional
- Nada técnico ni médico
- Sensación de acompañamiento
- Mensajes tipo:
  - "No es tu culpa"
  - "Esto le pasa a mucha gente"
  - "Tu cuerpo te está pidiendo un cambio"

## Estructura de la experiencia
1. **Hook inicial** — "Descubrí qué te está pasando y cómo cambiarlo."
2. **Pantallas de quiz** — 1 pregunta por pantalla, opciones simples, feedback visual
3. **Pantallas intermedias** — "Analizando tus respuestas…" / "Procesando resultados…" (refuerzan credibilidad)
4. **Resultado personalizado** — explica el problema del usuario, genera identificación profunda
5. **Oferta** — plan personalizado, beneficios claros, precio accesible, urgencia (descuento por hoy)

## Diseño y UX
- Ultra minimalista, muy visual
- 100% adaptado a mobile
- Colores: verde oscuro, blanco, detalles suaves
- Estética premium tipo app moderna
- Botones grandes, navegación simple

## Objetivo final
Crear una experiencia que:
- Parezca personalizada
- Genere confianza
- Mantenga al usuario enganchado
- Lo lleve naturalmente a comprar

## Archivos del proyecto
| Carpeta/Archivo | Descripción |
|----------------|-------------|
| `/Desktop/Florecer/` | Quiz funnel |
| `/Desktop/Florecer/index.html` | Quiz completo |
| `/Desktop/Florecer/script.js` | Lógica del funnel |
| `/Desktop/Florecer/styles.css` | Estilos |
| `/Desktop/Florecer Proyecto/` | Página de acceso para clientes (ya compró) |
| `/Desktop/Florecer Proyecto/index.html` | Página principal de acceso — v5 |
| `/Desktop/Florecer Proyecto/styles.css` | Estilos de la página de acceso |
| `/Desktop/Florecer Proyecto/script.js` | Lógica: modal, slider, gráfico SVG |
| `/Desktop/Florecer Proyecto/assets/logo.png` | Logo real de Florecer (oscuro, invertir a blanco con CSS) |

## Planes del programa
| Plan | Contraseña | Duración | Precio | Producto TN |
|------|-----------|---------|--------|-------------|
| Prueba de 7 Días | amor | 7 días | $9.990 | 335417321 |
| Plan de 4 Semanas | bienestar | 4 semanas | $24.990 | 335421128 |
| Plan de 12 Semanas | calma | 12 semanas | $54.990 | 335424119 |
| Upsell 4 Semanas | — | 4 semanas | $14.990 | 336768704 |
| Upsell 12 Semanas | — | 12 semanas | $29.990 | 336752767 |

## Integraciones activas
- **Netlify:** https://florecer-quiz.netlify.app — donde está hosteado el quiz
- **Formspree:** https://formspree.io/f/xgopbenn — captura emails del funnel
- **Meta Pixel ID:** 1460321182485341 — configurado en quiz (PageView, Lead, InitiateCheckout) y en Tienda Nube (Purchase)
- **Tienda Nube:** https://florecer60.mitiendanube.com — procesa pagos con Mercado Pago

## Estado actual — Quiz Funnel `/Desktop/Florecer/`

### Cambios implementados:
- **Hook**: "Descubrí qué te está pasando y cómo cambiarlo."
- **13 preguntas** (se actualizó de 12)
- **sAnxSymptoms**: nueva pantalla de síntomas físicos de ansiedad (morderse uñas, comer sin hambre, etc.) con opción "Ninguno"
- **sIdent3b**: pantalla intermedia visual con imagen, dato "91% de argentinos con estrés crónico", diseño full-screen
- **sLoading**: estilo Liven — 3 steps animados con preguntas interleaved
- **sCommit**: promesa en primera persona con nombre del usuario
- **sPrevAttempt**: pregunta de intentos fallidos previos
- **Upsell dinámico**: trial → ofrece 4 semanas a $14.990 / 4 semanas → ofrece 12 semanas a $29.990
- **Countdown**: timer de 24h persistente en barra sticky
- **Gráfico comparativo**: barras "Ahora" siempre bajas, "Tu objetivo" siempre altas
- **Meta Pixel**: PageView, Lead, InitiateCheckout integrados
- **Formspree**: captura email + nombre + género silenciosamente

### Ads preparados (pendiente producción):
- 5 scripts listos para grabar/generar con IA
- Ángulo principal: ansiedad / hipocondría estilo Liven
- Formato recomendado para empezar: Video UGC con D-ID o similar
- Script hipocondría adaptado al español rioplatense listo

### Próximos pasos:
- Grabar/generar el primer ad (video UGC ángulo ansiedad/hipocondría)
- Subir a Meta Ads y testear con presupuesto inicial
- Testimonios reales cuando lleguen las primeras ventas

---
*Actualizado: 2026-04-09*
