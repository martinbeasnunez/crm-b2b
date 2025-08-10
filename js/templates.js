import { getState, setState, showToast } from './common.js';

export function renderTemplates() {
  const state = getState();
  const industry = document.getElementById('tplIndustry').value;
  const templates = state.templates[industry] || [];
  
  let html = '';
  templates.forEach((tpl, i) => {
    html += `
      <div class="template-card">
        <div class="template-text">${tpl}</div>
        <button class="btn warn" onclick="window.deleteTemplate('${industry}', ${i})">
          Eliminar
        </button>
      </div>
    `;
  });
  
  document.getElementById('tplList').innerHTML = html;
}

export function addTemplate() {
  const industry = document.getElementById('tplIndustry').value;
  const text = document.getElementById('tplInput').value.trim();
  
  if (!industry) {
    showToast('Selecciona una industria', 'error');
    return;
  }
  
  if (!text) {
    showToast('Ingresa una plantilla', 'error');
    return;
  }
  
  const state = getState();
  if (!state.templates[industry]) {
    state.templates[industry] = [];
  }
  
  state.templates[industry].push(text);
  setState(state);
  
  document.getElementById('tplInput').value = '';
  showToast('Plantilla agregada');
  renderTemplates();
}

export function deleteTemplate(industry, index) {
  if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
    const state = getState();
    state.templates[industry].splice(index, 1);
    if (state.templates[industry].length === 0) {
      delete state.templates[industry];
    }
    setState(state);
    showToast('Plantilla eliminada');
    renderTemplates();
  }
}

export function initTemplates() {
  // Event listeners
  document.getElementById('tplIndustry')?.addEventListener('change', renderTemplates);
  document.getElementById('addTplBtn')?.addEventListener('click', addTemplate);
  
  // Renderizado inicial
  renderTemplates();
}

// Exponer funciones globalmente
window.addTemplate = addTemplate;
window.deleteTemplate = deleteTemplate;
