import { getState, setState, showToast, scoreICP } from './common.js';

// Función para enviar mensaje automático por WhatsApp Web
function sendWhatsAppMessage(lead) {
  const phone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  
  if (!phone) {
    showToast('No se puede enviar WhatsApp: teléfono no disponible', 'error');
    return;
  }
  
  // Mensaje predeterminado personalizable
  const message = `Hola ${lead.contactName || 'estimado/a'}, 

Gracias por tu interés en nuestros servicios. Me pongo en contacto contigo desde ${lead.companyName || 'tu empresa'} para conversar sobre cómo podemos ayudarte.

¿Cuándo sería un buen momento para tener una breve conversación?

Saludos!`;
  
  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construir URL de WhatsApp Web
  const whatsappURL = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  // Abrir en una nueva ventana
  window.open(whatsappURL, '_blank');
  
  showToast(`WhatsApp abierto para ${lead.contactName}`, 'success');
}

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
      <div class="kanban-column" data-status="${status}">
        <div class="kanban-header">${status} <span class="tag">${items.length}</span></div>
        <div class="kanban-body" data-status="${status}">
          ${items.map(lead => `
            <div class="kanban-card" draggable="true" data-company="${lead.companyName}">
              <div class="card-title">${lead.companyName}</div>
              <div class="card-contact">${lead.contactName}</div>
              <div class="card-phone">${lead.phone || ''}</div>
              <div class="card-meta">
                <span class="tag">${lead.industry || ''}</span>
                <span class="tag">${lead.district || ''}</span>
              </div>
              <div class="card-score">ICP: ${scoreICP(lead)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  document.getElementById('kanbanWrap').innerHTML = html;
}

export function initPipeline() {
  // Evitar registrar listeners múltiples si initPipeline se llama varias veces
  if (document._pipelineInitialized) return;
  document._pipelineInitialized = true;

  // Event listeners para drag & drop
  document.addEventListener('dragstart', e => {
    const card = e.target.closest('.kanban-card');
    if (card) {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.company);
    }
  });

  document.addEventListener('dragend', e => {
    const card = e.target.closest('.kanban-card');
    if (card) card.classList.remove('dragging');
  });

  document.addEventListener('dragover', e => {
    const body = e.target.closest('.kanban-body');
    if (body) {
      e.preventDefault();
    }
  });

  document.addEventListener('drop', e => {
    const body = e.target.closest('.kanban-body');
    if (body) {
      e.preventDefault();
      const company = e.dataTransfer.getData('text');
      const newStatus = body.dataset.status;
      
      const state = getState();
      const lead = state.leads.find(l => l.companyName === company);
      if (lead && lead.status !== newStatus) {
        const oldStatus = lead.status;
        lead.status = newStatus;
        setState(state);
        renderPipeline();
        showToast(`Movido a ${newStatus}`);
        
        // Disparar WhatsApp automáticamente cuando se mueva a "En Conversación"
        if (newStatus === 'En Conversación' && oldStatus !== 'En Conversación') {
          setTimeout(() => {
            sendWhatsAppMessage(lead);
          }, 500); // Pequeño delay para que se complete la actualización visual
        }
      }
    }
  });
  
  // Re-renderizar cuando el estado cambie desde otras partes (por ejemplo, leads)
  window.addEventListener('state:changed', () => renderPipeline());

  // Renderizado inicial
  renderPipeline();
}
