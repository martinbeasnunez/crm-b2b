import { showTab } from './navigation.js';
import { initLeads } from './leads.js';
import { initPipeline } from './pipeline.js';
import { initTemplates } from './templates.js';
import { initReminders } from './reminders.js';
import { initImport } from './import.js';
// Asegura registro de handlers de mensajes (expone window.showMsgDialog)
import './messages.js';

export function initEventListeners() {
  // Event listeners para las pestañas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tab);
    });
  });

  // Inicializar todos los módulos
  initLeads();
  initPipeline();
  initTemplates();
  initReminders();
  initImport();
}
