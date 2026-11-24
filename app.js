'use strict';
/* =========================================================
   Daily Grind — rutinas semanales, seguimiento diario y peso
   Todo se guarda en localStorage (en tu propio dispositivo).
   ========================================================= */

const STORAGE_KEY = 'dailygrind:v1';

const WD_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const WD_NAME = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // la semana empieza en lunes
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const EQUIPMENT = {
  mancuernas: 'Mancuernas',
  barra_dominadas: 'Barra de dominadas',
  banco: 'Banco de press',
  barra: 'Barra con discos',
};
const LEVELS = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const GOALS = { fuerza: 'Fuerza', hipertrofia: 'Ganar músculo', general: 'Ponerme en forma' };

/* ---------- Iconos ---------- */
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICON = {
  clock: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>'),
  swap: svg('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.3"/><rect x="14" y="4.5" width="4" height="15" rx="1.3"/></svg>',
  skip: svg('<path d="M6 5l9 7-9 7z" fill="currentColor"/><path d="M18 5v14"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>'),
  fire: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff8a3d" aria-hidden="true"><path d="M12 2c1 3.5 5 5.8 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4 2.5-5 .2 1.7 1 2.8 2 3.3C11 8.8 11.2 5.2 12 2z"/></svg>',
};

/* ---------- Biblioteca de ejercicios ----------
   p = patrón · eq = material · c = compuesto · m = músculos (el 1º es el principal)
   s = pasos · tip = error típico / consejo · reps = repeticiones fijas (opcional) */
const EXERCISES = [
  // Empuje horizontal
  { id: 'press_banca_barra', name: 'Press de banca con barra', p: 'h_push', eq: ['barra', 'banco'], c: true, m: ['Pecho', 'Tríceps', 'Hombro'],
    s: ['Túmbate con los ojos justo debajo de la barra y los pies bien apoyados.', 'Agarra la barra algo más ancho que los hombros y junta las escápulas.', 'Baja controlado hasta rozar el pecho, a la altura de los pezones.', 'Empuja hacia arriba sin despegar el culo del banco.'],
    tip: 'Si entrenas solo, no vayas al fallo: deja 2 repeticiones en la recámara.' },
  { id: 'press_banca_manc', name: 'Press de banca con mancuernas', p: 'h_push', eq: ['mancuernas', 'banco'], c: true, m: ['Pecho', 'Tríceps', 'Hombro'],
    s: ['Siéntate con las mancuernas en los muslos y túmbate llevándolas al pecho.', 'Escápulas juntas y codos a unos 45° del cuerpo, no abiertos en cruz.', 'Baja hasta notar estiramiento en el pecho.', 'Empuja hacia arriba juntando ligeramente las mancuernas.'],
    tip: 'Codos demasiado abiertos castigan el hombro. Piensa en una flecha, no en una T.' },
  { id: 'press_inclinado_manc', name: 'Press inclinado con mancuernas', p: 'h_push', eq: ['mancuernas', 'banco'], c: true, m: ['Pecho alto', 'Hombro', 'Tríceps'],
    s: ['Pon el banco a unos 30°.', 'Apoya bien la espalda y junta las escápulas.', 'Baja las mancuernas hacia la parte alta del pecho.', 'Empuja hacia arriba y un poco hacia dentro.'],
    tip: 'Más de 45° de inclinación convierte el ejercicio en un press de hombro.' },
  { id: 'press_suelo_manc', name: 'Press en el suelo con mancuernas', p: 'h_push', eq: ['mancuernas'], c: true, m: ['Pecho', 'Tríceps'],
    s: ['Túmbate boca arriba con las rodillas dobladas.', 'Mancuernas sobre el pecho con los brazos estirados.', 'Baja hasta que los codos toquen el suelo suavemente.', 'Pausa un segundo y empuja.'],
    tip: 'Ideal si no tienes banco: el suelo limita el recorrido y protege el hombro.' },
  { id: 'flexiones', name: 'Flexiones', p: 'h_push', eq: [], c: true, reps: '10-20', m: ['Pecho', 'Tríceps', 'Core'],
    s: ['Manos algo más abiertas que los hombros.', 'Cuerpo recto de la cabeza a los talones, abdomen apretado.', 'Baja hasta que el pecho casi toque el suelo.', 'Empuja el suelo para subir.'],
    tip: 'Si se te hunde la cadera, apoya las rodillas hasta que tengas más fuerza.' },
  // Empuje vertical
  { id: 'press_militar_manc', name: 'Press militar con mancuernas', p: 'v_push', eq: ['mancuernas'], c: true, m: ['Hombro', 'Tríceps'],
    s: ['De pie o sentado, mancuernas a la altura de los hombros.', 'Aprieta abdomen y glúteos.', 'Empuja hacia arriba hasta casi estirar los brazos.', 'Baja controlado a la altura de las orejas.'],
    tip: 'No arquees la espalda baja para subir el peso: si pasa, pesa demasiado.' },
  { id: 'press_arnold', name: 'Press Arnold', p: 'v_push', eq: ['mancuernas'], c: true, m: ['Hombro', 'Tríceps'],
    s: ['Empieza con las mancuernas delante de la cara y las palmas hacia ti.', 'Gira las muñecas mientras empujas hacia arriba.', 'Arriba, las palmas miran al frente.', 'Deshaz el giro al bajar.'],
    tip: 'Usa menos peso que en el press militar normal.' },
  { id: 'flexiones_pica', name: 'Flexiones en pica', p: 'v_push', eq: [], c: true, reps: '8-12', m: ['Hombro', 'Tríceps'],
    s: ['Ponte en posición de flexión y sube la cadera formando una V invertida.', 'Dobla los codos llevando la cabeza hacia el suelo.', 'Empuja para volver arriba.'],
    tip: 'Cuanto más cerca estén los pies de las manos, más difícil.' },
  // Tirón horizontal
  { id: 'remo_manc', name: 'Remo con mancuerna a una mano', p: 'h_pull', eq: ['mancuernas'], c: true, m: ['Espalda', 'Bíceps'],
    s: ['Apoya mano y rodilla del mismo lado en el banco o una silla.', 'Espalda recta, paralela al suelo.', 'Tira de la mancuerna llevando el codo hacia la cadera.', 'Baja estirando bien el brazo.'],
    tip: 'Tira con el codo, no con la mano. Las reps son por brazo.' },
  { id: 'remo_barra', name: 'Remo con barra', p: 'h_pull', eq: ['barra'], c: true, m: ['Espalda', 'Bíceps', 'Lumbar'],
    s: ['De pie, rodillas un poco dobladas, inclina el torso unos 45°.', 'Espalda recta y barra colgando con los brazos estirados.', 'Lleva la barra hacia el ombligo juntando escápulas.', 'Baja controlado.'],
    tip: 'Si tienes que dar tirones con la espalda para subirla, baja el peso.' },
  { id: 'remo_invertido', name: 'Remo invertido bajo una mesa', p: 'h_pull', eq: [], c: true, reps: '8-12', m: ['Espalda', 'Bíceps'],
    s: ['Túmbate bajo una mesa robusta y agárrate al borde.', 'Cuerpo recto, talones en el suelo.', 'Sube el pecho hacia la mesa.', 'Baja despacio.'],
    tip: 'Antes de empezar, comprueba que la mesa aguanta tu peso y no vuelca.' },
  { id: 'remo_banco_manc', name: 'Remo apoyado en banco inclinado', p: 'h_pull', eq: ['mancuernas', 'banco'], c: true, m: ['Espalda', 'Deltoides posterior'],
    s: ['Banco a unos 30°, túmbate boca abajo con el pecho apoyado.', 'Deja colgar las mancuernas.', 'Tira llevando los codos hacia atrás.', 'Aprieta un segundo arriba y baja.'],
    tip: 'Con el pecho apoyado no puedes hacer trampa con la espalda.' },
  // Tirón vertical
  { id: 'dominadas', name: 'Dominadas', p: 'v_pull', eq: ['barra_dominadas'], c: true, reps: { principiante: '3-5', intermedio: '6-10', avanzado: '8-12' }, m: ['Espalda', 'Bíceps', 'Core'],
    s: ['Agárrate con las palmas hacia delante, algo más ancho que los hombros.', 'Cuelga con los brazos estirados y baja los hombros.', 'Tira hasta que la barbilla pase la barra.', 'Baja despacio hasta estirar los brazos.'],
    tip: 'Si aún no te sale ninguna, haz negativas: sube de un salto y baja en 3-5 segundos.' },
  { id: 'dominadas_supinas', name: 'Dominadas supinas (chin-ups)', p: 'v_pull', eq: ['barra_dominadas'], c: true, reps: { principiante: '3-6', intermedio: '6-10', avanzado: '8-12' }, m: ['Espalda', 'Bíceps'],
    s: ['Agárrate con las palmas hacia ti, a la anchura de los hombros.', 'Cuelga con los brazos estirados.', 'Tira llevando el pecho hacia la barra.', 'Baja controlado.'],
    tip: 'Suelen salir más que las dominadas normales: buenas para empezar.' },
  { id: 'superman', name: 'Superman', p: 'v_pull', eq: [], c: false, reps: '12-15', m: ['Lumbar', 'Espalda', 'Glúteo'],
    s: ['Túmbate boca abajo con los brazos estirados por delante.', 'Levanta a la vez brazos, pecho y piernas.', 'Aguanta 2 segundos arriba.', 'Baja despacio.'],
    tip: 'Mira al suelo para no forzar el cuello.' },
  { id: 'pullover_manc', name: 'Pullover con mancuerna', p: 'v_pull', eq: ['mancuernas', 'banco'], c: false, m: ['Dorsal', 'Pecho'],
    s: ['Túmbate en el banco sujetando una mancuerna con las dos manos sobre el pecho.', 'Brazos casi rectos.', 'Bájala por detrás de la cabeza hasta notar estiramiento.', 'Vuelve a subirla encima del pecho.'],
    tip: 'No dobles los codos durante el movimiento: perderías el trabajo del dorsal.' },
  // Sentadilla
  { id: 'sentadilla_goblet', name: 'Sentadilla goblet', p: 'squat', eq: ['mancuernas'], c: true, m: ['Cuádriceps', 'Glúteo', 'Core'],
    s: ['Sujeta una mancuerna en vertical pegada al pecho.', 'Pies a la anchura de los hombros, puntas un poco hacia fuera.', 'Baja como si te sentaras, con el pecho erguido.', 'Sube empujando el suelo con todo el pie.'],
    tip: 'Las rodillas siguen la dirección de las puntas: que no se metan hacia dentro.' },
  { id: 'sentadilla_bulgara', name: 'Sentadilla búlgara', p: 'squat', eq: ['mancuernas', 'banco'], c: true, m: ['Cuádriceps', 'Glúteo'],
    s: ['De espaldas al banco, apoya el empeine de un pie encima.', 'Adelanta el otro pie un paso largo.', 'Baja hasta que la rodilla de atrás casi toque el suelo.', 'Sube empujando con la pierna de delante.'],
    tip: 'Las reps son por pierna. Empieza sin peso hasta dominar el equilibrio.' },
  { id: 'sentadilla_libre', name: 'Sentadilla con peso corporal', p: 'squat', eq: [], c: true, reps: '15-25', m: ['Cuádriceps', 'Glúteo'],
    s: ['Pies a la anchura de los hombros.', 'Brazos al frente para equilibrarte.', 'Baja hasta que los muslos queden paralelos al suelo.', 'Sube sin despegar los talones.'],
    tip: 'Si se te levantan los talones, abre un poco más los pies.' },
  // Bisagra de cadera
  { id: 'peso_muerto_rumano', name: 'Peso muerto rumano con mancuernas', p: 'hinge', eq: ['mancuernas'], c: true, m: ['Isquios', 'Glúteo', 'Lumbar'],
    s: ['De pie, mancuernas delante de los muslos.', 'Rodillas un poco dobladas y fijas.', 'Echa la cadera hacia atrás bajando las mancuernas pegadas a las piernas.', 'Cuando notes tirantez detrás del muslo, sube apretando glúteo.'],
    tip: 'La espalda siempre recta. No hace falta llegar al suelo.' },
  { id: 'peso_muerto_barra', name: 'Peso muerto con barra', p: 'hinge', eq: ['barra'], c: true, m: ['Isquios', 'Glúteo', 'Espalda'],
    s: ['Pies bajo la barra, a la anchura de las caderas.', 'Agárrala y baja la cadera con la espalda recta.', 'Empuja el suelo con las piernas y sube con la barra pegada al cuerpo.', 'Baja controlado por el mismo camino.'],
    tip: 'Si la espalda se curva, el peso es demasiado alto.' },
  { id: 'hip_thrust', name: 'Hip thrust en banco', p: 'hinge', eq: ['banco'], c: true, m: ['Glúteo', 'Isquios'],
    s: ['Apoya la parte alta de la espalda en el lateral del banco.', 'Pies en el suelo y, si tienes, una mancuerna sobre la cadera.', 'Sube la cadera hasta que el cuerpo quede recto.', 'Aprieta glúteo un segundo y baja.'],
    tip: 'Mete la barbilla: mira al frente, no al techo.' },
  { id: 'puente_gluteo', name: 'Puente de glúteo', p: 'hinge', eq: [], c: false, reps: '15-20', m: ['Glúteo', 'Isquios'],
    s: ['Túmbate boca arriba con las rodillas dobladas.', 'Sube la cadera apretando glúteos.', 'Aguanta un segundo arriba.', 'Baja sin llegar a apoyar del todo.'],
    tip: 'Empuja con los talones, no con las puntas.' },
  // Zancada
  { id: 'zancadas_manc', name: 'Zancadas con mancuernas', p: 'lunge', eq: ['mancuernas'], c: true, m: ['Cuádriceps', 'Glúteo'],
    s: ['De pie con una mancuerna en cada mano.', 'Da un paso largo hacia delante.', 'Baja hasta que la rodilla de atrás casi toque el suelo.', 'Empuja con la pierna de delante para volver.'],
    tip: 'Alterna piernas. Las reps son por pierna.' },
  { id: 'step_up', name: 'Subidas al banco (step-up)', p: 'lunge', eq: ['banco'], c: true, m: ['Cuádriceps', 'Glúteo'],
    s: ['Pon un pie entero sobre el banco.', 'Sube empujando con esa pierna.', 'Baja despacio con la misma pierna.'],
    tip: 'No te impulses con la pierna de abajo. Asegúrate de que el banco no se mueve.' },
  { id: 'zancadas', name: 'Zancadas', p: 'lunge', eq: [], c: true, reps: '12-15', m: ['Cuádriceps', 'Glúteo'],
    s: ['De pie, da un paso largo hacia delante.', 'Baja la rodilla de atrás hacia el suelo.', 'Vuelve a la posición inicial y cambia de pierna.'],
    tip: 'El torso erguido. Las reps son por pierna.' },
  // Bíceps
  { id: 'curl_manc', name: 'Curl de bíceps con mancuernas', p: 'biceps', eq: ['mancuernas'], c: false, m: ['Bíceps'],
    s: ['De pie, mancuernas a los lados con las palmas hacia delante.', 'Codos pegados al cuerpo.', 'Sube doblando solo el codo.', 'Baja despacio hasta estirar.'],
    tip: 'Si balanceas el cuerpo para subir, pesa demasiado.' },
  { id: 'curl_martillo', name: 'Curl martillo', p: 'biceps', eq: ['mancuernas'], c: false, m: ['Bíceps', 'Antebrazo'],
    s: ['Mancuernas a los lados con las palmas mirándose.', 'Codos fijos.', 'Sube sin girar las muñecas.', 'Baja controlado.'],
    tip: 'Trabaja también el antebrazo: ayuda a agarrar mejor en las dominadas.' },
  { id: 'curl_inclinado', name: 'Curl en banco inclinado', p: 'biceps', eq: ['mancuernas', 'banco'], c: false, m: ['Bíceps'],
    s: ['Banco a unos 45°, siéntate con la espalda apoyada.', 'Deja colgar los brazos por detrás del cuerpo.', 'Sube las mancuernas sin adelantar los codos.', 'Baja hasta estirar del todo.'],
    tip: 'Usa menos peso que en el curl de pie: el estiramiento lo hace más duro.' },
  // Tríceps
  { id: 'ext_triceps', name: 'Extensión de tríceps sobre la cabeza', p: 'triceps', eq: ['mancuernas'], c: false, m: ['Tríceps'],
    s: ['Sujeta una mancuerna con las dos manos por encima de la cabeza.', 'Codos apuntando al techo, cerca de la cabeza.', 'Baja la mancuerna por detrás de la nuca.', 'Estira los brazos para subir.'],
    tip: 'Solo se mueve el antebrazo. Que los codos no se abran.' },
  { id: 'press_frances', name: 'Press francés con mancuernas', p: 'triceps', eq: ['mancuernas', 'banco'], c: false, m: ['Tríceps'],
    s: ['Túmbate con las mancuernas arriba y los brazos estirados.', 'Dobla solo los codos bajando las mancuernas junto a la cabeza.', 'Estira para volver arriba.'],
    tip: 'Empieza con poco peso: el codo es delicado.' },
  { id: 'fondos_banco', name: 'Fondos en banco', p: 'triceps', eq: ['banco'], c: false, reps: '10-15', m: ['Tríceps', 'Pecho'],
    s: ['Apoya las manos en el borde del banco detrás de ti.', 'Piernas estiradas o dobladas delante.', 'Baja doblando los codos hasta unos 90°.', 'Empuja para subir.'],
    tip: 'No bajes más de 90° si te molesta el hombro.' },
  { id: 'flexiones_diamante', name: 'Flexiones diamante', p: 'triceps', eq: [], c: false, reps: '8-15', m: ['Tríceps', 'Pecho'],
    s: ['Junta las manos bajo el pecho formando un rombo con pulgares e índices.', 'Cuerpo recto.', 'Baja hasta tocar las manos con el pecho.', 'Empuja para subir.'],
    tip: 'Si cuesta mucho, apoya las rodillas.' },
  // Hombro
  { id: 'elev_laterales', name: 'Elevaciones laterales', p: 'shoulders', eq: ['mancuernas'], c: false, m: ['Hombro lateral'],
    s: ['De pie, mancuernas a los lados.', 'Codos ligeramente doblados.', 'Sube los brazos hacia los lados hasta la altura de los hombros.', 'Baja despacio.'],
    tip: 'Poco peso y controlado. Imagina que viertes una jarra al subir.' },
  { id: 'pajaros', name: 'Pájaros', p: 'shoulders', eq: ['mancuernas'], c: false, m: ['Hombro posterior', 'Espalda alta'],
    s: ['Inclina el torso hacia delante con la espalda recta.', 'Mancuernas colgando bajo el pecho.', 'Abre los brazos hacia los lados como si fueran alas.', 'Baja controlado.'],
    tip: 'Compensa todo el press que haces: tus hombros lo agradecerán.' },
  // Pecho aislamiento
  { id: 'aperturas', name: 'Aperturas con mancuernas', p: 'chest_iso', eq: ['mancuernas', 'banco'], c: false, m: ['Pecho'],
    s: ['Túmbate con las mancuernas arriba y las palmas mirándose.', 'Codos ligeramente doblados y fijos.', 'Abre los brazos en arco hasta notar estiramiento.', 'Cierra como si abrazaras un árbol.'],
    tip: 'No bajes más allá de la línea del cuerpo.' },
  // Core
  { id: 'elev_piernas_colgado', name: 'Elevaciones de piernas colgado', p: 'core', eq: ['barra_dominadas'], c: false, reps: '8-12', m: ['Abdomen', 'Agarre'],
    s: ['Cuélgate de la barra con los brazos estirados.', 'Sube las rodillas hacia el pecho.', 'Baja despacio sin balancearte.'],
    tip: 'Cuando te salga fácil, sube las piernas estiradas.' },
  { id: 'plancha', name: 'Plancha', p: 'core', eq: [], c: false, reps: '30-45 s', m: ['Abdomen', 'Core'],
    s: ['Apoya antebrazos y puntas de los pies.', 'Cuerpo recto de la cabeza a los talones.', 'Aprieta abdomen y glúteos.', 'Respira y aguanta el tiempo marcado.'],
    tip: 'Si se te hunde la cadera, corta la serie: mejor menos tiempo bien hecho.' },
  { id: 'dead_bug', name: 'Dead bug', p: 'core', eq: [], c: false, reps: '10-12', m: ['Abdomen', 'Core'],
    s: ['Túmbate boca arriba con brazos al techo y rodillas a 90°.', 'Pega la zona lumbar al suelo.', 'Estira a la vez un brazo y la pierna contraria.', 'Vuelve y cambia de lado.'],
    tip: 'La lumbar no se despega del suelo en ningún momento.' },
  // Gemelos
  { id: 'gemelos_manc', name: 'Elevación de gemelos con mancuernas', p: 'calves', eq: ['mancuernas'], c: false, m: ['Gemelos'],
    s: ['De pie con una mancuerna en cada mano, mejor sobre un escalón.', 'Sube de puntillas todo lo que puedas.', 'Aguanta un segundo arriba.', 'Baja hasta estirar.'],
    tip: 'Hazlo lento: el gemelo responde mejor al control que al rebote.' },
  { id: 'gemelos', name: 'Elevación de gemelos', p: 'calves', eq: [], c: false, reps: '15-25', m: ['Gemelos'],
    s: ['Ponte de pie en un escalón con los talones en el aire.', 'Sube de puntillas.', 'Baja hasta notar estiramiento.'],
    tip: 'Agárrate a algo para no perder el equilibrio.' },
];
const EX_BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

/* ---------- Plantillas de día ---------- */
const TEMPLATES = {
  FB_A: { title: 'Full body A', color: 'red', slots: [['squat', 0], ['h_push', 0], ['v_pull', 0], ['hinge', 0], ['shoulders', 0], ['core', 0]] },
  FB_B: { title: 'Full body B', color: 'blue', slots: [['lunge', 0], ['v_push', 0], ['h_pull', 0], ['hinge', 1], ['biceps', 0], ['core', 1]] },
  PUSH: { title: 'Empuje', sub: 'Pecho, hombro y tríceps', color: 'red', slots: [['h_push', 0], ['v_push', 0], ['h_push', 1], ['shoulders', 0], ['chest_iso', 0], ['triceps', 0]] },
  PULL: { title: 'Tirón', sub: 'Espalda y bíceps', color: 'blue', slots: [['v_pull', 0], ['h_pull', 0], ['v_pull', 1], ['shoulders', 1], ['biceps', 0], ['biceps', 1]] },
  LEGS: { title: 'Pierna', sub: 'Pierna y core', color: 'yellow', slots: [['squat', 0], ['hinge', 0], ['lunge', 0], ['calves', 0], ['core', 0]] },
  UPPER: { title: 'Torso', sub: 'Pecho, espalda y brazos', color: 'green', slots: [['h_push', 0], ['v_pull', 0], ['v_push', 0], ['h_pull', 0], ['biceps', 0], ['triceps', 0]] },
  LOWER: { title: 'Pierna', sub: 'Pierna y core', color: 'yellow', slots: [['squat', 0], ['hinge', 0], ['lunge', 0], ['calves', 0], ['core', 0], ['core', 1]] },
};
const tplOf = day => TEMPLATES[day && day.tpl] || { color: 'red' };

function templatesFor(n, level) {
  switch (n) {
    case 1: return ['FB_A'];
    case 2: return ['FB_A', 'FB_B'];
    case 3: return level === 'principiante' ? ['FB_A', 'FB_B', 'FB_A'] : ['PUSH', 'PULL', 'LEGS'];
    case 4: return ['UPPER', 'LOWER', 'UPPER', 'LOWER'];
    case 5: return ['PUSH', 'PULL', 'LEGS', 'UPPER', 'LOWER'];
    default: return ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS'];
  }
}

/* Series, repeticiones y descanso (segundos) según objetivo y nivel */
function scheme(ex, goal, level) {
  const table = {
    fuerza: { c: [4, '5-6', 150], a: [3, '8-10', 90] },
    hipertrofia: { c: [4, '8-12', 90], a: [3, '12-15', 60] },
    general: { c: [3, '10-12', 75], a: [3, '12-15', 60] },
  }[goal] || { c: [3, '10-12', 75], a: [3, '12-15', 60] };
  let [sets, reps, rest] = ex.c ? table.c : table.a;
  if (level === 'principiante' && sets >= 4) sets -= 1;
  if (level === 'avanzado' && ex.c) sets += 1;
  if (typeof ex.reps === 'string') reps = ex.reps;
  else if (ex.reps && ex.reps[level]) reps = ex.reps[level];
  return { sets, reps, rest };
}

function candidates(pattern, equipment) {
  return EXERCISES.filter(e => e.p === pattern && e.eq.every(k => equipment[k]));
}

function pickExercise(pattern, variant, equipment, used) {
  const list = candidates(pattern, equipment);
  for (let i = 0; i < list.length; i++) {
    const e = list[(variant + i) % list.length];
    if (!used.has(e.id)) return e.id;
  }
  return null;
}

function generateRoutine(s, shuffle = false) {
  const days = WEEK_ORDER.filter(d => s.trainingDays.includes(d));
  const tpls = templatesFor(days.length, s.level);
  const seen = {};
  const out = {};
  days.forEach((wd, i) => {
    const key = tpls[i];
    seen[key] = (seen[key] ?? -1) + 1;
    const occ = seen[key]; // la 2ª vez que sale una plantilla usa otras variantes
    const t = TEMPLATES[key];
    const used = new Set();
    const exercises = [];
    t.slots.forEach(([p, v]) => {
      const extra = shuffle ? Math.floor(Math.random() * 3) : 0;
      const id = pickExercise(p, v + occ + extra, s.equipment, used);
      if (id) {
        used.add(id);
        exercises.push({ id, ...scheme(EX_BY_ID[id], s.goal, s.level) });
      }
    });
    out[wd] = { tpl: key, title: t.title, exercises };
  });
  return { createdAt: keyOf(new Date()), days: out };
}

/* ---------- Fechas ---------- */
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const startOfWeek = d => addDays(d, -((d.getDay() + 6) % 7));
const prettyDate = d => `${WD_NAME[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
const shortDate = k => { const d = fromKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
const restText = s => s >= 60 ? `${mmss(s)} min` : `${s} s`;

/* ---------- Estado ---------- */
function defaultState() {
  return { settings: null, routine: null, startDate: null, log: {}, weights: [], videos: {}, theme: 'auto' };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return migrate({ ...defaultState(), ...JSON.parse(raw) });
  } catch (e) {
    console.warn('No se pudo leer el estado', e);
    return defaultState();
  }
}

/* Versión 1 guardaba casillas (checks); ahora se guardan series hechas (sets) */
function migrate(s) {
  s.videos = s.videos || {};
  if (!['auto', 'light', 'dark'].includes(s.theme)) s.theme = 'auto';
  Object.entries(s.log || {}).forEach(([k, log]) => {
    if (log.checks && !log.sets) {
      log.sets = {};
      const w = s.routine && s.routine.days[log.from ?? fromKey(k).getDay()];
      Object.entries(log.checks).forEach(([i, on]) => {
        if (on) log.sets[i] = (w && w.exercises[i] && w.exercises[i].sets) || 3;
      });
      delete log.checks;
    }
  });
  return s;
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { toast('No se ha podido guardar'); }
}

let state = loadState();
const ui = { tab: 'hoy', selected: keyOf(today()), calMonth: null, draft: null, sheet: null };

/* ---------- Seguimiento ---------- */
function workoutFor(dateKey) {
  if (!state.routine) return null;
  const log = state.log[dateKey];
  const wd = log && log.from != null ? log.from : fromKey(dateKey).getDay();
  return state.routine.days[wd] || null;
}

const isPlanned = date => !!(state.routine && state.routine.days[date.getDay()]);

/* done | skipped | missed | planned | rest */
function dayStatus(date) {
  const k = keyOf(date);
  const log = state.log[k];
  if (log && log.status) return log.status;
  if (!isPlanned(date)) return 'rest';
  if (date < today() && (!state.startDate || k >= state.startDate)) return 'missed';
  return 'planned';
}

/* Racha = entrenos programados seguidos cumplidos (los descansos no la rompen) */
function currentStreak() {
  let n = 0;
  let d = today();
  for (let i = 0; i < 1000; i++) {
    const k = keyOf(d);
    if (state.startDate && k < state.startDate) break;
    const st = dayStatus(d);
    if (st === 'done') n++;
    else if (st === 'skipped' || st === 'missed') break;
    d = addDays(d, -1);
  }
  return n;
}

function weekSummary() {
  const start = startOfWeek(today());
  let done = 0, planned = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (isPlanned(d)) planned++;
    if (dayStatus(d) === 'done') done++;
  }
  return { done, planned };
}

function monthDone(year, month) {
  return Object.entries(state.log).filter(([k, v]) => {
    const d = fromKey(k);
    return v.status === 'done' && d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

function setLog(dateKey, patch) {
  const cur = state.log[dateKey] || { sets: {} };
  const next = { ...cur, ...patch };
  const anySets = Object.values(next.sets || {}).some(n => n > 0);
  if (!next.status && !anySets && next.from == null) delete state.log[dateKey];
  else state.log[dateKey] = next;
  save();
}

/* Toca la burbuja n (0-based) de un ejercicio */
function tapSet(dateKey, idx, n) {
  const w = workoutFor(dateKey);
  if (!w) return;
  const e = w.exercises[idx];
  const log = state.log[dateKey] || { sets: {} };
  const sets = { ...(log.sets || {}) };
  const cur = sets[idx] || 0;
  const marking = n >= cur;
  sets[idx] = marking ? n + 1 : n; // tocar una ya hecha la desmarca (y las siguientes)
  const patch = { sets, title: w.title };

  const allDone = w.exercises.every((x, i) => (sets[i] || 0) >= x.sets);
  if (allDone && log.status !== 'done') patch.status = 'done';
  setLog(dateKey, patch);

  if (!marking) return;
  if (allDone) {
    stopTimer();
    toast('Entreno completado. ¡Bien hecho!');
    return;
  }
  // descanso automático tras cada serie
  const ex = EX_BY_ID[e.id];
  const exDone = sets[idx] >= e.sets;
  const nextIdx = exDone ? w.exercises.findIndex((x, i) => (sets[i] || 0) < x.sets) : idx;
  const nextEx = w.exercises[nextIdx];
  const label = exDone
    ? `Siguiente: ${EX_BY_ID[nextEx.id].name}`
    : `${ex.name}: serie ${sets[idx] + 1} de ${e.sets}`;
  startTimer(e.rest, label, tplOf(w).color);
}

const setsDone = (dateKey, idx) => ((state.log[dateKey] || {}).sets || {})[idx] || 0;

/* =========================================================
   TEMPORIZADOR DE DESCANSO
   Se basa en la hora de fin, así sigue bien aunque bloquees el móvil.
   ========================================================= */
const timer = { active: false, end: 0, total: 0, remaining: 0, paused: false, label: '', color: 'red', iv: null, finished: false };
let audioCtx = null;

function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* sin audio */ }
}

function beep() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [0, 0.25, 0.5].forEach((dt, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = i === 2 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t0 + dt);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + dt + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.18);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0 + dt);
    o.stop(t0 + dt + 0.2);
  });
}

function startTimer(seconds, label, color) {
  unlockAudio();
  clearInterval(timer.iv);
  Object.assign(timer, { active: true, total: seconds, end: Date.now() + seconds * 1000, remaining: seconds, paused: false, label, color: color || 'red', finished: false });
  timer.iv = setInterval(tickTimer, 250);
  renderTimer();
  $('#timer').classList.add('show');
}

function tickTimer() {
  if (!timer.active || timer.paused || timer.finished) return;
  const left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
  if (left !== timer.remaining) { timer.remaining = left; updateTimer(); }
  if (left <= 0) finishTimer();
}

function finishTimer() {
  timer.finished = true;
  clearInterval(timer.iv);
  beep();
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  renderTimer();
  timer.iv = setTimeout(stopTimer, 6000);
}

function stopTimer() {
  timer.active = false;
  clearInterval(timer.iv);
  clearTimeout(timer.iv);
  timer.finished = false;
  $('#timer').classList.remove('show');
}

function adjustTimer(delta) {
  if (timer.finished) return;
  if (timer.paused) timer.remaining = Math.max(5, timer.remaining + delta);
  else { timer.end += delta * 1000; timer.remaining = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000)); }
  timer.total = Math.max(timer.total, timer.remaining);
  updateTimer();
}

function togglePause() {
  if (timer.finished) return;
  if (timer.paused) { timer.end = Date.now() + timer.remaining * 1000; timer.paused = false; }
  else { timer.remaining = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000)); timer.paused = true; }
  renderTimer();
}

/* El disco: un anillo que se va oscureciendo según pasa el tiempo */
function timerDisc() {
  const R = 34, C = 2 * Math.PI * R;
  const frac = timer.total ? 1 - timer.remaining / timer.total : 1;
  const bolts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return `<circle class="bolt" cx="${43 + Math.cos(a) * 20}" cy="${43 + Math.sin(a) * 20}" r="2"/>`;
  }).join('');
  return `<svg class="timer-disc" viewBox="0 0 86 86" aria-hidden="true">
    <circle class="rim" cx="43" cy="43" r="43"/>
    <circle class="left" id="timer-arc" cx="43" cy="43" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" transform="rotate(-90 43 43)"/>
    ${bolts}
    <circle class="hole" cx="43" cy="43" r="10"/>
  </svg>`;
}

function renderTimer() {
  const el = $('#timer');
  el.className = `timer show tag-${timer.color} ${timer.finished ? 'finished' : ''}`;
  if (timer.finished) {
    el.innerHTML = `${timerDisc()}
      <div class="timer-body"><div class="timer-time">¡Vamos!</div>
      <div class="timer-label">${esc(timer.label)}</div>
      <div class="timer-ctrls"><button data-action="timer-close">Cerrar</button></div></div>`;
    return;
  }
  el.innerHTML = `${timerDisc()}
    <div class="timer-body">
      <div class="timer-time" id="timer-time">${mmss(timer.remaining)}</div>
      <div class="timer-label">${esc(timer.label)}</div>
      <div class="timer-ctrls">
        <button data-action="timer-adj" data-d="-15" aria-label="Quitar 15 segundos">−15</button>
        <button data-action="timer-pause" aria-label="${timer.paused ? 'Reanudar' : 'Pausar'}">${timer.paused ? ICON.play : ICON.pause}</button>
        <button data-action="timer-adj" data-d="15" aria-label="Añadir 15 segundos">+15</button>
        <button data-action="timer-close" aria-label="Saltar descanso">${ICON.skip}</button>
      </div>
    </div>`;
}

function updateTimer() {
  const t = $('#timer-time');
  if (t) t.textContent = mmss(timer.remaining);
  const arc = $('#timer-arc');
  if (arc) {
    const C = 2 * Math.PI * 34;
    const frac = timer.total ? 1 - timer.remaining / timer.total : 1;
    arc.setAttribute('stroke-dashoffset', C * (1 - frac));
  }
}

/* ---------- Utilidades UI ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
const lastWeight = () => [...state.weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1) || null;

/* Saca el ID de un enlace de YouTube (watch, youtu.be, shorts, embed) */
function youtubeId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
const youtubeSearch = ex => `https://www.youtube.com/results?search_query=${encodeURIComponent(`cómo hacer ${ex.name} técnica correcta`)}`;

/* =========================================================
   MODO NOCHE
   'auto' sigue al sistema (iPhone en modo oscuro → app oscura).
   ========================================================= */
const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const isDark = () => state.theme === 'dark' || (state.theme === 'auto' && !!(darkQuery && darkQuery.matches));

function applyTheme() {
  const root = document.documentElement;
  if (state.theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = state.theme;
  const color = isDark() ? '#11141a' : '#e9ebee';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
  const btn = $('#theme-toggle');
  if (btn) {
    btn.innerHTML = isDark() ? ICON.sun : ICON.moon;
    btn.setAttribute('aria-label', isDark() ? 'Cambiar a modo día' : 'Cambiar a modo noche');
  }
}

function setTheme(theme) {
  state.theme = theme;
  save();
  applyTheme();
}

if (darkQuery) {
  const onChange = () => { if (state.theme === 'auto') applyTheme(); };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange);
  else if (darkQuery.addListener) darkQuery.addListener(onChange);
}

/* =========================================================
   VISTAS
   ========================================================= */
function render() {
  const view = $('#view');
  const onboarding = !state.settings;
  $('#tabbar').hidden = onboarding;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const pill = $('#streak-pill');
  pill.hidden = onboarding;
  if (!onboarding) pill.innerHTML = `${ICON.fire} ${currentStreak()}`;

  if (onboarding) { view.innerHTML = renderSettings(true); return; }
  const views = { hoy: renderToday, rutina: renderRoutine, calendario: renderCalendar, peso: renderWeight, ajustes: () => renderSettings(false) };
  view.innerHTML = views[ui.tab]();
}

function go(tab) {
  ui.tab = tab;
  ui.draft = null;
  if (tab === 'hoy') ui.selected = keyOf(today());
  render();
  window.scrollTo({ top: 0 });
}

/* ---------- HOY ---------- */
function renderToday() {
  const t = today();
  const tk = keyOf(t);
  const sel = fromKey(ui.selected);
  const isToday = ui.selected === tk;
  const { done, planned } = weekSummary();
  const name = state.settings.name ? `, ${esc(state.settings.name)}` : '';

  const ws = startOfWeek(sel);
  let week = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i);
    const k = keyOf(d);
    const st = dayStatus(d);
    week += `<button class="week-day ${k === ui.selected ? 'selected' : ''} ${k === tk ? 'today' : ''}" data-action="select-day" data-date="${k}" aria-label="${WD_NAME[d.getDay()]} ${d.getDate()}">
      ${WD_SHORT[d.getDay()]}<b>${d.getDate()}</b><i class="pip ${st === 'rest' ? '' : st}"></i></button>`;
  }

  const lw = lastWeight();
  const needWeight = isToday && (!lw || (t - fromKey(lw.date)) / 86400000 >= 7);

  return `
    <section class="hello">
      <h1>${isToday ? `A darle${name}` : esc(prettyDate(sel))}</h1>
      ${isToday ? `<p>${esc(prettyDate(t))}</p>` : `<button class="btn ghost" data-action="select-day" data-date="${tk}">Volver a hoy</button>`}
    </section>
    <div class="figures">
      <div class="figure fire"><b>${currentStreak()}</b><span>de racha</span></div>
      <div class="figure"><b>${done}/${planned}</b><span>esta semana</span></div>
      <div class="figure"><b>${monthDone(t.getFullYear(), t.getMonth())}</b><span>este mes</span></div>
    </div>
    <div class="week">${week}</div>
    ${needWeight ? `<div class="note weigh"><span>Toca apuntar tu peso de esta semana</span><button class="btn sm iron" data-action="goto" data-tab="peso">Apuntar</button></div>` : ''}
    ${renderDay(ui.selected)}
  `;
}

