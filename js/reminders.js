import { getState, setState, showToast, formatDate } from './common.js';

export function renderReminders() {
  const state = getState();
  const reminders = state.reminders;
  
  // Agrupar por fecha
  const groups = {};
  reminders.forEach(rem => {
    const date = rem.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(rem);
  });
  
  const entries = Object.entries(groups).sort((a,b) => a[0].localeCompare(b[0]));
  let html = '';
  entries.forEach(([date, items]) => {
    const label = relativeDateLabel(date);
    html += `
      <div class="reminder-group">
        <h3>
          ${label}
          <span class="count">${items.length}</span>
        </h3>
        ${items.map(rem => `
          <div class="reminder-card ${isPast(rem.date) && rem.status !== 'completed' ? 'overdue' : ''}">
            <div class="reminder-icon">${getReminderIcon(rem.type)}</div>
            <div class="reminder-info">
              <div class="reminder-title">${rem.title}</div>
              <div class="reminder-lead">${rem.lead} • ${formatTime(rem.date)} ${isToday(rem.date) && isPast(rem.date) && rem.status !== 'completed' ? '<span class="badge overdue-badge">Atrasado</span>' : ''}</div>
              <div class="reminder-notes">${rem.notes}</div>
            </div>
            <div class="reminder-actions">
              <button class="btn ghost" onclick="window.editReminder('${rem.id}')">
                Editar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  });
  
  document.getElementById('remindersContainer').innerHTML = html;
}

function getReminderIcon(type) {
  const icons = {
    call: '📞',
    meeting: '👥',
    email: '✉️',
  whatsapp: '💬',
  other: '📌'
  };
  return icons[type] || icons.other;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function isPast(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  return d < now;
}

function isToday(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d.getTime() === today.getTime();
}

function relativeDateLabel(dateStr) {
  const today = new Date();
  const target = new Date(dateStr);
  // normalizar
  today.setHours(0,0,0,0);
  target.setHours(0,0,0,0);
  const diffDays = Math.round((target - today) / (1000*60*60*24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  // para el resto, fecha legible
  return formatDate(dateStr);
}

export function editReminder(id) {
  const dialog = document.getElementById('reminderDialog');
  const state = getState();
  const reminder = id ? state.reminders.find(r => r.id === id) : {
    id: Date.now(),
    title: '',
    type: 'call',
    lead: '',
    date: new Date().toISOString().slice(0, 16),
    priority: 'medium',
    notes: '',
    status: 'pending'
  };

  // Llenar el formulario
  document.getElementById('dlgRemTitle').value = reminder.title;
  document.getElementById('dlgRemTitle').dataset.id = reminder.id;
  document.getElementById('dlgRemType').value = reminder.type;
  document.getElementById('dlgRemLead').value = reminder.lead;
  document.getElementById('dlgRemDate').value = reminder.date.slice(0, 16);
  document.getElementById('dlgRemPriority').value = reminder.priority;
  document.getElementById('dlgRemNotes').value = reminder.notes;

  // Llenar select de leads
  const leadSelect = document.getElementById('dlgRemLead');
  leadSelect.innerHTML = state.leads.map(l => 
    `<option value="${l.companyName}">${l.companyName}</option>`
  ).join('');
  leadSelect.value = reminder.lead;

  // Mostrar/ocultar botón eliminar
  document.getElementById('dlgRemDelete').style.display = id ? 'block' : 'none';

  // Manejar guardar
  dialog.onsubmit = (e) => {
    e.preventDefault();
    const newReminder = {
      id: reminder.id,
      title: document.getElementById('dlgRemTitle').value,
      type: document.getElementById('dlgRemType').value,
      lead: document.getElementById('dlgRemLead').value,
      date: document.getElementById('dlgRemDate').value,
      priority: document.getElementById('dlgRemPriority').value,
      notes: document.getElementById('dlgRemNotes').value,
      status: 'pending'
    };

    const index = state.reminders.findIndex(r => r.id === id);
    if (index >= 0) {
      state.reminders[index] = newReminder;
    } else {
      state.reminders.push(newReminder);
    }

    setState(state);
    renderReminders();
    dialog.close();
    showToast(id ? 'Recordatorio actualizado' : 'Recordatorio creado');
  };

  dialog.showModal();
}

export function deleteReminder(id) {
  if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
    const state = getState();
    state.reminders = state.reminders.filter(r => r.id !== id);
    setState(state);
    renderReminders();
    document.getElementById('reminderDialog').close();
    showToast('Recordatorio eliminado');
  }
}

export function initReminders() {
  // Event listeners
  document.getElementById('newReminderBtn')?.addEventListener('click', () => editReminder());
  document.getElementById('dlgRemCancel')?.addEventListener('click', () => document.getElementById('reminderDialog').close());
  document.getElementById('dlgRemDelete')?.addEventListener('click', () => {
    const id = document.getElementById('dlgRemTitle').dataset.id;
    deleteReminder(id);
  });

  // Renderizado inicial
  renderReminders();
}

// Exponer funciones globalmente
window.editReminder = editReminder;
window.deleteReminder = deleteReminder;
