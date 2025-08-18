// Constantes globales
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';
const THEME_KEY = 'miniCrmB2B_theme';

// Plantillas base por industria
const DEFAULT_TEMPLATES = {
  'Hotelería': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, soy de GetLavado. Ayudamos a hoteles como {{companyName}} a mantener toallas y sábanas con blancura 5⭐ y entregas puntuales. Hoy tenemos 2 cupos para prueba gratuita esta semana (se agotan rápido). ¿Te viene una demo de 15 min hoy o mañana? 🏨✨' },
    { title: '2) Seguimiento', text: 'Hola {{contactName}}, ¿pudiste revisar mi mensaje? En {{companyName}} podrían ahorrar tiempo y mejorar la experiencia del huésped con: \n• Blancura uniforme \n• Entrega a tiempo \n• Control de inventario. \n¿Te agendo una demo express esta semana? �' },
    { title: '3) Último toque', text: '{{contactName}}, cierro hilo por ahora. Aún me queda 1 cupo de prueba gratuita para hoteles esta semana. Si te interesa, te aparto ese espacio para {{companyName}}. Si no aplica, me indicas y no molesto más. 🙌' }
  ],
  'Clínica': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, en GetLavado trabajamos con protocolos sanitarios y esterilización certificada para clínicas. Podemos ayudar a {{companyName}} con higiene rigurosa y entregas 24/7. Tengo cupos para una prueba guiada esta semana. ¿Agendamos 15 min? 🏥✨' },
    { title: '2) Seguimiento', text: '{{contactName}}, ¿qué te parecería reducir rechazos por manchas y mejorar la rotación? En {{companyName}} podemos aplicar control de calidad por lote y trazabilidad. ¿Te muestro un caso rápido mañana? 📈' },
    { title: '3) Último toque', text: 'Cierro el hilo, {{contactName}}. Queda 1 espacio de onboarding esta semana para clínicas. Si te encaja, lo reservo para {{companyName}}. Si no, te leo y cierro. 🙏' }
  ],
  'Residencial': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, ayudamos a residencias como {{companyName}} con ropa de cama impecable y entregas puntuales. Podemos comenzar con una prueba en 48h. ¿Te coordino una llamada de 10-15 min? 🏠' },
    { title: '2) Seguimiento', text: '{{contactName}}, beneficios típicos para residencias: \n• Puntualidad \n• Ropa suave y sin perfumes fuertes \n• Menos retrabajos. ¿Vemos un piloto esta semana? ✅' },
    { title: '3) Último toque', text: '{{contactName}}, última nota: tengo 1 horario libre para pilotos de residencias. Si te interesa para {{companyName}}, lo aparto hoy. Si no aplica, me dices y cierro. 👍' }
  ],
  'Spa': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, mantenemos toallas y batas con suavidad premium y neutras para spa. {{companyName}} podría comenzar con una prueba sin costo. ¿Te va 15 min hoy/mañana? 💆‍♀️' },
    { title: '2) Seguimiento', text: '{{contactName}}, valor para {{companyName}}: \n• Suavidad consistente \n• Sin perfumes intensos \n• Entregas puntuales. ¿Te muestro referencias + tiempos? 📦' },
    { title: '3) Último toque', text: 'Cierro por ahora. Queda 1 demo libre esta semana para spa. Si te interesa para {{companyName}}, te reservo. Si no, sin problema. �' }
  ],
  'Airbnb': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, optimizamos la rotación de ropa para Airbnb: recogidas y entregas sincronizadas por reserva. {{companyName}} puede empezar con plan piloto. ¿Te agendo 15 min? 🏡' },
    { title: '2) Seguimiento', text: '{{contactName}}, con GetLavado: \n• Check-in sin estrés \n• Inventario controlado \n• Tarifa plana. ¿Vemos números para {{companyName}}? 💸' },
    { title: '3) Último toque', text: 'Último ping, {{contactName}}. Queda 1 cupo de piloto Airbnb esta semana. Si te encaja para {{companyName}}, lo aparto. Si no, cierro hilo. 👍' }
  ],
  'default': [
    { title: '1) Primer contacto', text: 'Hola {{contactName}} 👋, en GetLavado ayudamos a empresas como {{companyName}} con lavandería confiable, rápida y de calidad. Tengo cupos para una demo de 15 min esta semana. ¿La agendamos? 🚀' },
    { title: '2) Seguimiento', text: '{{contactName}}, típicamente logramos: \n• Menos retrabajos \n• Entregas a tiempo \n• Calidad consistente. ¿Te muestro un caso en 10 min? 📈' },
    { title: '3) Último toque', text: 'Cierro por ahora. Aún tengo 1 espacio para prueba gratuita esta semana para {{companyName}}. Si te interesa, te reservo. Si no aplica, me dices y cierro. �' }
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
  try {
    window.dispatchEvent(new CustomEvent('state:changed', { detail: state }));
  } catch (e) {
    // fallbacks silenciosos en entornos restringidos
  }
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// Tema oscuro: persistencia y toggle
export function isDarkMode() {
  // preferencia del usuario en localStorage; si no hay preferencia, usar LIGHT por defecto
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored === 'dark';
  return false; // default a modo claro
}

export function applyTheme(dark) {
  try {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  } catch (e) {
    console.warn('No se pudo aplicar el tema:', e.message);
  }
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
    const toObj = (entry, idx) => {
      if (typeof entry === 'string') {
        const titles = ['1) Primer contacto', '2) Seguimiento', '3) Último toque'];
        return { title: titles[idx] || `Mensaje ${idx + 1}`, text: entry };
      }
      if (entry && typeof entry === 'object' && 'text' in entry) return entry;
      return { title: `Mensaje ${idx + 1}`, text: '' };
    };

    const ensureThree = (arr) => {
      const out = arr.map(toObj);
      while (out.length < 3) out.push({ title: `Mensaje ${out.length + 1}`, text: '' });
      return out.slice(0, 3);
    };

    Object.keys(DEFAULT_TEMPLATES).forEach(key => {
      if (key === 'default') return;
      if (!Array.isArray(state.templates[key]) || state.templates[key].length === 0) {
        // no sobreescribe si ya existe contenido del usuario
        state.templates[key] = DEFAULT_TEMPLATES[key].slice();
      }
      state.templates[key] = ensureThree(state.templates[key]);
    });
}