function ring(count, total) {
  const R = 38, C = 2 * Math.PI * R;
  const frac = total ? count / total : 0;
  return `<svg class="hero-ring" viewBox="0 0 92 92" aria-label="${count} de ${total} ejercicios">
    <circle class="track" cx="46" cy="46" r="${R}" fill="none" stroke-width="9"/>
    <circle class="fill" cx="46" cy="46" r="${R}" fill="none" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" transform="rotate(-90 46 46)"/>
    <text x="46" y="53" text-anchor="middle" font-size="22">${count}/${total}</text>
  </svg>`;
}

function renderDay(dateKey) {
  const date = fromKey(dateKey);
  const isFuture = date > today();
  const log = state.log[dateKey] || {};
  const w = workoutFor(dateKey);

  if (log.status === 'skipped') {
    return `<div class="panel">
      <div class="empty"><div class="big">😴</div><h2>Este día no entrenaste</h2><p>Un día no es nada. Lo que cuenta es no encadenar dos.</p></div>
      <button class="btn" data-action="undo" data-date="${dateKey}">Deshacer</button>
    </div>`;
  }

  if (!w) {
    const options = WEEK_ORDER.filter(d => state.routine.days[d])
      .map(d => `<option value="${d}">${esc(state.routine.days[d].title)} (el del ${WD_NAME[d].toLowerCase()})</option>`).join('');
    return `<div class="panel">
      <div class="empty"><div class="big">🛋️</div><h2>Día de descanso</h2><p>El músculo crece mientras descansas.</p></div>
      ${isFuture || !options ? '' : `<label class="field">¿Te animas igualmente?<select id="extra-select">${options}</select></label>
        <button class="btn iron" data-action="train-extra" data-date="${dateKey}">Entrenar este día</button>`}
    </div>`;
  }

  const tpl = tplOf(w);
  const total = w.exercises.length;
  const doneCount = w.exercises.filter((e, i) => setsDone(dateKey, i) >= e.sets).length;
  const isDone = log.status === 'done';

  const list = w.exercises.map((e, i) => {
    const ex = EX_BY_ID[e.id];
    if (!ex) return '';
    const n = setsDone(dateKey, i);
    const complete = n >= e.sets;
    const bubbles = Array.from({ length: e.sets }, (_, k) =>
      `<button class="set ${k < n ? 'on' : ''} ${k === n && !isFuture ? 'next' : ''}" data-action="set" data-date="${dateKey}" data-idx="${i}" data-n="${k}" ${isFuture ? 'disabled' : ''} aria-label="Serie ${k + 1}${k < n ? ' hecha' : ''}">${k < n ? '✓' : k + 1}</button>`).join('');
    return `<article class="ex ${complete ? 'complete' : ''}">
      <div class="ex-top">
        <button class="ex-open" data-action="open-ex" data-id="${e.id}" data-date="${dateKey}" data-idx="${i}">
          <span class="ex-name">${esc(ex.name)}</span>
          <span class="ex-meta"><span>${e.sets} series de ${esc(e.reps)}</span><span>${ICON.clock} ${restText(e.rest)}</span></span>
          <span class="ex-how">${ICON.play} Cómo se hace</span>
        </button>
        ${isFuture ? '' : `<button class="icon-btn" data-action="timer-start" data-sec="${e.rest}" data-label="Descanso: ${esc(ex.name)}" data-color="${tpl.color}" aria-label="Iniciar descanso">${ICON.clock}</button>`}
      </div>
      <div class="sets">${bubbles}${!isFuture && n === 0 && i === 0 && !isDone ? '<span class="sets-hint">Toca al acabar cada serie</span>' : ''}</div>
    </article>`;
  }).join('');

  let actions = '';
  if (isFuture) actions = `<p class="muted small">Así será tu entreno de este día.</p>`;
  else if (isDone) actions = `<div class="note ok"><span>Entreno hecho. Hoy has cumplido.</span><button class="btn sm ghost" data-action="undo" data-date="${dateKey}">Deshacer</button></div>`;
  else actions = `<div class="row">
      <button class="btn go grow" data-action="mark-done" data-date="${dateKey}">${ICON.check} He entrenado</button>
      <button class="btn soft-red" data-action="mark-skip" data-date="${dateKey}">Hoy no</button>
    </div>`;

  return `
    <div class="hero tag-${tpl.color} ${isDone ? 'done' : ''}">
      <div class="hero-text">
        <p>${isDone ? 'Completado' : esc(tpl.sub || `${total} ejercicios`)}</p>
        <h2>${esc(w.title)}</h2>
      </div>
      ${ring(doneCount, total)}
    </div>
    <div class="ex-list tag-${tpl.color}">${list}</div>
    ${actions}
  `;
}

