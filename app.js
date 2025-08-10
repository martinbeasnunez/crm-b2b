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
}

// Leads
function renderLeads() {
  const state = getState();
  let leads = state.leads.map(l => ({...l, icpScore: scoreICP(l)}));
  const q = document.getElementById('leadSearch').value.toLowerCase();
  if (q) leads = leads.filter(l => (l.companyName+l.contactName).toLowerCase().includes(q));
  leads = leads.sort((a,b)=>b.icpScore-a.icpScore);
  
  let html = `<table><thead><tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th>Industria</th><th>Distrito</th><th>Tamaño</th><th>ICP</th><th>Estado</th><th>Msg</th><th></th></tr></thead><tbody>`;
  for(const l of leads) {
    let statusIcon = l.lastMsg ? '💬' : '';
    html += `<tr${l.lastMsg?" style='background:var(--muted)'":""}><td>${l.companyName}</td><td>${l.contactName}</td><td>${l.phone}</td><td>${l.industry}</td><td>${l.district}</td><td>${l.size||''}</td><td>${l.icpScore}</td><td>${l.status} ${statusIcon}</td>`;
    let tpl = getSuggestedTemplate(l);
    html += `<td><button class='btn primary' onclick="showMsgDialog('${l.companyName}')">💬 Mensaje</button></td>`;
    html += `<td><button class="btn ghost" onclick="editLead('${l.companyName}')">Editar</button></td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('leadsTableWrap').innerHTML = html;
}

// Recordatorios
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
  const html = `
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
    
  document.getElementById('tab-recordatorios').innerHTML = html;
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

// Event Listeners
function initializeEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });

  // Lead management
  document.getElementById('addLeadBtn').onclick = () => editLead();
  document.getElementById('leadSearch').oninput = renderLeads;
  
  // Lead dialog
  document.getElementById('dlgCancel').onclick = () => document.getElementById('leadDialog').close();
  document.getElementById('dlgDelete').onclick = deleteLead;
  
  // Reminders
  const remDialog = document.getElementById('reminderDialog');
  document.getElementById('dlgRemCancel').onclick = () => remDialog.close();
  document.getElementById('dlgRemDelete').onclick = deleteReminder;
  
  // Import/Export
  document.getElementById('importBtn').onclick = importCSV;
  document.getElementById('exportBtn').onclick = exportCSV;
  
  // Search input debounce
  const searchInput = document.getElementById('leadSearch');
  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(renderLeads, 300);
  });
}

// Toast notifications
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  showTab('leads');
});
