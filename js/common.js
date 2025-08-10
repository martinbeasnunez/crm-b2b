// Constantes globales
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';

// Plantillas base por industria
const DEFAULT_TEMPLATES = {
  'Hotelería': [
    '¡Hola {{contactName}}! 👋 En {{companyName}} podemos garantizar blancura perfecta en toallas y sábanas, con entregas puntuales y control VIP. ¿Agendamos una prueba esta semana? 🏨✨',
    '{{contactName}}, impulsa la experiencia de tus huéspedes en {{companyName}}:\n✅ Blancura total\n✅ Entregas a tiempo\n✅ Protocolos VIP\n\n¿Coordinamos una visita? 🏨'
  ],
  'Clínica': [
    '¡Hola {{contactName}}! En {{companyName}} la higiene es crítica. Ofrecemos esterilización certificada y control de calidad riguroso. ¿Te muestro cómo operamos? 🏥✨',
    '{{contactName}}, protocolos sanitarios y servicio 24/7 para {{companyName}}. Optimiza costos sin perder calidad. ¿Conversamos? 🏥'
  ],
  'Residencial': [
    'Hola {{contactName}}, en {{companyName}} podemos mejorar la rotación y cuidado de ropa de cama y toallas. Servicio confiable y precios claros. ¿Te interesa una demo? 🏠',
    '{{contactName}}, cuidamos la ropa de cama de {{companyName}} con estándares hoteleros. Calidad y puntualidad. ¿Agendamos? 🏠'
  ],
  'Spa': [
    'Hola {{contactName}} 👋, en {{companyName}} podemos mantener toallas y batas impecables con suavidad premium. ¿Coordinamos una prueba? 💆‍♀️',
    'Para {{companyName}}: lavado delicado, perfumes neutros y entregas puntuales. ¿Te va una demo? 💆'
  ],
  'Airbnb': [
    'Hola {{contactName}}, escalamos la operación de lavandería para {{companyName}} con retiros y entregas sincronizados por reserva. ¿Te cuento? 🏡',
    'Check-in sin estrés para {{companyName}}: ropa impecable, inventario controlado y tarifa plana. ¿Agendamos? 🏡'
  ],
  'default': [
    'Hola {{contactName}}, ¿cómo podemos ayudar a {{companyName}} hoy?\n✅ Servicio personalizado\n✅ Atención inmediata\n\n¿Coordinamos una llamada? 🤝',
    '{{contactName}}, optimiza las operaciones de {{companyName}}:\n✅ Servicio confiable\n✅ Precios transparentes\n✅ Calidad garantizada\n\n¿Coordinamos una visita? 🚀'
  ]
};

// Estado y persistencia
export function getState() {
  let raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    normalizeTemplates(parsed);
    localStorage.setItem(LS_KEY, JSON.stringify(parsed));
    return parsed;
  }
  
  const initialState = {
    leads: [
      {companyName:'Ramada Encore',contactName:'Úrsula',phone:'+51999999999',industry:'Hotelería',size:60,district:'San Isidro',email:'',notes:'',source:'Web',status:'Nuevo'},
      {companyName:'Clínica Providencia',contactName:'Admisión',phone:'+51988888888',industry:'Clínica',size:80,district:'San Borja',email:'',notes:'',source:'Web',status:'Calificado'},
      {companyName:'Casa Convivencia',contactName:'María',phone:'+51977777777',industry:'Residencial',size:30,district:'Miraflores',email:'',notes:'',source:'Web',status:'En Conversación'}
    ],
    templates: DEFAULT_TEMPLATES,
    reminders: []
  };
  
  localStorage.setItem(LS_KEY, JSON.stringify(initialState));
  return initialState;
}

export function setState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function scoreICP(lead) {
  let score = 0;
  if (INDUSTRIAS_ICP.includes(lead.industry)) score += 10;
  if (DISTRICTS.includes(lead.district)) score += 10;
  if (lead.size && lead.size >= 50) score += 5;
  if (/^\+51\d{9}$/.test(lead.phone)) score += 5;
  return score;
}

// Exportar constantes
export { STAGES, DISTRICTS, INDUSTRIAS_ICP };

// Helpers de normalización
function normalizeTemplates(state) {
  if (!state.templates) state.templates = {};
  // asegurar 'default'
  if (!Array.isArray(state.templates.default) || state.templates.default.length === 0) {
    state.templates.default = DEFAULT_TEMPLATES.default.slice();
  }
  // rellenar industrias conocidas si faltan
  Object.keys(DEFAULT_TEMPLATES).forEach(key => {
    if (key === 'default') return;
    if (!Array.isArray(state.templates[key]) || state.templates[key].length === 0) {
      // no sobreescribe si ya existe contenido del usuario
      state.templates[key] = DEFAULT_TEMPLATES[key].slice();
    }
  });
}
