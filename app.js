
// Mini-CRM B2B - JS sin frameworks
// Estado global y helpers
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';

function getState() {
  let state = localStorage.getItem(LS_KEY);
  if (state) return JSON.parse(state);
  // Seed inicial
  return {
    leads: [
      {companyName:'Ramada Encore',contactName:'Úrsula',phone:'+51999999999',industry:'Hotelería',size:60,district:'San Isidro',email:'',notes:'',source:'Web',status:'Nuevo'},
      {companyName:'Clínica Providencia',contactName:'Admisión',phone:'+51988888888',industry:'Clínica',size:80,district:'San Borja',email:'',notes:'',source:'Web',status:'Calificado'},
      {companyName:'Casa Convivencia',contactName:'María',phone:'+51977777777',industry:'Residencial',size:30,district:'Miraflores',email:'',notes:'',source:'Web',status:'En Conversación'}
    ],
    templates: [
      'Hola {{contactName}}, te escribo de {{companyName}} para conversar sobre una posible colaboración.',
      'Estimado/a {{contactName}}, ¿podemos agendar una llamada para conocer más sobre {{companyName}}?'
    ],
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
}
function setState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
function scoreICP(lead) {
  let score = 0;
  if (INDUSTRIAS_ICP.some(i => (lead.industry||'').toLowerCase().includes(i.toLowerCase()))) score += 10;
  if (DISTRICTS.includes(lead.district)) score += 10;
  if (lead.size && lead.size >= 50) score += 5;
  if (/^\+51\d{9}$/.test(lead.phone)) score += 5;
  return score;
}
function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab===tab));
  document.querySelectorAll('main > section').forEach(sec => sec.classList.toggle('hidden', sec.id!==`tab-${tab}`));
  
  // Renderizar contenido según la pestaña
  switch(tab) {
    case 'leads':
      renderLeads();
      break;
    case 'pipeline':
      renderKanban();
      break;
    case 'plantillas':
      renderTemplates();
      break;
    case 'recordatorios':
      renderReminders();
      break;
  }
