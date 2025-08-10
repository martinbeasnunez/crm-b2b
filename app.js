// Mini-CRM B2B - JS sin frameworks
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';

// Estado y persistencia
function getState() {
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
    reminders: [
      {
        id: 1,
        title: 'Llamar a Ramada Encore',
        type: 'call',
        lead: 'Ramada Encore',
        date: '2025-08-12T10:00:00',
        priority: 'high',
        notes: 'Presentar propuesta de servicio VIP',
        status: 'pending'
      }
    ]
  };
  
  localStorage.setItem(LS_KEY, JSON.stringify(initialState));
  return initialState;
}

function setState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// Helpers y utilidades
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getReminderIcon(type) {
  const icons = {
    call: '📞',
    meeting: '👥',
    email: '✉️',
    other: '📌'
  };
  return icons[type] || icons.other;
}

function scoreICP(lead) {
  let score = 0;
  if (INDUSTRIAS_ICP.includes(lead.industry)) score += 10;
  if (DISTRICTS.includes(lead.district)) score += 10;
  if (lead.size && lead.size >= 50) score += 5;
  if (/^\+51\d{9}$/.test(lead.phone)) score += 5;
  return score;
}

// Navegación y UI
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// Exponer funciones globalmente
window.showTab = function(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => 
    btn.classList.toggle('active', btn.dataset.tab === tab)
  );
  document.querySelectorAll('main > section').forEach(sec => 
    sec.classList.toggle('hidden', sec.id !== `tab-${tab}`)
  );
  
  // Renderizar contenido según la pestaña
  switch(tab) {
    case 'leads':
      window.renderLeads();
      break;
    case 'pipeline':
      window.renderKanban();
      break;
    case 'plantillas':
      window.renderTemplates();
      break;
    case 'recordatorios':
      window.renderReminders();
      break;
  }
};

// Gestión de Leads
window.renderLeads = function() {
  const state = getState();
  let leads = state.leads.map(l => ({...l, icpScore: scoreICP(l)}));
  const q = document.getElementById('leadSearch').value.toLowerCase();
  if (q) {
    leads = leads.filter(l => 
      (l.companyName + l.contactName).toLowerCase().includes(q)
    );
  }
  leads.sort((a,b) => b.icpScore - a.icpScore);
  
  const html = `
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Industria</th>
          <th>Distrito</th>
          <th>Tamaño</th>
          <th>ICP</th>
          <th>Estado</th>
          <th>Msg</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(l => `
          <tr${l.lastMsg ? " style='background:var(--muted)'" : ""}>
            <td>${l.companyName}</td>
            <td>${l.contactName}</td>
            <td>${l.phone}</td>
            <td>${l.industry}</td>
            <td>${l.district}</td>
            <td>${l.size || ''}</td>
            <td>${l.icpScore}</td>
            <td>${l.status} ${l.lastMsg ? '💬' : ''}</td>
            <td>
              <button class='btn primary' onclick='window.showMsgDialog(${JSON.stringify(l.companyName)})'>
                💬 Mensaje
              </button>
            </td>
            <td>
              <button class="btn ghost" onclick='window.editLead(${JSON.stringify(l.companyName)})'>
                Editar
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  document.getElementById('leadsTableWrap').innerHTML = html;
};

