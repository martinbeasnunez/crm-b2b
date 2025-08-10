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

  // Obtener plantillas por industria con clave normalizada
  const key = findIndustryKey(state.templates, lead.industry);
  const industryTemplates = state.templates[key] || state.templates.default || [];
  
  if (!industryTemplates || !industryTemplates.length) {
    console.error('No hay plantillas para la industria:', lead.industry);
    showToast('No hay plantillas disponibles para esta industria');
    return;
  }
  
  // Llenar el selector de plantillas
  const select = document.getElementById('dlgMsgTemplate');
  select.innerHTML = industryTemplates.map((tpl, i) => {
    const title = typeof tpl === 'string' ? `${tpl.substring(0, 40)}...` : (tpl.title || `Mensaje ${i+1}`);
    return `<option value="${i}">${title}</option>`;
  }).join('');
  
  // Recordar última plantilla por industria
  const lastKey = `lastTpl:${key}`;
  const lastIdx = localStorage.getItem(lastKey);
  if (lastIdx && industryTemplates[lastIdx]) {
    select.value = String(lastIdx);
  } else {
    select.value = '0';
  }
  
  // Función para actualizar preview
  function updateMessagePreview() {
    const currentTemplates = state.templates[key] || state.templates.default || [];
    const selected = currentTemplates[Number(select.value)];
    const text = typeof selected === 'string' ? selected : (selected?.text || '');
    let msg = text;
    Object.keys(lead).forEach(k => {
      const val = lead[k] ?? '';
      msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), String(val));
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

// Utilidades internas
function normalizeKey(s) {
  return (s || 'default')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function findIndustryKey(templates, industry) {
  const wanted = normalizeKey(industry);
  const keys = Object.keys(templates || {});
  // match exact normalizado
  for (const k of keys) {
    if (normalizeKey(k) === wanted) return k;
  }
  return 'default';
}
