import { getState, setState, showToast } from './common.js';
import { renderLeads } from './leads.js';

export function showMsgDialog(companyName) {
  console.log('showMsgDialog called with:', companyName);
  const dialog = document.getElementById('msgDialog');
  const state = getState();
  const lead = state.leads.find(l => l.companyName === companyName);
  
  if (!lead) {
    console.error('Lead no encontrado:', companyName);
    return;
  }

  // Obtener plantillas por industria (normalizando clave)
  const key = (lead.industry || 'default').trim();
  const industryTemplates = state.templates[key] || state.templates.default || [];
  
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
  
  // Recordar última plantilla por industria
  const lastKey = `lastTpl:${lead.industry || 'default'}`;
  const lastIdx = localStorage.getItem(lastKey);
  if (lastIdx && industryTemplates[lastIdx]) {
    select.value = String(lastIdx);
  } else {
    select.value = '0';
  }
  
  // Función para actualizar preview
  function updateMessagePreview() {
    const currentTemplates = state.templates[key] || state.templates.default || [];
    const selectedTemplate = currentTemplates[select.value];
    let msg = selectedTemplate;
    Object.keys(lead).forEach(key => {
      msg = msg.replace(new RegExp(`{{${key}}}`, 'g'), lead[key]);
    });
    document.getElementById('dlgMsgText').value = msg;
  }
  
  // Preview inicial
  window.updateMessagePreview = updateMessagePreview;
  updateMessagePreview();
  
  // Manejar envío
  dialog.onsubmit = (e) => {
    e.preventDefault();
    const msg = document.getElementById('dlgMsgText').value;
    lead.lastMsg = msg;
  // Guardar última plantilla seleccionada
  localStorage.setItem(lastKey, String(select.value));
    setState(state);
    dialog.close();
    showToast('Mensaje enviado');
    renderLeads();
  };
  
  dialog.showModal();
}

// Exponer función globalmente
window.showMsgDialog = showMsgDialog;
