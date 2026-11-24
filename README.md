# Daily Grind 🏋️

App web (PWA) de entrenamiento en casa: genera tu **rutina semanal**, lleva el **seguimiento diario** y apunta tu **peso cada semana**. Funciona en el navegador y se puede instalar en el iPhone como si fuera una app.

## Funcionalidades

- **Rutina semanal automática** según los días que entrenas, tu nivel, tu objetivo y el material que tienes (mancuernas, barra de dominadas, banco, barra con discos).
  - 1-2 días → Full body · 3 días → Full body (principiante) o Empuje/Tirón/Pierna · 4 días → Torso/Pierna · 5-6 días → combinaciones PPL.
  - Botón 🔄 para cambiar un ejercicio por otro del mismo tipo.
  - Cada ejercicio trae series, repeticiones, descanso y un consejo de técnica.
- **Hoy**: el entreno del día con casillas por ejercicio, barra de progreso y botones *He entrenado / No he entrenado*. Al marcar todos los ejercicios el día se da por hecho.
- **Racha 🔥**: entrenos programados seguidos cumplidos (los días de descanso no la rompen).
- **Calendario** mensual con días entrenados, fallados y sin marcar, y % de cumplimiento.
- **Peso semanal** con historial, diferencia respecto a la semana anterior y gráfica. Aviso en *Hoy* si hace más de 7 días que no te pesas.
- **Exportar / importar** copia de seguridad en JSON.
- **Ficha de cada ejercicio**: músculos que trabaja, paso a paso, consejo y vídeo (abre YouTube con la búsqueda hecha o puedes guardar tu propio vídeo para verlo dentro de la app).
- **Series en burbujas** y **temporizador de descanso** automático al acabar cada serie (±15 s, pausa, pitido y vibración al terminar).
- **Modo noche**: automático según el modo oscuro del móvil, o fijo desde el botón del sol/luna o en Ajustes.
- Funciona **sin conexión** (service worker).

## Estructura

```
Daily Grind/
├── index.html      # Estructura y metadatos PWA / iOS
├── styles.css      # Estilos (tema oscuro, mobile first)
├── app.js          # Lógica: ejercicios, generador de rutinas, vistas y datos
├── manifest.json   # Manifiesto de la PWA
├── sw.js           # Service worker (modo offline)
└── icons/          # Iconos de la app
```

Los datos se guardan en `localStorage` con la clave `dailygrind:v1`.

## Probarla en el ordenador

Basta con abrir `index.html` en el navegador. Para que funcione también el modo offline hace falta servirla por `http`, por ejemplo con la extensión **Live Server** de VS Code o con:

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000`.

## Instalarla en el iPhone

1. Sube el proyecto a GitHub y activa **GitHub Pages** (Settings → Pages → rama `main`, carpeta `/root`).
2. Abre la URL en **Safari** en el iPhone.
3. Pulsa **Compartir → Añadir a pantalla de inicio**.

Se abrirá a pantalla completa, con su icono, como una app normal.

> Si cambias archivos, sube la versión de `CACHE` en `sw.js` (`dailygrind-v2`, …) para que el móvil descargue la versión nueva.

## Ideas para siguientes versiones

- Apuntar el peso levantado en cada ejercicio y ver la progresión.
- Recordatorios / notificaciones.
- Fotos de progreso y medidas corporales.