window.editLead = function(companyName) {
  const dialog = document.getElementById('leadDialog');
  const state = getState();
  const lead = companyName ? state.leads.find(l => l.companyName === companyName) : {
    companyName: '',
    contactName: '',
    phone: '',
    industry: '',
    district: '',
    size: '',
    email: '',
    notes: '',
    source: '',
    status: 'Nuevo'
  };

  // Llenar el formulario
  document.getElementById('dlgCompany').value = lead.companyName;
  document.getElementById('dlgContact').value = lead.contactName;
  document.getElementById('dlgPhone').value = lead.phone;
  document.getElementById('dlgIndustry').value = lead.industry;
  document.getElementById('dlgDistrict').value = lead.district;
  document.getElementById('dlgSize').value = lead.size;
  document.getElementById('dlgEmail').value = lead.email;
  document.getElementById('dlgNotes').value = lead.notes;
  document.getElementById('dlgSource').value = lead.source;
  document.getElementById('dlgStatus').value = lead.status;

  // Mostrar/ocultar botón eliminar
  document.getElementById('dlgDelete').style.display = companyName ? 'block' : 'none';

  // Manejar guardar
  dialog.onsubmit = (e) => {
    e.preventDefault();
    const newLead = {
      companyName: document.getElementById('dlgCompany').value,
      contactName: document.getElementById('dlgContact').value,
      phone: document.getElementById('dlgPhone').value,
      industry: document.getElementById('dlgIndustry').value,
      district: document.getElementById('dlgDistrict').value,
      size: document.getElementById('dlgSize').value,
      email: document.getElementById('dlgEmail').value,
      notes: document.getElementById('dlgNotes').value,
      source: document.getElementById('dlgSource').value,
      status: document.getElementById('dlgStatus').value
    };

    const state = getState();
    const index = state.leads.findIndex(l => l.companyName === companyName);
    
    if (index >= 0) {
      state.leads[index] = newLead;
    } else {
      state.leads.push(newLead);
    }
    
    setState(state);
    window.renderLeads();
    dialog.close();
    showToast(companyName ? 'Lead actualizado' : 'Lead creado');
  };

  dialog.showModal();
};

window.showMsgDialog = function(companyName) {
  console.log('showMsgDialog called with:', companyName);
  const dialog = document.getElementById('msgDialog');
  const state = getState();
  const lead = state.leads.find(l => l.companyName === companyName);
  
  if (!lead) {
    console.error('Lead no encontrado:', companyName);
    return;
  }

  // Obtener las plantillas para la industria del lead
  const industryTemplates = state.templates[lead.industry] || state.templates.default;
  
  if (!industryTemplates || !industryTemplates.length) {
    console.error('No hay plantillas para la industria:', lead.industry);
    showToast('No hay plantillas disponibles para esta industria');
    return;
  }
  
  // Llenar el selector de plantillas
  const select = document.getElementById('dlgMsgTemplate');
  select.innerHTML = industryTemplates.map((tpl, i) => 
    `<option value="${i}">${tpl.substring(0, 50)}...</option>`
  ).join('');
  
  // Función para actualizar preview
  window.updateMessagePreview = function() {
    const currentTemplates = state.templates[lead.industry] || state.templates.default;
    const selectedTemplate = currentTemplates[select.value];
    let msg = selectedTemplate;
    Object.keys(lead).forEach(key => {
      msg = msg.replace(new RegExp(`{{${key}}}`, 'g'), lead[key]);
    });
    document.getElementById('dlgMsgText').value = msg;
  };
  
  // Preview inicial
  window.updateMessagePreview();
  
  // Manejar envío
  dialog.onsubmit = (e) => {
    e.preventDefault();
    const msg = document.getElementById('dlgMsgText').value;
    lead.lastMsg = msg;
    setState(state);
    dialog.close();
    showToast('Mensaje enviado');
    window.renderLeads();
  };
  
  // Botón cancelar
  document.getElementById('dlgMsgCancel').onclick = () => dialog.close();
  
  dialog.showModal();
};

// Inicialización
function initializeEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => 
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );
  
  // Lead management
  document.getElementById('addLeadBtn').addEventListener('click', () => window.editLead());
  document.getElementById('leadSearch').addEventListener('input', window.renderLeads);
  
  // Lead dialog
  document.getElementById('dlgCancel').addEventListener('click', () => document.getElementById('leadDialog').close());
  document.getElementById('dlgDelete').addEventListener('click', () => window.deleteLead());
  
  // Msg dialog
  document.getElementById('dlgMsgCancel').addEventListener('click', () => document.getElementById('msgDialog').close());
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  window.showTab('leads');
});
