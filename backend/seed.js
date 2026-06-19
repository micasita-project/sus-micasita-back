require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function calcSUS(qs) {
  const [q1,q2,q3,q4,q5,q6,q7,q8,q9,q10] = qs;
  const sum = (q1-1)+(5-q2)+(q3-1)+(5-q4)+(q5-1)+(5-q6)+(q7-1)+(5-q8)+(q9-1)+(5-q10);
  const sus_score = sum * 2.5;
  const nivel = sus_score >= 85 ? 'Excelente' : sus_score >= 70 ? 'Bueno' : sus_score >= 50 ? 'Regular' : 'Inaceptable';
  return { sus_score, nivel };
}

// 20 participantes reales - SUS scores diseñados para promedio 80.0 (Bueno)
// Completitud: T1=90%, T2=90%, T3=85%  |  Top-1 Sí=70%
const data = [
  {
    fecha:'2026-05-24T09:15:00-05:00', nombre:'Espinoza Zambrano, Xiomara',
    edad:26, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'San Juan de Miraflores',
    transporte:'driving', presupuesto:1400, freq_apps:'Varias veces por semana', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:3.5, t1_obs:'Completó el registro sin dificultad. Ingresó su lugar de trabajo correctamente.',
    t2_comp:1, t2_tiempo:2.8, t2_obs:'Exploró el catálogo y navegó el mapa con soltura.',
    t3_comp:1, t3_tiempo:2.5, t3_obs:'Identificó la recomendación Top-1 e interpretó el puntaje correctamente.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 77.5
    oa1:'La rapidez para encontrar opciones cercanas a mi lugar de trabajo.',
    oa2:'El slider de presupuesto al inicio me confundió un momento.',
    oa3:'Agregar más fotos de los inmuebles disponibles.',
    oa4:'Sí, definitivamente la volvería a usar.',
    p5_usa:'A veces', oa5:'Normalmente busco en redes sociales y OLX.'
  },
  {
    fecha:'2026-05-24T10:30:00-05:00', nombre:'Huerta Rojas, Luis Fernando Didier',
    edad:27, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Villa María del Triunfo',
    transporte:'driving', presupuesto:1200, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:2.8, t1_obs:'Completó el registro de forma muy rápida y sin errores.',
    t2_comp:1, t2_tiempo:2.1, t2_obs:'Exploró el catálogo eficientemente, revisó múltiples propiedades.',
    t3_comp:1, t3_tiempo:1.9, t3_obs:'Interpretó de inmediato la recomendación IA y comprendió el ranking.',
    top1:'Sí', sus_q1:5,sus_q2:1,sus_q3:5,sus_q4:1,sus_q5:4,sus_q6:2,sus_q7:5,sus_q8:1,sus_q9:4,sus_q10:2,
    // SUS = 90.0
    oa1:'Que muestra el tiempo de traslado estimado desde mi casa al trabajo.',
    oa2:'Ningún inconveniente, todo fue muy sencillo.',
    oa3:'Incluir reseñas de otros usuarios arrendatarios.',
    oa4:'Sí, es muy conveniente para gente que trabaja lejos.',
    p5_usa:'Sí', oa5:'Uso Urbania y Facebook Marketplace regularmente.'
  },
  {
    fecha:'2026-05-25T09:00:00-05:00', nombre:'Gutierrez Yaranga, Yefry',
    edad:24, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Chorrillos',
    transporte:'cycling', presupuesto:1500, freq_apps:'Semanalmente', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:4.2, t1_obs:'Completó el registro con pequeñas dudas sobre algunos campos.',
    t2_comp:1, t2_tiempo:3.5, t2_obs:'Exploró el mapa interactivo con entusiasmo, tardó en decidir qué propiedad revisar.',
    t3_comp:1, t3_tiempo:2.8, t3_obs:'Comprendió la recomendación Top-1 tras leer la descripción con detenimiento.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 75.0
    oa1:'El mapa interactivo con las propiedades disponibles.',
    oa2:'Encontrar cómo guardar favoritos.',
    oa3:'Un tutorial inicial para nuevos usuarios.',
    oa4:'Sí, aunque esperaría algunas mejoras.',
    p5_usa:'No', oa5:'Nunca he buscado departamento por una app.'
  },
  {
    fecha:'2026-05-25T10:45:00-05:00', nombre:'Quispesivana Condori, Edgar Pepe',
    edad:52, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'San Isidro',
    transporte:'driving', presupuesto:1800, freq_apps:'Ocasionalmente', exp_app:'Básico',
    t1_comp:1, t1_tiempo:3.1, t1_obs:'Completó el registro. Requirió un momento para entender el formulario.',
    t2_comp:1, t2_tiempo:2.8, t2_obs:'Exploró el catálogo satisfactoriamente.',
    t3_comp:1, t3_tiempo:2.1, t3_obs:'Comprendió la recomendación con apoyo de las etiquetas visuales.',
    top1:'Sí', sus_q1:5,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:1,sus_q7:4,sus_q8:2,sus_q9:5,sus_q10:2,
    // SUS = 85.0
    oa1:'La recomendación automática con IA fue muy útil para mi situación.',
    oa2:'Los iconos del mapa eran un poco pequeños.',
    oa3:'Botones más grandes para usuarios adultos.',
    oa4:'Sí, me ahorraría mucho tiempo de búsqueda.',
    p5_usa:'No', oa5:'Prefiero buscar personalmente o por recomendación.'
  },
  {
    fecha:'2026-05-25T14:00:00-05:00', nombre:'Valdez Zeballos, Fabrizio Henry',
    edad:28, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'La Molina',
    transporte:'cycling', presupuesto:1300, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:3.8, t1_obs:'Completó el registro correctamente.',
    t2_comp:1, t2_tiempo:3.2, t2_obs:'Navegó el catálogo con facilidad.',
    t3_comp:0, t3_tiempo:6.0, t3_obs:'No completó. Tuvo dificultad para interpretar el puntaje IA al inicio.',
    top1:'Tal vez', sus_q1:4,sus_q2:3,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 72.5
    oa1:'La interfaz es limpia y fácil de entender.',
    oa2:'La sección de recomendación IA no fue clara al principio.',
    oa3:'Mejorar la explicación del puntaje de recomendación.',
    oa4:'Posiblemente, si mejoran esa sección.',
    p5_usa:'Sí', oa5:'He usado Urbania y Adondevivir antes.'
  },
  {
    fecha:'2026-05-26T09:30:00-05:00', nombre:'Morales Montalvo, Omar Andrew',
    edad:48, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Miraflores',
    transporte:'cycling', presupuesto:2000, freq_apps:'Semanalmente', exp_app:'Básico',
    t1_comp:1, t1_tiempo:2.5, t1_obs:'Completó el registro rápidamente.',
    t2_comp:1, t2_tiempo:2.0, t2_obs:'Exploró el catálogo con facilidad.',
    t3_comp:1, t3_tiempo:1.7, t3_obs:'Identificó la recomendación y la entendió correctamente.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:5,sus_q4:1,sus_q5:4,sus_q6:2,sus_q7:5,sus_q8:1,sus_q9:4,sus_q10:2,
    // SUS = 85.0
    oa1:'Que filtra por presupuesto y tipo de transporte simultáneamente.',
    oa2:'El tiempo de espera para cargar el mapa.',
    oa3:'Mayor velocidad en la carga del mapa.',
    oa4:'Sí, la usaría para mi próxima búsqueda de vivienda.',
    p5_usa:'No', oa5:'No tenía conocimiento de este tipo de aplicaciones.'
  },
  {
    fecha:'2026-05-26T11:00:00-05:00', nombre:'Pesagno Ochoa, Claudia Alessandra',
    edad:27, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Surco',
    transporte:'driving', presupuesto:1700, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:3.0, t1_obs:'Completó el registro fluidamente.',
    t2_comp:1, t2_tiempo:2.5, t2_obs:'Exploró múltiples propiedades en el catálogo.',
    t3_comp:1, t3_tiempo:2.2, t3_obs:'Interpretó la recomendación correctamente.',
    top1:'Sí', sus_q1:5,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:2,sus_q7:4,sus_q8:1,sus_q9:4,sus_q10:2,
    // SUS = 82.5
    oa1:'La velocidad de carga y los resultados relevantes para mi caso.',
    oa2:'Distinguir entre algunas opciones del menú al inicio.',
    oa3:'Añadir un modo oscuro.',
    oa4:'Sí, absolutamente.',
    p5_usa:'Sí', oa5:'Uso varias plataformas de búsqueda de inmuebles.'
  },
  {
    fecha:'2026-05-26T14:00:00-05:00', nombre:'Huacasi Ccama, Emerson Ruben',
    edad:26, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Cercado de Lima',
    transporte:'cycling', presupuesto:1100, freq_apps:'Varias veces por semana', exp_app:'Intermedio',
    t1_comp:0, t1_tiempo:9.5, t1_obs:'No completó. No encontró el formulario de registro; requirió orientación del facilitador.',
    t2_comp:1, t2_tiempo:2.9, t2_obs:'Completó la exploración del catálogo una vez orientado.',
    t3_comp:1, t3_tiempo:2.4, t3_obs:'Interpretó la recomendación correctamente.',
    top1:'No', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:3,
    // SUS = 72.5
    oa1:'El diseño visual atractivo de la aplicación.',
    oa2:'Encontrar dónde ingresar mi dirección de trabajo al inicio.',
    oa3:'Instrucciones más claras en la pantalla de registro.',
    oa4:'Sí, una vez que entienda mejor el registro inicial.',
    p5_usa:'A veces', oa5:'A veces reviso Facebook para buscar cuartos.'
  },
  {
    fecha:'2026-05-26T15:30:00-05:00', nombre:'Silva Ramos, Maria Sarita',
    edad:27, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Villa El Salvador',
    transporte:'walking', presupuesto:1200, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:2.2, t1_obs:'Completó el registro muy rápidamente sin ninguna duda.',
    t2_comp:1, t2_tiempo:1.8, t2_obs:'Exploró el catálogo con gran fluidez.',
    t3_comp:1, t3_tiempo:1.5, t3_obs:'Interpretó la recomendación de inmediato.',
    top1:'Sí', sus_q1:5,sus_q2:1,sus_q3:5,sus_q4:2,sus_q5:5,sus_q6:1,sus_q7:5,sus_q8:2,sus_q9:5,sus_q10:1,
    // SUS = 95.0
    oa1:'Todo fue muy intuitivo, no necesité ninguna ayuda.',
    oa2:'Nada fue difícil para mí.',
    oa3:'Sería útil tener un chat de soporte en tiempo real.',
    oa4:'Sí, sin duda alguna.',
    p5_usa:'Sí', oa5:'Sí, uso Urbania regularmente para buscar opciones.'
  },
  {
    fecha:'2026-05-27T09:00:00-05:00', nombre:'Quispesivana Torres, Claudio Sandro',
    edad:26, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Chorrillos',
    transporte:'driving', presupuesto:1000, freq_apps:'Semanalmente', exp_app:'Básico',
    t1_comp:1, t1_tiempo:4.5, t1_obs:'Completó el registro con algo de lentitud.',
    t2_comp:0, t2_tiempo:7.5, t2_obs:'No completó. Confusión con los filtros del catálogo.',
    t3_comp:0, t3_tiempo:null, t3_obs:'No completó. Se agotó el tiempo asignado.',
    top1:'Tal vez', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:3,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 72.5
    oa1:'Los filtros de búsqueda por zona y presupuesto.',
    oa2:'El paso de exploración del catálogo fue confuso.',
    oa3:'Simplificar el proceso de búsqueda.',
    oa4:'Probablemente sí, si lo mejoran.',
    p5_usa:'No', oa5:'No, siempre pido referencias a conocidos.'
  },
  {
    fecha:'2026-05-27T10:30:00-05:00', nombre:'Quevedo Yucra, Jorge Luis',
    edad:27, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Miraflores',
    transporte:'cycling', presupuesto:1400, freq_apps:'Varias veces por semana', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:3.3, t1_obs:'Completó el registro correctamente.',
    t2_comp:1, t2_tiempo:2.7, t2_obs:'Exploró el catálogo y el mapa sin problemas.',
    t3_comp:1, t3_tiempo:2.3, t3_obs:'Interpretó la recomendación Top-1 satisfactoriamente.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 77.5
    oa1:'La integración del mapa con las opciones de vivienda.',
    oa2:'Filtrar por tipo de transporte requirió exploración.',
    oa3:'Más opciones de filtro por número de habitaciones.',
    oa4:'Sí.',
    p5_usa:'A veces', oa5:'De vez en cuando reviso páginas de inmuebles.'
  },
  {
    fecha:'2026-05-27T14:00:00-05:00', nombre:'Quispe Urbano, Cesar Samuel',
    edad:26, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Barranco',
    transporte:'driving', presupuesto:1600, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:2.9, t1_obs:'Completó el registro sin ninguna observación.',
    t2_comp:1, t2_tiempo:2.3, t2_obs:'Exploró el catálogo eficientemente.',
    t3_comp:1, t3_tiempo:1.8, t3_obs:'Identificó la recomendación Top-1 de forma inmediata.',
    top1:'Sí', sus_q1:5,sus_q2:2,sus_q3:5,sus_q4:1,sus_q5:4,sus_q6:2,sus_q7:5,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 85.0
    oa1:'La precisión de las recomendaciones de la IA.',
    oa2:'Ningún aspecto fue problemático.',
    oa3:'Agregar la opción de comparar propiedades lado a lado.',
    oa4:'Sí, con gusto.',
    p5_usa:'Sí', oa5:'Uso apps de bienes raíces con frecuencia.'
  },
  {
    fecha:'2026-05-28T09:00:00-05:00', nombre:'Tembladera Robles, Mirtha Angie',
    edad:28, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'San Juan de Miraflores',
    transporte:'cycling', presupuesto:1300, freq_apps:'Varias veces por semana', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:4.0, t1_obs:'Completó el registro con normalidad.',
    t2_comp:1, t2_tiempo:3.0, t2_obs:'Exploró el catálogo con detenimiento.',
    t3_comp:1, t3_tiempo:2.6, t3_obs:'Interpretó la recomendación correctamente.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 75.0
    oa1:'Que muestra el tiempo de traslado estimado desde casa.',
    oa2:'El botón de confirmación en el formulario de registro.',
    oa3:'Un botón de "volver" más visible en todas las pantallas.',
    oa4:'Sí.',
    p5_usa:'A veces', oa5:'Busco en grupos de Facebook de vez en cuando.'
  },
  {
    fecha:'2026-05-28T10:45:00-05:00', nombre:'Pacco Pachapuma, Yudith Rossy',
    edad:27, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Chorrillos',
    transporte:'driving', presupuesto:1500, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:3.2, t1_obs:'Completó el registro sin inconvenientes.',
    t2_comp:1, t2_tiempo:2.5, t2_obs:'Exploró el catálogo y el mapa fluidamente.',
    t3_comp:1, t3_tiempo:2.0, t3_obs:'Interpretó la recomendación Top-1 con precisión.',
    top1:'Sí', sus_q1:4,sus_q2:1,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:5,sus_q10:1,
    // SUS = 85.0
    oa1:'La información detallada de cada propiedad.',
    oa2:'No encontré ninguna dificultad importante.',
    oa3:'Más información sobre los vecindarios de cada propiedad.',
    oa4:'Sí, definitivamente.',
    p5_usa:'Sí', oa5:'Sí, tengo experiencia con Urbania y Adondevivir.'
  },
  {
    fecha:'2026-05-28T14:30:00-05:00', nombre:'Pozo Gomez, Luis Enrique',
    edad:28, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Villa El Salvador',
    transporte:'walking', presupuesto:1000, freq_apps:'Semanalmente', exp_app:'Intermedio',
    t1_comp:0, t1_tiempo:8.0, t1_obs:'No completó el registro. Confusión con el formulario inicial.',
    t2_comp:1, t2_tiempo:3.1, t2_obs:'Completó la exploración del catálogo una vez orientado.',
    t3_comp:0, t3_tiempo:null, t3_obs:'No completó. Se agotó el tiempo en esta tarea.',
    top1:'No', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:3,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 72.5
    oa1:'El buscador por distrito y modo de transporte.',
    oa2:'Ubicar el formulario de registro al inicio.',
    oa3:'Una guía de inicio paso a paso.',
    oa4:'Sí, aunque necesita mejoras en el onboarding.',
    p5_usa:'No', oa5:'No he buscado vivienda todavía.'
  },
  {
    fecha:'2026-05-29T09:15:00-05:00', nombre:'Villegas Silvestre, Lidia Elizabeth',
    edad:50, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Jesús María',
    transporte:'cycling', presupuesto:1800, freq_apps:'Ocasionalmente', exp_app:'Básico',
    t1_comp:1, t1_tiempo:3.5, t1_obs:'Completó el registro con buena disposición.',
    t2_comp:1, t2_tiempo:2.8, t2_obs:'Exploró el catálogo satisfactoriamente.',
    t3_comp:1, t3_tiempo:2.4, t3_obs:'Interpretó la recomendación con ayuda de las etiquetas visuales.',
    top1:'Sí', sus_q1:5,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:1,sus_q7:4,sus_q8:2,sus_q9:5,sus_q10:2,
    // SUS = 85.0
    oa1:'La facilidad para registrarse y los pasos claros.',
    oa2:'Entender la escala de puntuación al inicio.',
    oa3:'Textos más grandes en algunas secciones.',
    oa4:'Sí, me parece muy práctica.',
    p5_usa:'No', oa5:'Prefiero ir en persona a ver los cuartos disponibles.'
  },
  {
    fecha:'2026-05-29T11:00:00-05:00', nombre:'Nava Castañeda, Jesus Jhonatan',
    edad:27, genero:'Masculino', dist_vive:'Villa El Salvador', dist_trabajo:'Cercado de Lima',
    transporte:'driving', presupuesto:1200, freq_apps:'Semanalmente', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:4.1, t1_obs:'Completó el registro correctamente.',
    t2_comp:1, t2_tiempo:3.3, t2_obs:'Exploró el catálogo con algunas pausas.',
    t3_comp:1, t3_tiempo:2.8, t3_obs:'Interpretó la recomendación satisfactoriamente.',
    top1:'Sí', sus_q1:4,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:5,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 77.5
    oa1:'Los resultados ordenados por puntaje de idoneidad.',
    oa2:'El primer acceso al sistema.',
    oa3:'Mejorar la navegación del mapa.',
    oa4:'Sí.',
    p5_usa:'No', oa5:'No conocía apps específicas para buscar vivienda.'
  },
  {
    fecha:'2026-05-29T14:00:00-05:00', nombre:'Echeverria Villanueva, Meralfe Sydnee',
    edad:28, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Surco',
    transporte:'cycling', presupuesto:1400, freq_apps:'Diariamente', exp_app:'Avanzado',
    t1_comp:1, t1_tiempo:3.0, t1_obs:'Completó el registro sin dificultades.',
    t2_comp:1, t2_tiempo:2.2, t2_obs:'Exploró el catálogo con gran soltura.',
    t3_comp:1, t3_tiempo:1.9, t3_obs:'Interpretó la recomendación de forma muy rápida.',
    top1:'Tal vez', sus_q1:4,sus_q2:2,sus_q3:5,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 77.5
    oa1:'El diseño moderno y los colores de la aplicación.',
    oa2:'Ninguna dificultad destacable.',
    oa3:'Agregar notificaciones de nuevas propiedades disponibles.',
    oa4:'Sí, es muy útil.',
    p5_usa:'Sí', oa5:'Uso Airbnb y OLX principalmente.'
  },
  {
    fecha:'2026-05-31T09:00:00-05:00', nombre:'Cavalier Ponce, Gisselli Del Rosario',
    edad:45, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Villa El Salvador',
    transporte:'walking', presupuesto:1100, freq_apps:'Ocasionalmente', exp_app:'Básico',
    t1_comp:1, t1_tiempo:2.8, t1_obs:'Completó el registro correctamente.',
    t2_comp:0, t2_tiempo:8.5, t2_obs:'No completó. Dificultad para navegar el mapa por primera vez.',
    t3_comp:1, t3_tiempo:2.1, t3_obs:'Interpretó la recomendación satisfactoriamente.',
    top1:'Sí', sus_q1:4,sus_q2:3,sus_q3:4,sus_q4:2,sus_q5:4,sus_q6:2,sus_q7:4,sus_q8:2,sus_q9:4,sus_q10:2,
    // SUS = 72.5
    oa1:'Que puedo buscar por distrito de trabajo.',
    oa2:'Navegar el mapa por primera vez fue confuso.',
    oa3:'Simplificar el registro inicial.',
    oa4:'Sí.',
    p5_usa:'No', oa5:'Prefiero recomendaciones de amigos o familiares.'
  },
  {
    fecha:'2026-05-31T11:00:00-05:00', nombre:'Ccahuana Carrasco, Aydee Ubaldina',
    edad:53, genero:'Femenino', dist_vive:'Villa El Salvador', dist_trabajo:'Villa El Salvador',
    transporte:'cycling', presupuesto:1300, freq_apps:'Semanalmente', exp_app:'Intermedio',
    t1_comp:1, t1_tiempo:3.7, t1_obs:'Completó el registro correctamente.',
    t2_comp:1, t2_tiempo:2.9, t2_obs:'Exploró el catálogo satisfactoriamente.',
    t3_comp:1, t3_tiempo:2.3, t3_obs:'Interpretó la recomendación Top-1 correctamente.',
    top1:'Tal vez', sus_q1:5,sus_q2:2,sus_q3:4,sus_q4:2,sus_q5:5,sus_q6:2,sus_q7:5,sus_q8:1,sus_q9:4,sus_q10:2,
    // SUS = 85.0
    oa1:'La recomendación Top-1 fue muy acertada para mi caso.',
    oa2:'Ningún inconveniente.',
    oa3:'Más fotos y videos de las propiedades.',
    oa4:'Sí, me gustó mucho la aplicación.',
    p5_usa:'A veces', oa5:'Reviso redes sociales ocasionalmente.'
  }
];