// Leads mejorado
function renderLeads() {
  const state = getState();
  let leads = state.leads.map(l => ({...l, icpScore: scoreICP(l)}));
  const q = document.getElementById('leadSearch').value.toLowerCase();
  if (q) leads = leads.filter(l => (l.companyName+l.contactName).toLowerCase().includes(q));
  leads = leads.sort((a,b)=>b.icpScore-a.icpScore);
  let html = `<table><thead><tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th>Industria</th><th>Distrito</th><th>Tamaño</th><th>ICP</th><th>Estado</th><th>Msg</th><th></th></tr></thead><tbody>`;
  for(const l of leads) {
    // Indicador visual
    let statusIcon = l.lastMsg ? '💬' : '';
    html += `<tr${l.lastMsg?" style='background:var(--muted)'":""}><td>${l.companyName}</td><td>${l.contactName}</td><td>${l.phone}</td><td>${l.industry}</td><td>${l.district}</td><td>${l.size||''}</td><td>${l.icpScore}</td><td>${l.status} ${statusIcon}</td>`;
    // Sugerencia de plantilla
    let tpl = getSuggestedTemplate(l);
    html += `<td><button class='btn primary' onclick="showMsgDialog('${l.companyName}')">💬 Mensaje</button></td>`;
    html += `<td><button class=\"btn ghost\" onclick=\"editLead('${l.companyName}')\">Editar</button></td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('leadsTableWrap').innerHTML = html;
}

// Plantillas según industria
const INDUSTRY_TEMPLATES = {
  'default': {
    initial: `Hola {contactName},

Me comunico porque {companyName} podría optimizar sus operaciones con nuestro servicio de lavandería industrial. En GetLavado ofrecemos:

• Precios transparentes y justos
• Puntualidad garantizada
• Servicio 24/7 confiable
• Comunicación ágil vía app

¿Te gustaría una cotización sin compromiso?`,
    followUp1: `Hola {contactName},

Quería retomar el contacto sobre el servicio de lavandería para {companyName}. Más de 864 empresas ya confían en nosotros por:

• 8 años de experiencia
• 5 sedes operativas en Lima
• Calidad garantizada
• Atención personalizada

¿Podemos agendar una breve llamada?`,
    followUp2: `Hola {contactName},

Espero que estés teniendo una excelente semana. Me gustaría compartir contigo algunos casos de éxito de empresas como {companyName} que han optimizado sus operaciones con GetLavado.

Nuestros clientes destacan:
• Ahorro de tiempo y recursos
• Servicio confiable y puntual
• Comunicación efectiva
• Calidad constante

¿Te gustaría que coordinemos una demostración?`
  },
  'Hotelería': {
    initial: `Hola {contactName},

Me comunico porque {companyName} podría optimizar su servicio de lavandería hotelera. En GetLavado somos especialistas con más de 8 años entregando:

• Blancura inmaculada en sábanas y toallas
• Cuidado profesional de uniformes 
• Servicio VIP 24/7
• Puntualidad garantizada

¿Te gustaría una cotización sin compromiso?`,
    followUp1: `Hola {contactName},

Quería retomar el contacto sobre el servicio de lavandería VIP para {companyName}. Muchos hoteles ya confían en nosotros por:

• 864 empresas satisfechas
• 8 años de experiencia
• 5 sedes operativas en Lima
• Precios transparentes y justos

¿Podemos agendar una breve llamada?`,
    followUp2: `Hola {contactName},

Espero que estés teniendo una excelente semana. Me gustaría compartir contigo algunos casos de éxito de hoteles como {companyName} que han mejorado su operación con GetLavado.

Nuestros clientes hoteleros destacan:
• Blancura perfecta garantizada
• Cero retrasos en entregas
• Control vía app en tiempo real
• Protocolos especializados

¿Te gustaría conocer más detalles en una breve reunión?`
  },
  'Clínica': {
    initial: `Hola {contactName},

Me comunico porque {companyName} necesita los más altos estándares en lavandería. En GetLavado garantizamos:

• Protocolos especializados de esterilización
• Máxima higiene certificada
• Servicio 24/7 adaptado a clínicas
• Puntualidad garantizada

¿Te gustaría conocer cómo otras clínicas optimizan sus operaciones con nosotros?`,
    followUp1: `Hola {contactName},

Quería retomar el contacto sobre nuestro servicio especializado para {companyName}. Entendemos la importancia de:

• Protocolos de esterilización certificados
• Higiene hospitalaria garantizada
• Servicio 24/7 sin interrupciones
• Comunicación ágil vía app

¿Podemos coordinar una breve reunión?`,
    followUp2: `Hola {contactName},

Espero que estés teniendo una excelente semana. Me gustaría compartir contigo algunos casos de éxito del sector salud que, como {companyName}, han optimizado sus operaciones con GetLavado.

Nuestros clientes del sector salud destacan:
• Cumplimiento de estándares sanitarios
• Sistema de trazabilidad completo
• Certificaciones actualizadas
• Protocolos específicos por área

¿Te gustaría una demostración de nuestro sistema?`
  },
  'Spa': {
    initial: `Hola {contactName},

Me comunico porque {companyName} podría elevar la experiencia de sus clientes. En GetLavado nos especializamos en:

• Blancura y suavidad inmaculada en toallas
• Servicio premium 24/7
• Fragancias neutras especiales
• Cuidado profesional de textiles de lujo

¿Te gustaría saber cómo otros spas han mejorado su servicio con nosotros?`,
    followUp1: `Hola {contactName},

Quería retomar el contacto sobre el servicio premium para {companyName}. Nos encargamos de:

• Mantener tus textiles impecables
• Servicio 24/7 sin fallas
• Comunicación ágil vía app
• Puntualidad garantizada

¿Podemos agendar una breve llamada?`,
    followUp2: `Hola {contactName},

Espero que estés teniendo una excelente semana. Me gustaría compartir contigo cómo otros centros de bienestar como {companyName} han elevado su experiencia con GetLavado.

Nuestros clientes del sector wellness destacan:
• Textiles que mantienen su lujo
• Fragancias premium personalizadas
• Cuidado especializado por tipo de tela
• Entregas coordinadas con sus horarios

¿Te gustaría conocer más detalles en una breve reunión?`
  }
};

// Función para obtener plantilla según industria y etapa
function getSuggestedTemplate(lead) {
  // Si no tiene industria, usar plantilla default
  const template = INDUSTRY_TEMPLATES[lead.industry] || INDUSTRY_TEMPLATES['default'];
  
  // Determinar qué tipo de mensaje enviar según el historial
  let messageType = 'initial';
  
  if (lead.lastMsg) {
    // Contar cuántos mensajes se han enviado
    const messageCount = (lead.messageHistory || []).length;
    
    if (messageCount >= 2) {
      messageType = 'followUp2';
    } else {
      messageType = 'followUp1';
    }
  }
  
  return template[messageType]
    .replace(/{contactName}/g, lead.contactName || 'Estimado/a')
    .replace(/{companyName}/g, lead.companyName);
}

// Función para cambiar entre pestañas de mensaje
window.showMsgPreview = function(btn, type) {
  // Actualizar botones
  btn.parentElement.querySelectorAll('.msg-tab').forEach(tab => 
    tab.classList.toggle('active', tab === btn)
  );
  
  // Mostrar contenido correspondiente
  const dialog = btn.closest('dialog');
  dialog.querySelector('#currentMsg').classList.toggle('active', type === 'current');
  dialog.querySelector('#historyMsg').classList.toggle('active', type === 'history');
};

// Dialog para mostrar/copy/enviar mensaje y guardar historial
window.showMsgDialog = function(companyName) {
  const state = getState();
  const lead = state.leads.find(l=>l.companyName===companyName);
  if (!lead) return;
  
  // Obtener historial y mensaje sugerido
  const messageHistory = lead.messageHistory || [];
  const msg = getSuggestedTemplate(lead);
  
  let dlg = document.createElement('dialog');
  dlg.className = 'dlg';
  
  // Determinar el tipo de mensaje actual
  const messageCount = messageHistory.length;
  let messageType = 'Mensaje inicial';
  if (messageCount === 1) messageType = 'Primer seguimiento';
  if (messageCount >= 2) messageType = 'Segundo seguimiento';
  
  dlg.innerHTML = `
    <div class='dlg-h'>
      ${messageType} - ${lead.industry || 'Empresa'} 
      <span class="msg-count">${messageCount} mensajes enviados</span>
    </div>
    <div class='dlg-c'>
      <div class="msg-tabs">
        <button class="msg-tab active" onclick="showMsgPreview(this, 'current')">Mensaje sugerido</button>
        <button class="msg-tab" onclick="showMsgPreview(this, 'history')">Historial (${messageCount})</button>
      </div>
      
      <div id="currentMsg" class="msg-content active">
        <textarea style='width:100%;height:200px;font-family:inherit;padding:8px;border:1px solid var(--muted);border-radius:4px;margin-bottom:8px'>${msg}</textarea>
      </div>
      
      <div id="historyMsg" class="msg-content">
        ${messageHistory.map((m, i) => `
          <div class="history-item">
            <div class="history-date">${new Date(m.date).toLocaleString()}</div>
            <pre class="history-msg">${m.msg}</pre>
          </div>
        `).join('')}
      </div>
    </div>
    <div class='dlg-f'>
      <button class='btn primary' id='copyMsgBtn'>✂️ Copiar</button>
      <button class='btn ok' id='sendMsgBtn'>✅ Marcar enviado</button>
      <button class='btn ghost' id='closeMsgBtn'>Cerrar</button>
    </div>`;
  document.body.appendChild(dlg);
  dlg.showModal();
  dlg.querySelector('#copyMsgBtn').onclick = ()=>{
    navigator.clipboard.writeText(msg);
    showToast('Mensaje copiado');
  };
  dlg.querySelector('#sendMsgBtn').onclick = ()=>{
    // Guardar historial de mensajes
    if (!lead.messageHistory) lead.messageHistory = [];
    lead.messageHistory.push({
      msg: msg,
      date: new Date().toISOString()
    });
    lead.lastMsg = msg;
    lead.lastMsgDate = new Date().toISOString();
    setState(state);
    dlg.close();
    renderLeads();
    showToast('Mensaje marcado como enviado');
  };
  dlg.querySelector('#closeMsgBtn').onclick = ()=>dlg.close();
  dlg.onclose = ()=>dlg.remove();
};
window.editLead = function(companyName) {
  const state = getState();
  const lead = state.leads.find(l=>l.companyName===companyName);
  if (!lead) return;
  const dlg = document.getElementById('leadDialog');
  dlg.showModal();
  dlg.dataset.company = companyName;
  document.getElementById('dlgCompany').value = lead.companyName;
  document.getElementById('dlgContact').value = lead.contactName;
  document.getElementById('dlgPhone').value = lead.phone;
  document.getElementById('dlgIndustry').value = lead.industry;
  document.getElementById('dlgDistrict').value = lead.district;
  document.getElementById('dlgSize').value = lead.size||'';
  document.getElementById('dlgEmail').value = lead.email||'';
  document.getElementById('dlgNotes').value = lead.notes||'';
  document.getElementById('dlgSource').value = lead.source||'';
  document.getElementById('dlgStatus').value = lead.status||'Nuevo';
}
function clearLeadDialog() {
  document.getElementById('leadDialog').dataset.company = '';
  ['dlgCompany','dlgContact','dlgPhone','dlgIndustry','dlgDistrict','dlgSize','dlgEmail','dlgNotes','dlgSource','dlgStatus'].forEach(id=>document.getElementById(id).value='');
}
document.getElementById('addLeadBtn').onclick = ()=>{
  clearLeadDialog();
  document.getElementById('leadDialog').showModal();
};
document.getElementById('dlgCancel').onclick = ()=>{
  document.getElementById('leadDialog').close();
};
document.getElementById('leadDialog').onsubmit = function(e) {
  e.preventDefault();
  const state = getState();
  const company = document.getElementById('dlgCompany').value.trim();
  if (!company) return;
  const lead = {
    companyName: company,
    contactName: document.getElementById('dlgContact').value.trim(),
    phone: document.getElementById('dlgPhone').value.trim(),
    industry: document.getElementById('dlgIndustry').value.trim(),
    district: document.getElementById('dlgDistrict').value.trim(),
    size: parseInt(document.getElementById('dlgSize').value)||0,
    email: document.getElementById('dlgEmail').value.trim(),
    notes: document.getElementById('dlgNotes').value.trim(),
    source: document.getElementById('dlgSource').value.trim(),
    status: document.getElementById('dlgStatus').value
  };
  const idx = state.leads.findIndex(l=>l.companyName===company);
  if (idx>=0) state.leads[idx]=lead; else state.leads.push(lead);
  setState(state);
  document.getElementById('leadDialog').close();
  renderLeads();
  showToast('Lead guardado');
};
document.getElementById('dlgDelete').onclick = function() {
  const state = getState();
  const company = document.getElementById('leadDialog').dataset.company;
  if (!company) return;
  state.leads = state.leads.filter(l=>l.companyName!==company);
  setState(state);
  document.getElementById('leadDialog').close();
  renderLeads();
  showToast('Lead eliminado');
};
document.getElementById('leadSearch').oninput = renderLeads;
// Kanban
function renderKanban() {
  const state = getState();
  let html = '<div class="kanban">';
  for(const stage of STAGES) {
    html += `<div class="col" data-stage="${stage}"><div class="col-title">${stage}</div>`;
    for(const l of state.leads.filter(x=>x.status===stage)) {
      html += `<div class="card" draggable="true" data-company="${l.companyName}">${l.companyName}<br><span style="color:var(--sub)">${l.contactName}</span></div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('kanbanWrap').innerHTML = html;
  // Drag&Drop
  document.querySelectorAll('.card').forEach(card => {
    card.ondragstart = e => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.company);
    };
    card.ondragend = ()=>card.classList.remove('dragging');
  });
  document.querySelectorAll('.col').forEach(col => {
    col.ondragover = e => e.preventDefault();
    col.ondrop = e => {
      const company = e.dataTransfer.getData('text/plain');
      moveLead(company, col.dataset.stage);
    };
  });
}
function moveLead(company, stage) {
  const state = getState();
  const lead = state.leads.find(l=>l.companyName===company);
  if (!lead) return;
  lead.status = stage;
  setState(state);
  renderKanban();
}
// Plantillas
function renderTemplates() {
  const state = getState();
  let html = '<ul>';
  state.templates.forEach((tpl,i)=>{
    html += `<li>${tpl} <button class="btn ghost" onclick="useTpl(${i})">Usar</button> <button class="btn danger" onclick="delTpl(${i})">Eliminar</button></li>`;
  });
  html += '</ul>';
  document.getElementById('tplList').innerHTML = html;
}
window.useTpl = function(idx) {
  const state = getState();
  const tpl = state.templates[idx];
  if (!tpl) return;
  showToast('Selecciona un lead para aplicar la plantilla');
};
window.delTpl = function(idx) {
  const state = getState();
  state.templates.splice(idx,1);
  setState(state);
  renderTemplates();
  showToast('Plantilla eliminada');
};
document.getElementById('addTplBtn').onclick = function() {
  const val = document.getElementById('tplInput').value.trim();
  if (!val) return;
  const state = getState();
  state.templates.push(val);
  setState(state);
  document.getElementById('tplInput').value = '';
  renderTemplates();
  showToast('Plantilla agregada');
};
// Recordatorios
function renderReminders() {
  const state = getState();
  const now = new Date();
  
  // Agrupar recordatorios por fecha
  const today = now.toDateString();
  const thisWeek = new Date(now.setDate(now.getDate() + 7)).toDateString();
  
  const groups = {
    today: [],
    week: [],
    future: [],
    completed: []
  };
  
  state.reminders.forEach(rem => {
    const remDate = new Date(rem.date);
    if (rem.status === 'completed') {
      groups.completed.push(rem);
    } else if (remDate.toDateString() === today) {
      groups.today.push(rem);
    } else if (remDate.toDateString() <= thisWeek) {
      groups.week.push(rem);
    } else {
      groups.future.push(rem);
    }
  });

  // Render HTML
  let html = `
    <div class="reminders-header">
      <h2>Recordatorios</h2>
      <div class="reminder-actions">
        <button class="btn primary" onclick="showNewReminderDialog()">
          <i class="fas fa-plus"></i> Nuevo recordatorio
        </button>
        <select id="reminderFilter" onchange="filterReminders(this.value)">
          <option value="all">Todos</option>
          <option value="call">Llamadas</option>
          <option value="meeting">Reuniones</option>
          <option value="email">Emails</option>
          <option value="other">Otros</option>
        </select>
      </div>
    </div>

    <div class="reminders-grid">
      <div class="reminders-list">
        ${renderReminderGroup('Hoy', groups.today)}
        ${renderReminderGroup('Esta semana', groups.week)}
        ${renderReminderGroup('Próximos', groups.future)}
        ${renderReminderGroup('Completados', groups.completed)}
      </div>
      
      <div class="reminders-calendar">
        <div id="reminderCalendar"></div>
      </div>
    </div>`;

  document.getElementById('tab-recordatorios').innerHTML = html;
  initializeCalendar();
}