/* ---------- FICHA DEL EJERCICIO ---------- */
function openSheet(id, ctx = {}) {
  ui.sheet = { id, ...ctx };
  renderSheet();
  $('#sheet').classList.add('open');
  $('#sheet-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  ui.sheet = null;
  $('#sheet').classList.remove('open');
  $('#sheet-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  // al cerrar, se quita el iframe para que pare el vídeo
  setTimeout(() => { if (!ui.sheet) $('#sheet').innerHTML = ''; }, 350);
}

function renderSheet() {
  const { id, color, sets, reps, rest } = ui.sheet;
  const ex = EX_BY_ID[id];
  const vid = youtubeId(state.videos[id] || '');
  const sc = sets ? { sets, reps, rest } : scheme(ex, state.settings.goal, state.settings.level);

  const video = vid
    ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?playsinline=1&rel=0" title="Vídeo: ${esc(ex.name)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
       <button class="btn ghost" data-action="video-remove" data-id="${id}">Quitar este vídeo</button>`
    : `<a class="video-cta" href="${youtubeSearch(ex)}" target="_blank" rel="noopener">
        <span class="play">${ICON.play}</span>
        <span><b>Ver vídeos de cómo se hace</b><span>Se abre YouTube con la búsqueda hecha</span></span>
      </a>
      <div class="field"><span class="hint">¿Has encontrado uno que te guste? Pega el enlace y se verá aquí siempre.</span>
        <div class="link-row"><input type="url" id="video-url" placeholder="https://youtu.be/…" inputmode="url">
        <button class="btn iron" data-action="video-save" data-id="${id}">Guardar</button></div>
      </div>`;

  $('#sheet').className = `sheet open tag-${color || 'red'}`;
  $('#sheet').innerHTML = `
    <div class="grabber"></div>
    <div class="sheet-head">
      <h2>${esc(ex.name)}</h2>
      <button class="icon-btn" data-action="close-sheet" aria-label="Cerrar">${ICON.close}</button>
    </div>
    <div class="muscles">${ex.m.map(m => `<span class="muscle">${esc(m)}</span>`).join('')}</div>
    <section>${video}</section>
    <section>
      <div class="prescription">
        <div><b>${sc.sets}</b><span>series</span></div>
        <div><b>${esc(sc.reps)}</b><span>repeticiones</span></div>
        <div><b>${mmss(sc.rest)}</b><span>descanso</span></div>
      </div>
    </section>
    <section>
      <h3>Paso a paso</h3>
      <ol class="steps">${ex.s.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    </section>
    <section>
      <div class="tip"><span>💡</span><span>${esc(ex.tip)}</span></div>
    </section>
    <section>
      <button class="btn plate block" data-action="timer-start" data-sec="${sc.rest}" data-label="Descanso: ${esc(ex.name)}" data-color="${color || 'red'}" data-close="1">${ICON.clock} Empezar descanso de ${restText(sc.rest)}</button>
    </section>`;
}

/* ---------- RUTINA ---------- */
function renderRoutine() {
  const s = state.settings;
  const blocks = WEEK_ORDER.map(wd => {
    const day = state.routine.days[wd];
    if (!day) return `<div class="day-rest"><span>${WD_NAME[wd]}</span><span>Descanso</span></div>`;
    const tpl = tplOf(day);
    const list = day.exercises.map((e, i) => {
      const ex = EX_BY_ID[e.id];
      const alt = candidates(ex.p, s.equipment).length > 1;
      return `<article class="ex"><div class="ex-top">
        <button class="ex-open" data-action="open-ex" data-id="${e.id}" data-wd="${wd}" data-idx="${i}">
          <span class="ex-name">${esc(ex.name)}</span>
          <span class="ex-meta"><span>${e.sets} series de ${esc(e.reps)}</span><span>${ICON.clock} ${restText(e.rest)}</span></span>
          <span class="ex-how">${ICON.play} Cómo se hace</span>
        </button>
        ${alt ? `<button class="icon-btn" data-action="swap" data-wd="${wd}" data-idx="${i}" aria-label="Cambiar por otro ejercicio">${ICON.swap}</button>` : ''}
      </div></article>`;
    }).join('');
    return `<section class="day-block tag-${tpl.color}">
      <div class="day-label"><i class="disc"></i><h3>${WD_NAME[wd]}</h3><span class="kind">${esc(day.title)}</span></div>
      <div class="ex-list">${list}</div>
    </section>`;
  }).join('');

  return `
    <section class="hello">
      <h1>Tu semana</h1>
      <p>${s.trainingDays.length} días de entreno, nivel ${LEVELS[s.level].toLowerCase()}, objetivo: ${GOALS[s.goal].toLowerCase()}.</p>
    </section>
    <p class="muted small">Toca un ejercicio para ver cómo se hace. Con las flechas lo cambias por otro parecido.</p>
    ${blocks}
    <button class="btn block" data-action="regen">Generar otra rutina</button>
  `;
}

function swapExercise(wd, idx) {
  const day = state.routine.days[wd];
  const cur = day.exercises[idx];
  const ex = EX_BY_ID[cur.id];
  const list = candidates(ex.p, state.settings.equipment);
  const inDay = new Set(day.exercises.map(e => e.id));
  const start = list.findIndex(e => e.id === cur.id);
  for (let i = 1; i <= list.length; i++) {
    const next = list[(start + i) % list.length];
    if (!inDay.has(next.id)) {
      day.exercises[idx] = { id: next.id, ...scheme(next, state.settings.goal, state.settings.level) };
      save();
      toast(`Cambiado por ${next.name}`);
      return;
    }
  }
  toast('No hay más alternativas con tu material');
}

/* ---------- CALENDARIO ---------- */
function renderCalendar() {
  const t = today();
  if (!ui.calMonth) ui.calMonth = { y: t.getFullYear(), m: t.getMonth() };
  const { y, m } = ui.calMonth;
  const first = new Date(y, m, 1);
  const daysIn = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  let cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<div class="cal-h">${d}</div>`).join('');
  for (let i = 0; i < offset; i++) cells += `<div class="cal-d empty-cell"></div>`;
  let done = 0, failed = 0;
  for (let day = 1; day <= daysIn; day++) {
    const d = new Date(y, m, day);
    const st = dayStatus(d);
    if (st === 'done') done++;
    if (st === 'skipped' || st === 'missed') failed++;
    cells += `<button class="cal-d ${st === 'rest' ? '' : st} ${d.getTime() === t.getTime() ? 'today' : ''}" data-action="open-day" data-date="${keyOf(d)}">${day}</button>`;
  }
  const rate = done + failed ? Math.round((done / (done + failed)) * 100) : null;

  return `
    <div class="cal-nav">
      <button class="icon-btn" data-action="cal-prev" aria-label="Mes anterior">${svg('<path d="M15 5l-7 7 7 7"/>')}</button>
      <h1>${MONTHS[m]} ${y}</h1>
      <button class="icon-btn" data-action="cal-next" aria-label="Mes siguiente">${svg('<path d="M9 5l7 7-7 7"/>')}</button>
    </div>
    <div class="figures">
      <div class="figure"><b style="color:var(--green)">${done}</b><span>entrenos</span></div>
      <div class="figure"><b style="color:var(--red)">${failed}</b><span>fallados</span></div>
      <div class="figure"><b>${rate == null ? '–' : rate + '%'}</b><span>cumplimiento</span></div>
    </div>
    <div class="panel">
      <div class="cal">${cells}</div>
      <div class="legend">
        <span><i style="background:var(--green)"></i>Entrenado</span>
        <span><i style="background:var(--red)"></i>No entrené</span>
        <span><i style="box-shadow:inset 0 0 0 2px var(--red)"></i>Sin marcar</span>
        <span><i style="box-shadow:inset 0 0 0 2px var(--line)"></i>Toca entrenar</span>
      </div>
    </div>
    <p class="muted small">Toca un día para verlo o marcarlo.</p>
  `;
}

/* ---------- PESO ---------- */
function renderWeight() {
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted.at(-1);
  const firstW = sorted[0];
  const totalDiff = last && sorted.length > 1 ? last.kg - firstW.kg : null;
  const fmt = d => `${d > 0 ? '+' : ''}${d.toFixed(1)}`;

  const list = [...sorted].reverse().map((w, i, arr) => {
    const prev = arr[i + 1];
    const diff = prev ? w.kg - prev.kg : null;
    const cls = diff == null ? '' : diff > 0.04 ? 'up' : diff < -0.04 ? 'down' : 'same';
    return `<div class="w-item">
      <div class="grow"><b>${w.kg.toFixed(1)} kg</b><div class="muted small">${shortDate(w.date)}</div></div>
      ${diff == null ? '' : `<span class="delta ${cls}">${fmt(diff)} kg</span>`}
      <button class="icon-btn" data-action="del-weight" data-date="${w.date}" aria-label="Borrar registro del ${shortDate(w.date)}">${ICON.close}</button>
    </div>`;
  }).join('');

  return `
    <section class="hello"><h1>Peso</h1><p>Pésate una vez por semana, mismo día, por la mañana y en ayunas.</p></section>
    <div class="figures">
      <div class="figure"><b>${last ? last.kg.toFixed(1) : '–'}</b><span>kg ahora</span></div>
      <div class="figure"><b>${totalDiff == null ? '–' : fmt(totalDiff)}</b><span>kg desde el inicio</span></div>
      <div class="figure"><b>${sorted.length}</b><span>semanas</span></div>
    </div>
    <div class="panel">
      <h3>Apuntar el peso de hoy</h3>
      <div class="weigh-input">
        <div class="kg-field"><input type="number" id="w-kg" inputmode="decimal" step="0.1" min="20" max="400" placeholder="0.0" value="${last ? last.kg : ''}" aria-label="Peso en kilos"><span>kg</span></div>
      </div>
      <label class="field"><span class="hint">Fecha</span><input type="date" id="w-date" value="${keyOf(today())}" max="${keyOf(today())}"></label>
      <button class="btn iron" data-action="add-weight">Guardar peso</button>
    </div>
    ${sorted.length >= 2 ? `<div class="panel"><h3>Evolución</h3>${weightChart(sorted)}</div>` : ''}
    <div class="panel">
      <h3>Historial</h3>
      ${list ? `<div class="w-list">${list}</div>` : `<div class="empty"><div class="big">⚖️</div><p>Apunta tu primer peso y aquí verás cómo cambia semana a semana.</p></div>`}
    </div>
  `;
}

function weightChart(data) {
  const W = 320, H = 190, P = { l: 36, r: 12, t: 14, b: 26 };
  const pts = data.slice(-16);
  const kgs = pts.map(p => p.kg);
  let min = Math.min(...kgs), max = Math.max(...kgs);
  if (max - min < 2) { const mid = (max + min) / 2; min = mid - 1; max = mid + 1; }
  const x = i => P.l + (pts.length === 1 ? 0 : (i / (pts.length - 1)) * (W - P.l - P.r));
  const yv = v => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const line = pts.map((p, i) => `${x(i).toFixed(1)},${yv(p.kg).toFixed(1)}`).join(' ');
  const grid = [max, (max + min) / 2, min].map(v =>
    `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${yv(v)}" y2="${yv(v)}"/><text x="0" y="${yv(v) + 4}">${v.toFixed(1)}</text>`).join('');
  const dots = pts.map((p, i) => `<circle class="pt ${i === pts.length - 1 ? 'last' : ''}" cx="${x(i)}" cy="${yv(p.kg)}" r="4.5"/>`).join('');
  const labels = `<text x="${P.l}" y="${H - 6}">${shortDate(pts[0].date)}</text>
    <text x="${W - P.r}" y="${H - 6}" text-anchor="end">${shortDate(pts.at(-1).date)}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de la evolución del peso">
    ${grid}<polyline class="line" points="${line}"/>${dots}${labels}</svg>`;
}

function addWeight() {
  const date = $('#w-date').value;
  const kg = parseFloat(String($('#w-kg').value).replace(',', '.'));
  if (!date) return toast('Elige una fecha');
  if (!(kg >= 20 && kg <= 400)) return toast('Escribe un peso entre 20 y 400 kg');
  state.weights = state.weights.filter(w => w.date !== date);
  state.weights.push({ date, kg: Math.round(kg * 10) / 10 });
  save();
  toast('Peso guardado');
  render();
}

/* ---------- AJUSTES / BIENVENIDA ---------- */
function renderSettings(isOnboarding) {
  if (!ui.draft) {
    ui.draft = state.settings
      ? JSON.parse(JSON.stringify(state.settings))
      : { name: '', trainingDays: [1, 3, 5], level: 'principiante', goal: 'general', equipment: { mancuernas: true, barra_dominadas: true, banco: true, barra: false } };
  }
  const d = ui.draft;
  const dayChips = WEEK_ORDER.map(wd =>
    `<button class="chip ${d.trainingDays.includes(wd) ? 'on' : ''}" data-action="draft-day" data-wd="${wd}" aria-pressed="${d.trainingDays.includes(wd)}" aria-label="${WD_NAME[wd]}">${WD_SHORT[wd]}</button>`).join('');
  const equipChips = Object.entries(EQUIPMENT).map(([k, label]) =>
    `<button class="chip ${d.equipment[k] ? 'on' : ''}" data-action="draft-equip" data-key="${k}" aria-pressed="${!!d.equipment[k]}">${label}</button>`).join('');
  const opt = (obj, cur) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${v}</option>`).join('');

  return `
    ${isOnboarding
      ? `<section class="welcome">
          <div class="plates" aria-hidden="true">
            <i style="height:64px;background:var(--red)"></i><i style="height:56px;background:var(--blue)"></i>
            <i style="height:48px;background:var(--yellow)"></i><i style="height:40px;background:var(--green)"></i>
          </div>
          <h1>Sin excusas desde hoy</h1>
          <p>Dime cuándo y con qué entrenas y te preparo la rutina de la semana.</p>
        </section>`
      : `<section class="hello"><h1>Ajustes</h1></section>`}
    <div class="panel">
      <label class="field">Cómo te llamas
        <input type="text" id="s-name" maxlength="30" value="${esc(d.name)}" placeholder="Opcional" autocomplete="given-name">
      </label>
      <div class="field">Qué días vas a entrenar
        <span class="hint">${d.trainingDays.length} ${d.trainingDays.length === 1 ? 'día' : 'días'} a la semana</span>
        <div class="chips day-chips">${dayChips}</div>
      </div>
      <label class="field">Tu nivel<select id="s-level">${opt(LEVELS, d.level)}</select></label>
      <label class="field">Tu objetivo<select id="s-goal">${opt(GOALS, d.goal)}</select></label>
      <div class="field">Qué material tienes
        <div class="chips">${equipChips}</div>
      </div>
      <button class="btn iron" data-action="save-settings">${isOnboarding ? 'Crear mi rutina' : 'Guardar y crear rutina nueva'}</button>
    </div>
    ${isOnboarding ? '' : `
    <div class="panel">
      <h3>Apariencia</h3>
      <div class="chips">
        ${[['auto', 'Automático'], ['light', 'Día'], ['dark', 'Noche']].map(([k, label]) =>
          `<button class="chip ${state.theme === k ? 'on' : ''}" data-action="set-theme" data-theme="${k}" aria-pressed="${state.theme === k}">${label}</button>`).join('')}
      </div>
      <p class="muted small">En automático cambia sola según el modo oscuro de tu móvil.</p>
    </div>
    <div class="panel">
      <h3>Tus datos</h3>
      <p class="muted small">Todo se guarda solo en este dispositivo. Exporta una copia de vez en cuando por si cambias de móvil.</p>
      <div class="row wrap">
        <button class="btn grow" data-action="export">Exportar copia</button>
        <button class="btn grow" data-action="import">Importar copia</button>
      </div>
      <button class="btn soft-red" data-action="reset">Borrar todos los datos</button>
    </div>
    <p class="muted small" style="text-align:center">Daily Grind 1.2</p>`}
  `;
}

function readDraftInputs() {
  const d = ui.draft;
  if (!d) return;
  const n = $('#s-name'), l = $('#s-level'), g = $('#s-goal');
  if (n) d.name = n.value.trim();
  if (l) d.level = l.value;
  if (g) d.goal = g.value;
}

function saveSettings() {
  readDraftInputs();
  const d = ui.draft;
  if (!d.trainingDays.length) return toast('Elige al menos un día');
  if (d.trainingDays.length > 6) return toast('Deja al menos un día de descanso');
  const first = !state.settings;
  if (!first && !confirm('Se creará una rutina nueva con estos ajustes. ¿Seguimos?')) return;
  state.settings = JSON.parse(JSON.stringify(d));
  state.routine = generateRoutine(state.settings);
  if (!state.startDate) state.startDate = keyOf(today());
  save();
  ui.draft = null;
  toast(first ? 'Rutina creada' : 'Rutina nueva creada');
  go(first ? 'hoy' : 'rutina');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `daily-grind-${keyOf(today())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !('log' in data) || !('weights' in data)) throw new Error('formato');
      if (!confirm('Esto sustituirá tus datos actuales. ¿Continuar?')) return;
      state = migrate({ ...defaultState(), ...data });
      save();
      applyTheme();
      ui.draft = null;
      toast('Copia importada');
      go('hoy');
    } catch (e) {
      toast('Ese archivo no es una copia de Daily Grind');
    }
  };
  reader.readAsText(file);
}

/* =========================================================
   EVENTOS (delegación)
   ========================================================= */
document.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, date } = el.dataset;

  switch (action) {
    case 'goto': go(el.dataset.tab); break;
    case 'select-day': ui.selected = date; render(); break;
    case 'open-day': ui.selected = date; ui.tab = 'hoy'; render(); window.scrollTo({ top: 0 }); break;
    case 'set': tapSet(date, Number(el.dataset.idx), Number(el.dataset.n)); render(); break;
    case 'mark-done': {
      const w = workoutFor(date);
      setLog(date, { status: 'done', title: w ? w.title : '' });
      stopTimer();
      toast('Entreno apuntado. ¡Bien hecho!');
      render();
      break;
    }
    case 'mark-skip': setLog(date, { status: 'skipped' }); toast('Apuntado. Mañana toca'); render(); break;
    case 'undo': setLog(date, { status: null }); render(); break;
    case 'train-extra': setLog(date, { from: Number($('#extra-select').value) }); render(); break;

    case 'open-ex': {
      let ctx = {};
      if (el.dataset.date) {
        const w = workoutFor(el.dataset.date);
        const ex = w && w.exercises[Number(el.dataset.idx)];
        ctx = { color: tplOf(w).color, ...(ex || {}) };
      } else if (el.dataset.wd) {
        const day = state.routine.days[el.dataset.wd];
        ctx = { color: tplOf(day).color, ...day.exercises[Number(el.dataset.idx)] };
      }
      openSheet(el.dataset.id, ctx);
      break;
    }
    case 'close-sheet': closeSheet(); break;
    case 'video-save': {
      const url = $('#video-url').value.trim();
      if (!youtubeId(url)) return toast('Pega un enlace de YouTube válido');
      state.videos[el.dataset.id] = url;
      save();
      renderSheet();
      toast('Vídeo guardado');
      break;
    }
    case 'video-remove': delete state.videos[el.dataset.id]; save(); renderSheet(); break;

    case 'timer-start':
      startTimer(Number(el.dataset.sec), el.dataset.label, el.dataset.color);
      if (el.dataset.close) closeSheet();
      break;
    case 'timer-adj': adjustTimer(Number(el.dataset.d)); break;
    case 'timer-pause': togglePause(); break;
    case 'timer-close': stopTimer(); break;

    case 'swap': swapExercise(Number(el.dataset.wd), Number(el.dataset.idx)); render(); break;
    case 'regen':
      if (confirm('¿Crear otra rutina? Se perderán los cambios que hayas hecho a mano.')) {
        state.routine = generateRoutine(state.settings, true);
        save();
        toast('Rutina nueva creada');
        render();
      }
      break;
    case 'cal-prev': case 'cal-next': {
      const d = new Date(ui.calMonth.y, ui.calMonth.m + (action === 'cal-prev' ? -1 : 1), 1);
      ui.calMonth = { y: d.getFullYear(), m: d.getMonth() };
      render();
      break;
    }
    case 'add-weight': addWeight(); break;
    case 'del-weight':
      if (confirm('¿Borrar este registro de peso?')) {
        state.weights = state.weights.filter(w => w.date !== date);
        save();
        render();
      }
      break;
    case 'draft-day': {
      readDraftInputs();
      const wd = Number(el.dataset.wd);
      const days = ui.draft.trainingDays;
      ui.draft.trainingDays = days.includes(wd) ? days.filter(x => x !== wd) : [...days, wd];
      render();
      break;
    }
    case 'draft-equip':
      readDraftInputs();
      ui.draft.equipment[el.dataset.key] = !ui.draft.equipment[el.dataset.key];
      render();
      break;
    case 'toggle-theme': setTheme(isDark() ? 'light' : 'dark'); if (ui.tab === 'ajustes') render(); break;
    case 'set-theme': setTheme(el.dataset.theme); render(); break;
    case 'save-settings': saveSettings(); break;
    case 'export': exportData(); break;
    case 'import': $('#import-file').click(); break;
    case 'reset':
      if (confirm('¿Seguro? Se borrará todo: rutina, historial, pesos y vídeos.')) {
        localStorage.removeItem(STORAGE_KEY);
        state = defaultState();
        ui.draft = null;
        stopTimer();
        applyTheme();
        go('hoy');
      }
      break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'w-kg') addWeight();
  if (e.key === 'Escape' && ui.sheet) closeSheet();
});

$('#import-file').addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) importData(f);
  e.target.value = '';
});

// Al volver a la app: refresca el día y el temporizador
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (timer.active) tickTimer();
  if (state.settings && ui.tab === 'hoy' && !ui.sheet) { ui.selected = keyOf(today()); render(); }
});

/* ---------- Modo offline (PWA) ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

applyTheme();
render();
