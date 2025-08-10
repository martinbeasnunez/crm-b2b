// Constantes globales
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';

// Estado y persistencia
export function getState() {
  let state = localStorage.getItem(LS_KEY);
  if (state) return JSON.parse(state);
  
  const initialState = {
    leads: [
      {companyName:'Ramada Encore',contactName:'Úrsula',phone:'+51999999999',industry:'Hotelería',size:60,district:'San Isidro',email:'',notes:'',source:'Web',status:'Nuevo'},
      {companyName:'Clínica Providencia',contactName:'Admisión',phone:'+51988888888',industry:'Clínica',size:80,district:'San Borja',email:'',notes:'',source:'Web',status:'Calificado'},
      {companyName:'Casa Convivencia',contactName:'María',phone:'+51977777777',industry:'Residencial',size:30,district:'Miraflores',email:'',notes:'',source:'Web',status:'En Conversación'}
    ],
    templates: {
      'Hotelería': [
        '¡Hola {{contactName}}! 👋 GetLavado es el servicio VIP que {{companyName}} necesita. Blancura inmaculada garantizada en toallas y sábanas + uniformes impecables. 864 hoteles ya confían en nosotros. ¿Te gustaría una prueba GRATIS esta semana? 🏨✨',
        '{{contactName}}, tu hotel merece un servicio 5⭐. En GetLavado cuidamos cada detalle: \n✅ Blancura perfecta\n✅ Entrega puntual\n✅ Protocolos VIP\n\nTus huéspedes notarán la diferencia. ¿Coordinamos una visita a {{companyName}}? 🏨'
      ],
      'Clínica': [
        '¡Hola {{contactName}}! GetLavado garantiza la máxima higiene que {{companyName}} requiere. Protocolos certificados de esterilización + control de calidad riguroso. 8 años cuidando clínicas líderes. ¿Te gustaría conocer nuestro servicio? 🏥✨',
        '{{contactName}}, la higiene es vital en {{companyName}}. Ofrecemos:\n✅ Esterilización certificada\n✅ Protocolos sanitarios\n✅ Servicio 24/7\n\nMuchas clínicas ya optimizaron sus costos con nosotros. ¿Conversamos? 🏥'
      ],
      'default': [
        '¡Hola {{contactName}}! 👋 GetLavado es líder en lavandería industrial: 864 empresas confían en nosotros. ¿Te gustaría una prueba GRATIS para {{companyName}} esta semana? Precios transparentes y servicio premium garantizado ⭐',
        '{{contactName}}, optimiza las operaciones de {{companyName}}:\n✅ Servicio confiable\n✅ Precios transparentes\n✅ Calidad garantizada\n\n¿Coordinamos una visita? 🚀'
      ]
    },
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