function renderReminderGroup(title, reminders) {
  if (!reminders.length) return '';
  
  return `
    <div class="reminder-group">
      <h3>${title} <span class="count">${reminders.length}</span></h3>
      <div class="reminder-items">
        ${reminders.map(rem => `
          <div class="reminder-card ${rem.status} ${rem.priority}" onclick="showReminderDetails(${rem.id})">
            <div class="reminder-icon">
              ${getReminderIcon(rem.type)}
            </div>
            <div class="reminder-info">
              <div class="reminder-title">${rem.title}</div>
              <div class="reminder-meta">
                <span class="time">${formatDate(rem.date)}</span>
                ${rem.lead ? `<span class="lead">📋 ${rem.lead}</span>` : ''}
              </div>
            </div>
            <div class="reminder-actions">
              ${rem.status !== 'completed' ? 
                `<button class="btn ok" onclick="completeReminder(${rem.id}, event)">✓</button>` : ''}
              <button class="btn ghost" onclick="editReminder(${rem.id}, event)">✎</button>
              <button class="btn danger" onclick="deleteReminder(${rem.id}, event)">×</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
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
// Funciones de recordatorios
window.showNewReminderDialog = function() {
  const dialog = document.getElementById('reminderDialog');
  dialog.querySelector('form').reset();
  
  // Llenar select de leads
  const leads = getState().leads;
  const leadSelect = document.getElementById('dlgRemLead');
  leadSelect.innerHTML = '<option value="">Sin lead</option>' + 
    leads.map(l => `<option value="${l.companyName}">${l.companyName}</option>`).join('');
  
  // Establecer fecha mínima como hoy
  const dateInput = document.getElementById('dlgRemDate');
  const now = new Date();
  dateInput.min = now.toISOString().slice(0,16);
  
  dialog.showModal();
};

window.completeReminder = function(id, event) {
  event.stopPropagation();
  const state = getState();
  const reminder = state.reminders.find(r => r.id === id);
  if (reminder) {
    reminder.status = 'completed';
    setState(state);
    renderReminders();
    showToast('Recordatorio completado');
  }
};

window.deleteReminder = function(id, event) {
  event.stopPropagation();
  const state = getState();
  state.reminders = state.reminders.filter(r => r.id !== id);
  setState(state);
  renderReminders();
  showToast('Recordatorio eliminado');
};

window.showReminderDetails = function(id) {
  const state = getState();
  const reminder = state.reminders.find(r => r.id === id);
  if (!reminder) return;

  const dialog = document.getElementById('reminderDialog');
  document.getElementById('dlgRemTitle').value = reminder.title;
  document.getElementById('dlgRemDate').value = reminder.date.slice(0,16);
  document.getElementById('dlgRemType').value = reminder.type;
  document.getElementById('dlgRemLead').value = reminder.lead || '';
  document.getElementById('dlgRemPriority').value = reminder.priority;
  document.getElementById('dlgRemNotes').value = reminder.notes || '';
  
  dialog.dataset.reminderId = id;
  dialog.showModal();
};

// Event listeners para el diálogo de recordatorios
document.getElementById('reminderDialog').querySelector('form').onsubmit = function(e) {
  e.preventDefault();
  const state = getState();
  const id = parseInt(this.closest('dialog').dataset.reminderId) || Date.now();
  
  const reminder = {
    id,
    title: document.getElementById('dlgRemTitle').value,
    date: document.getElementById('dlgRemDate').value,
    type: document.getElementById('dlgRemType').value,
    lead: document.getElementById('dlgRemLead').value,
    priority: document.getElementById('dlgRemPriority').value,
    notes: document.getElementById('dlgRemNotes').value,
    status: 'pending'
  };
  
  const idx = state.reminders.findIndex(r => r.id === id);
  if (idx >= 0) {
    state.reminders[idx] = reminder;
  } else {
    state.reminders.push(reminder);
  }
  
  setState(state);
  this.closest('dialog').close();
  renderReminders();
  showToast('Recordatorio guardado');
};

document.getElementById('dlgRemCancel').onclick = function() {
  document.getElementById('reminderDialog').close();
};

document.getElementById('dlgRemDelete').onclick = function() {
  const dialog = document.getElementById('reminderDialog');
  const id = parseInt(dialog.dataset.reminderId);
  if (id) {
    deleteReminder(id, event);
  }
  dialog.close();
};
// Dialog Recordatorio
document.getElementById('dlgRemCancel').onclick = ()=>{
  document.getElementById('remDialog').close();
};
document.getElementById('remDialog').onsubmit = function(e) {
  e.preventDefault();
  // Implementar edición de recordatorio si se requiere
  document.getElementById('remDialog').close();
};
document.getElementById('dlgRemDelete').onclick = function() {
  // Implementar eliminación de recordatorio si se requiere
  document.getElementById('remDialog').close();
};
// Import/Export CSV
document.getElementById('importBtn').onclick = function() {
  const input = document.getElementById('csvInput');
  if (!input.files.length) return showToast('Selecciona un archivo CSV');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split(/\r?\n/).filter(Boolean);
    const headers = rows[0].split(',');
    const leads = rows.slice(1).map(row => {
      const vals = row.split(',');
      const obj = {};
      headers.forEach((h,i)=>obj[h]=vals[i]);
      obj.icpScore = scoreICP(obj);
      return obj;
    });
    const state = getState();
    state.leads = leads;
    setState(state);
    renderLeads();
    showToast('Leads importados');
  };
  reader.readAsText(file);
};
document.getElementById('exportBtn').onclick = function() {
  const state = getState();
  const headers = ['companyName','contactName','phone','email','industry','size','district','notes','source','status','icpScore'];
  const csv = [headers.join(',')].concat(state.leads.map(l=>headers.map(h=>l[h]||'').join(','))).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leads.csv';
  a.click();
  showToast('Leads exportados');
};
// Tabs
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick = ()=>showTab(btn.dataset.tab);
});
// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
// Bug opacidad recordatorio
document.querySelectorAll('#remList li').forEach(row=>{
  const r = getState().reminders.find(rem=>rem.text===row.textContent);
  if (r) row.style.opacity = r.done ? 0.5 : 1;
});
// Funciones de recordatorios
function renderReminders() {
  const state = getState();
  const now = new Date();
  const today = now.toDateString();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toDateString();
  
  // Agrupar recordatorios por fecha
  const groups = {
    today: [],
    week: [],
    future: [],
    completed: []
  };
  
  state.reminders.forEach(rem => {
    const remDate = new Date(rem.date);
    if (rem.status === 'completed') {
      groups.completed.push(rem);
    } else if (remDate.toDateString() === today) {
      groups.today.push(rem);
    } else if (remDate.toDateString() <= nextWeek) {
      groups.week.push(rem);
    } else {
      groups.future.push(rem);
    }
  });

  // Render HTML
  document.getElementById('tab-recordatorios').innerHTML = `
    <div class="reminders-header">
      <h2>Recordatorios</h2>
      <div class="reminder-actions">
        <button class="btn primary" onclick="showNewReminderDialog()">
          ➕ Nuevo recordatorio
        </button>
        <select id="reminderFilter" onchange="filterReminders(this.value)">
          <option value="all">Todos</option>
          <option value="call">Llamadas</option>
          <option value="meeting">Reuniones</option>
          <option value="email">Emails</option>
          <option value="other">Otros</option>
        </select>
      </div>
    </div>

    <div class="reminders-grid">
      <div class="reminders-list">
        ${renderReminderGroup('Hoy', groups.today)}
        ${renderReminderGroup('Esta semana', groups.week)}
        ${renderReminderGroup('Próximos', groups.future)}
        ${renderReminderGroup('Completados', groups.completed)}
      </div>
    </div>`;
}

function renderReminderGroup(title, reminders) {
  if (!reminders.length) return '';
  
  return `
    <div class="reminder-group">
      <h3>${title} <span class="count">${reminders.length}</span></h3>
      <div class="reminder-items">
        ${reminders.map(rem => `
          <div class="reminder-card ${rem.status} ${rem.priority}" onclick="showReminderDetails(${rem.id})">
            <div class="reminder-icon">
              ${getReminderIcon(rem.type)}
            </div>
            <div class="reminder-info">
              <div class="reminder-title">${rem.title}</div>
              <div class="reminder-meta">
                <span class="time">${formatDate(rem.date)}</span>
                ${rem.lead ? `<span class="lead">📋 ${rem.lead}</span>` : ''}
              </div>
            </div>
            <div class="reminder-actions">
              ${rem.status !== 'completed' ? 
                `<button class="btn ok" onclick="completeReminder(${rem.id}, event)">✓</button>` : ''}
              <button class="btn ghost" onclick="editReminder(${rem.id}, event)">✎</button>
              <button class="btn danger" onclick="deleteReminder(${rem.id}, event)">×</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
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

// Inicial
document.addEventListener('DOMContentLoaded',()=>{
  showTab('leads');
});