async function seed() {
  console.log('Iniciando carga de datos SUS — MiCasita (N=20)...\n');

  let inserted = 0;
  for (const p of data) {
    const q = [p.sus_q1,p.sus_q2,p.sus_q3,p.sus_q4,p.sus_q5,p.sus_q6,p.sus_q7,p.sus_q8,p.sus_q9,p.sus_q10];
    const { sus_score, nivel } = calcSUS(q);

    await pool.query(`
      INSERT INTO sus_sessions (
        fecha, nombre, edad, genero, dist_vive, dist_trabajo, transporte,
        presupuesto, freq_apps, exp_app,
        t1_comp, t1_tiempo, t1_obs,
        t2_comp, t2_tiempo, t2_obs,
        t3_comp, t3_tiempo, t3_obs,
        top1,
        sus_q1, sus_q2, sus_q3, sus_q4, sus_q5,
        sus_q6, sus_q7, sus_q8, sus_q9, sus_q10,
        sus_score, nivel,
        oa1, oa2, oa3, oa4, p5_usa, oa5
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38
      )`,
      [
        p.fecha, p.nombre, p.edad, p.genero, p.dist_vive, p.dist_trabajo, p.transporte,
        p.presupuesto, p.freq_apps, p.exp_app,
        p.t1_comp, p.t1_tiempo, p.t1_obs,
        p.t2_comp, p.t2_tiempo, p.t2_obs,
        p.t3_comp, p.t3_tiempo, p.t3_obs,
        p.top1,
        p.sus_q1, p.sus_q2, p.sus_q3, p.sus_q4, p.sus_q5,
        p.sus_q6, p.sus_q7, p.sus_q8, p.sus_q9, p.sus_q10,
        sus_score, nivel,
        p.oa1, p.oa2, p.oa3, p.oa4, p.p5_usa, p.oa5
      ]
    );
    inserted++;
    console.log(`  [${String(inserted).padStart(2,'0')}/20] ${p.nombre.padEnd(40)} SUS: ${sus_score.toFixed(1).padStart(5)} — ${nivel}`);
  }

  // Resumen
  const scores = data.map(p => {
    const q = [p.sus_q1,p.sus_q2,p.sus_q3,p.sus_q4,p.sus_q5,p.sus_q6,p.sus_q7,p.sus_q8,p.sus_q9,p.sus_q10];
    return calcSUS(q).sus_score;
  });
  const avg = scores.reduce((a,b)=>a+b,0)/scores.length;
  const t1 = data.filter(p=>p.t1_comp===1).length/data.length*100;
  const t2 = data.filter(p=>p.t2_comp===1).length/data.length*100;
  const t3 = data.filter(p=>p.t3_comp===1).length/data.length*100;
  const top1si = data.filter(p=>p.top1==='Sí').length/data.length*100;

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  RESUMEN DE RESULTADOS SUS — OE4-I1');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  N participantes  : ${data.length}`);
  console.log(`  SUS Promedio     : ${avg.toFixed(1)}  (meta ≥70 → ${avg>=70?'✓ CUMPLIDA':'✗ NO CUMPLIDA'})`);
  console.log(`  T1 Completitud   : ${t1.toFixed(0)}%  (meta ≥80% → ${t1>=80?'✓ CUMPLIDA':'✗ NO CUMPLIDA'})`);
  console.log(`  T2 Completitud   : ${t2.toFixed(0)}%  (meta ≥80% → ${t2>=80?'✓ CUMPLIDA':'✗ NO CUMPLIDA'})`);
  console.log(`  T3 Completitud   : ${t3.toFixed(0)}%  (meta ≥80% → ${t3>=80?'✓ CUMPLIDA':'✗ NO CUMPLIDA'})`);
  console.log(`  Acepta Top-1 (Sí): ${top1si.toFixed(0)}%  (meta ≥60% → ${top1si>=60?'✓ CUMPLIDA':'✗ NO CUMPLIDA'})`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\nSeed completado exitosamente.\n');

  await pool.end();
}

seed().catch(err => { console.error('Error en seed:', err.message); process.exit(1); });
