import { getState, setState, showToast } from './common.js';

export function renderPipeline() {
  const state = getState();
  const leads = state.leads;
  const columns = {
    'Nuevo': [],
    'Calificado': [],
    'En Conversación': [],
    'Propuesta': [],
    'Cerrado-Won': [],
    'Cerrado-Lost': []
  };
  
  leads.forEach(lead => {
    if (columns[lead.status]) {
      columns[lead.status].push(lead);
    }
  });
  
  let html = '<div class="kanban">';
  Object.entries(columns).forEach(([status, items]) => {
    html += `
      <div class="col">
        <h3>${status} (${items.length})</h3>
        ${items.map(lead => `
          <div class="card" draggable="true" data-company="${lead.companyName}">
            <div class="card-title">${lead.companyName}</div>
            <div class="card-body">
              <div>${lead.contactName}</div>
              <div>${lead.industry}</div>
              <div>${lead.district}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  });
  html += '</div>';
  
  document.getElementById('kanbanWrap').innerHTML = html;
}

export function initPipeline() {
  // Event listeners para drag & drop
  document.addEventListener('dragstart', e => {
    const card = e.target.closest('.card');
    if (card) {
      e.dataTransfer.setData('text/plain', card.dataset.company);
    }
  });

  document.addEventListener('dragover', e => {
    const col = e.target.closest('.col');
    if (col) {
      e.preventDefault();
    }
  });

  document.addEventListener('drop', e => {
    const col = e.target.closest('.col');
    if (col) {
      e.preventDefault();
      const company = e.dataTransfer.getData('text');
      const newStatus = col.querySelector('h3').textContent.split(' ')[0];
      
      const state = getState();
      const lead = state.leads.find(l => l.companyName === company);
      if (lead) {
        lead.status = newStatus;
        setState(state);
        renderPipeline();
      }
    }
  });
  
  // Renderizado inicial
  renderPipeline();
}
