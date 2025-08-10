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
  
  let html = '';
  Object.entries(groups).sort().forEach(([date, items]) => {
    html += `
      <div class="reminder-group">
        <h3>
          ${formatDate(date)}
          <span class="count">${items.length}</span>
        </h3>
        ${items.map(rem => `
          <div class="reminder-card">
            <div class="reminder-icon">${getReminderIcon(rem.type)}</div>
            <div class="reminder-info">
              <div class="reminder-title">${rem.title}</div>
              <div class="reminder-lead">${rem.lead}</div>
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
    other: '📌'
  };
  return icons[type] || icons.other;
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
