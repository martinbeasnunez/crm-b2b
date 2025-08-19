import { getState, setState, showToast, scoreICP } from './common.js';

// Función para enviar mensaje automático por WhatsApp Web
function sendWhatsAppMessage(lead) {
  const phone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const myNumber = '965450086'; // Tu número de WhatsApp
  
  if (!phone) {
    showToast('No se puede enviar WhatsApp: teléfono no disponible', 'error');
    return;
  }
  
  // Mensaje predeterminado personalizable
  const message = `Hola ${lead.contactName || 'estimado/a'}, 

Gracias por tu interés en nuestros servicios. Me pongo en contacto contigo desde ${lead.companyName || 'tu empresa'} para conversar sobre cómo podemos ayudarte.

¿Cuándo sería un buen momento para tener una breve conversación?

Saludos!`;
  
  // Método mejorado: usar técnica de inyección de script
  sendViaWhatsAppWebAutomatic(phone, message, lead);
  
  showToast(`🚀 Enviando WhatsApp automático a ${lead.contactName}`, 'success');
}

// Función mejorada para envío automático real
function sendViaWhatsAppWebAutomatic(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  // Crear ventana con configuración optimizada
  const popup = window.open(whatsappURL, 'whatsapp_auto_sender', 
    'width=1200,height=800,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
  
  if (!popup) {
    showToast('❌ Habilita pop-ups para envío automático', 'error');
    return;
  }
  
  showToast('📱 Preparando WhatsApp Web...', 'info');
  
  // Escuchar mensajes de la ventana de WhatsApp
  window.addEventListener('message', function handleWhatsAppMessage(event) {
    if (event.origin !== 'https://web.whatsapp.com') return;
    
    if (event.data === 'whatsapp-sent') {
      window.removeEventListener('message', handleWhatsAppMessage);
      showToast(`✅ Mensaje enviado automáticamente a ${lead.contactName}`, 'success');
    } else if (event.data === 'whatsapp-manual') {
      window.removeEventListener('message', handleWhatsAppMessage);
      showToast('⚡ Presiona Enter en WhatsApp para enviar', 'warning');
    }
  });
  
  // Script de automatización que se inyectará
  const autoScript = `
    (function() {
      console.log('🤖 Script de automatización iniciado');
      
      function clickSendButton() {
        const selectors = [
          '[data-testid="send"]',
          'button[aria-label*="Enviar"]',
          'button[aria-label*="Send"]',
          '[data-icon="send"]',
          'span[data-testid="send"]'
        ];
        
        for (let selector of selectors) {
          const btn = document.querySelector(selector);
          if (btn && !btn.disabled && btn.offsetParent !== null) {
            setTimeout(() => {
              btn.click();
              console.log('✅ Botón de enviar clickeado');
              window.parent.postMessage('whatsapp-sent', 'https://web.whatsapp.com');
              setTimeout(() => window.close(), 2000);
            }, 300);
            return true;
          }
        }
        return false;
      }
      
      function waitForReady() {
        let attempts = 0;
        const maxAttempts = 25;
        
        const checker = setInterval(() => {
          attempts++;
          
          // Verificar si WhatsApp está listo
          const ready = document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                       document.querySelector('[contenteditable="true"]') ||
                       document.querySelector('.selectable-text[contenteditable="true"]');
          
          if (ready && clickSendButton()) {
            clearInterval(checker);
          } else if (attempts >= maxAttempts) {
            clearInterval(checker);
            console.log('⚠️ Timeout - envío manual requerido');
            window.parent.postMessage('whatsapp-manual', 'https://web.whatsapp.com');
          }
        }, 1200);
      }
      
      // Iniciar verificación
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForReady);
      } else {
        setTimeout(waitForReady, 1000);
      }
    })();
  `;
  
  // Intentar inyectar el script cuando la ventana cargue
  const injectScript = () => {
    try {
      popup.eval(autoScript);
    } catch (error) {
      // Si falla por CORS, usar método alternativo
      console.log('Usando método alternativo para automatización');
      
      // Crear y agregar script tag
      const script = popup.document.createElement('script');
      script.textContent = autoScript;
      popup.document.head.appendChild(script);
    }
  };
  
  // Múltiples intentos de inyección
  popup.addEventListener('load', injectScript);
  
  setTimeout(() => {
    if (popup && !popup.closed) {
      popup.focus();
      try {
        injectScript();
      } catch (e) {
        console.log('Inyección diferida');
      }
    }
  }, 3000);
  
  // Timeout de seguridad
  setTimeout(() => {
    if (popup && !popup.closed) {
      showToast('💬 WhatsApp Web listo - verifica el envío', 'info');
    }
  }, 15000);
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
