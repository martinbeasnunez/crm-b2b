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
  
  // Método ULTRA agresivo para envío automático
  sendViaWhatsAppWebUltraAutomatic(phone, message, lead);
  
  showToast(`🚀 Enviando WhatsApp automático a ${lead.contactName}`, 'success');
}

// Función ULTRA automática con múltiples técnicas
function sendViaWhatsAppWebUltraAutomatic(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  showToast('🤖 Iniciando envío ULTRA automático...', 'info');
  
  // Abrir con configuración específica para automatización máxima
  const popup = window.open(whatsappURL, 'wa_ultra_sender', 
    'width=1200,height=800,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
  
  if (!popup) {
    showToast('❌ Habilita pop-ups para envío automático', 'error');
    return;
  }
  
  // Script ULTRA agresivo que se ejecutará
  const ultraScript = `
    console.log('🚀 ULTRA Auto-Sender iniciado');
    
    // Variables globales
    let sendAttempts = 0;
    let maxAttempts = 50;
    let isMessageSent = false;
    
    // Función para crear eventos muy realistas
    function createRealEvent(type, target, options = {}) {
      let event;
      if (type.startsWith('key')) {
        event = new KeyboardEvent(type, {
          key: 'Enter',
          keyCode: 13,
          which: 13,
          charCode: 13,
          bubbles: true,
          cancelable: true,
          composed: true,
          ...options
        });
      } else if (type.startsWith('mouse') || type === 'click') {
        const rect = target.getBoundingClientRect();
        event = new MouseEvent(type, {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          screenX: rect.left + rect.width / 2,
          screenY: rect.top + rect.height / 2,
          button: 0,
          buttons: 1,
          composed: true,
          ...options
        });
      } else {
        event = new Event(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          ...options
        });
      }
      return event;
    }
    
    // Función para hacer click ultra realista
    function ultraClick(element) {
      if (!element || isMessageSent) return false;
      
      try {
        // Secuencia completa de eventos de mouse
        element.dispatchEvent(createRealEvent('mouseenter', element));
        element.dispatchEvent(createRealEvent('mouseover', element));
        element.dispatchEvent(createRealEvent('mousedown', element));
        element.dispatchEvent(createRealEvent('mouseup', element));
        element.dispatchEvent(createRealEvent('click', element));
        
        // También con focus
        if (element.focus) element.focus();
        if (element.click) element.click();
        
        return true;
      } catch (e) {
        console.log('Error en ultra click:', e);
        return false;
      }
    }
    
    // Función para presionar Enter ultra realista
    function ultraEnter(element) {
      if (!element || isMessageSent) return false;
      
      try {
        element.focus();
        
        ['keydown', 'keypress', 'input', 'keyup'].forEach(eventType => {
          element.dispatchEvent(createRealEvent(eventType, element));
        });
        
        return true;
      } catch (e) {
        console.log('Error en ultra enter:', e);
        return false;
      }
    }
    
    // Función principal de envío
    function attemptUltraSend() {
      if (isMessageSent) return;
      
      sendAttempts++;
      console.log('Intento ULTRA', sendAttempts, 'de', maxAttempts);
      
      // Buscar elementos con TODOS los selectores posibles
      const allSendSelectors = [
        '[data-testid="send"]',
        'button[aria-label*="Enviar"]', 'button[aria-label*="Send"]',
        '[data-icon="send"]', 'span[data-testid="send"]',
        'button[type="submit"]', '.selectable-text[data-testid="send"]',
        '[data-tab="11"]', '[aria-label*="Send message"]',
        '[aria-label*="Enviar mensaje"]', 'button[title*="Send"]',
        'button[title*="Enviar"]', '[role="button"][data-testid="send"]',
        'span[role="button"][data-icon="send"]',
        'div[role="button"][aria-label*="Send"]',
        'div[role="button"][aria-label*="Enviar"]'
      ];
      
      const allTextSelectors = [
        '[data-testid="conversation-compose-box-input"]',
        '[contenteditable="true"][data-tab="10"]',
        'div[contenteditable="true"][spellcheck="true"]',
        '.selectable-text[contenteditable="true"]',
        '[role="textbox"][contenteditable="true"]',
        'div[data-testid="conversation-compose-box-input"]',
        '[aria-label*="Type a message"]',
        '[aria-label*="Escribe un mensaje"]'
      ];
      
      let sendButton = null;
      let textArea = null;
      
      // Buscar botón de enviar
      for (let selector of allSendSelectors) {
        const elements = document.querySelectorAll(selector);
        for (let element of elements) {
          if (element && element.offsetParent !== null && 
              !element.disabled && !element.hasAttribute('disabled') &&
              (element.offsetWidth > 0 && element.offsetHeight > 0)) {
            sendButton = element;
            break;
          }
        }
        if (sendButton) break;
      }
      
      // Buscar área de texto
      for (let selector of allTextSelectors) {
        const elements = document.querySelectorAll(selector);
        for (let element of elements) {
          if (element && element.offsetParent !== null &&
              (element.offsetWidth > 0 && element.offsetHeight > 0)) {
            textArea = element;
            break;
          }
        }
        if (textArea) break;
      }
      
      // Si encontramos ambos elementos, intentar enviar
      if (sendButton && textArea) {
        console.log('✅ Elementos encontrados, enviando...');
        
        setTimeout(() => {
          // Enfocar área de texto
          if (textArea.focus) textArea.focus();
          if (textArea.click) textArea.click();
          
          setTimeout(() => {
            // Método 1: Enter en textarea
            ultraEnter(textArea);
            
            setTimeout(() => {
              // Método 2: Click en botón
              if (ultraClick(sendButton)) {
                console.log('🎉 Mensaje enviado con ULTRA método');
                isMessageSent = true;
                
                try {
                  window.parent.postMessage('whatsapp-sent', '*');
                } catch(e) {}
                
                setTimeout(() => window.close(), 1500);
              }
            }, 300);
          }, 300);
        }, 500);
        
        return;
      }
      
      // Continuar intentando
      if (sendAttempts < maxAttempts && !isMessageSent) {
        setTimeout(attemptUltraSend, 800);
      } else if (!isMessageSent) {
        console.log('⚠️ ULTRA envío falló, requerirá acción manual');
        try {
          window.parent.postMessage('whatsapp-manual', '*');
        } catch(e) {}
      }
    }
    
    // Iniciar cuando todo esté listo
    function startUltraSequence() {
      console.log('🚀 Iniciando secuencia ULTRA');
      setTimeout(attemptUltraSend, 2000);
    }
    
    // Múltiples formas de detectar cuando WhatsApp está listo
    if (document.readyState === 'complete') {
      startUltraSequence();
    } else {
      window.addEventListener('load', startUltraSequence);
      document.addEventListener('DOMContentLoaded', startUltraSequence);
    }
    
    // Observer para cambios en el DOM
    const observer = new MutationObserver(() => {
      if (!isMessageSent && document.querySelector('[data-testid="send"]')) {
        setTimeout(attemptUltraSend, 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  `;
  
  // Inyectar script de múltiples formas
  const injectUltraScript = () => {
    try {
      // Método 1: eval
      popup.eval(ultraScript);
      console.log('Script inyectado vía eval');
    } catch (e1) {
      try {
        // Método 2: script element
        const script = popup.document.createElement('script');
        script.textContent = ultraScript;
        popup.document.head.appendChild(script);
        console.log('Script inyectado vía element');
      } catch (e2) {
        try {
          // Método 3: inline script
          popup.document.body.innerHTML += '<script>' + ultraScript + '</script>';
          console.log('Script inyectado inline');
        } catch (e3) {
          console.log('No se pudo inyectar script');
        }
      }
    }
  };
  
  // Escuchar respuestas
  const messageHandler = (event) => {
    if (event.data === 'whatsapp-sent') {
      window.removeEventListener('message', messageHandler);
      showToast(`🎉 ¡MENSAJE ENVIADO AUTOMÁTICAMENTE A ${lead.contactName.toUpperCase()}!`, 'success');
    } else if (event.data === 'whatsapp-manual') {
      window.removeEventListener('message', messageHandler);
      showToast('⚡ WhatsApp listo - presiona Enter para enviar', 'warning');
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Múltiples intentos de inyección con diferentes tiempos
  popup.addEventListener('load', injectUltraScript);
  setTimeout(() => popup && !popup.closed && injectUltraScript(), 1000);
  setTimeout(() => popup && !popup.closed && injectUltraScript(), 2000);
  setTimeout(() => popup && !popup.closed && injectUltraScript(), 3000);
  setTimeout(() => popup && !popup.closed && injectUltraScript(), 5000);
  
  // Enfoque agresivo
  setTimeout(() => {
    if (popup && !popup.closed) {
      popup.focus();
      popup.blur();
      popup.focus();
    }
  }, 1500);
}

// Función mejorada para envío automático real
function sendViaWhatsAppWebAutomatic(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  // Crear ventana con configuración específica para automatización
  const popup = window.open(whatsappURL, 'whatsapp_auto_sender', 
    'width=1200,height=800,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
  
  if (!popup) {
    showToast('❌ Habilita pop-ups para envío automático', 'error');
    return;
  }
  
  showToast('🤖 Iniciando envío automático...', 'info');
  
  // Función para inyectar script más agresivo
  const injectAdvancedScript = () => {
    const script = `
      (function() {
        console.log('🚀 Script de envío automático iniciado');
        
        // Función para simular eventos de teclado reales
        function simulateKeyPress(element, key) {
          const events = ['keydown', 'keypress', 'keyup'];
          events.forEach(eventType => {
            const event = new KeyboardEvent(eventType, {
              key: key,
              keyCode: key === 'Enter' ? 13 : key.charCodeAt(0),
              which: key === 'Enter' ? 13 : key.charCodeAt(0),
              bubbles: true,
              cancelable: true
            });
            element.dispatchEvent(event);
          });
        }
        
        // Función para simular click real
        function simulateRealClick(element) {
          const rect = element.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            const event = new MouseEvent(eventType, {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y
            });
            element.dispatchEvent(event);
          });
        }
        
        // Función principal de envío
        function attemptAutoSend() {
          let attempts = 0;
          const maxAttempts = 30;
          
          const sendInterval = setInterval(() => {
            attempts++;
            console.log('Intento', attempts, 'de envío automático');
            
            // Buscar el botón de enviar con todos los selectores posibles
            const sendSelectors = [
              '[data-testid="send"]',
              'button[aria-label*="Enviar"]',
              'button[aria-label*="Send"]',
              '[data-icon="send"]',
              'span[data-testid="send"]',
              'button[type="submit"]',
              '.selectable-text[data-testid="send"]',
              '[data-tab="11"]'
            ];
            
            let sendButton = null;
            for (let selector of sendSelectors) {
              const btn = document.querySelector(selector);
              if (btn && btn.offsetParent !== null && !btn.disabled) {
                sendButton = btn;
                break;
              }
            }
            
            // También buscar el área de texto para verificar que estamos listos
            const textSelectors = [
              '[data-testid="conversation-compose-box-input"]',
              '[contenteditable="true"][data-tab="10"]',
              'div[contenteditable="true"][spellcheck="true"]',
              '.selectable-text[contenteditable="true"]'
            ];
            
            let textArea = null;
            for (let selector of textSelectors) {
              const area = document.querySelector(selector);
              if (area && area.offsetParent !== null) {
                textArea = area;
                break;
              }
            }
            
            if (sendButton && textArea) {
              clearInterval(sendInterval);
              console.log('✅ Elementos encontrados, enviando mensaje...');
              
              // Secuencia de envío automático
              setTimeout(() => {
                // 1. Enfocar el área de texto
                textArea.focus();
                textArea.click();
                
                setTimeout(() => {
                  // 2. Simular tecla Enter
                  simulateKeyPress(textArea, 'Enter');
                  
                  setTimeout(() => {
                    // 3. Click en el botón de enviar
                    simulateRealClick(sendButton);
                    
                    setTimeout(() => {
                      // 4. Fallback: usar click directo
                      sendButton.click();
                      
                      console.log('🎉 Mensaje enviado automáticamente');
                      
                      // Notificar éxito
                      try {
                        window.parent.postMessage('whatsapp-sent', '*');
                      } catch(e) {}
                      
                      // Cerrar ventana
                      setTimeout(() => {
                        window.close();
                      }, 1500);
                      
                    }, 500);
                  }, 500);
                }, 500);
              }, 1000);
              
              return;
            }
            
            // Si se agotaron los intentos
            if (attempts >= maxAttempts) {
              clearInterval(sendInterval);
              console.log('⚠️ No se pudo enviar automáticamente');
              try {
                window.parent.postMessage('whatsapp-manual', '*');
              } catch(e) {}
            }
          }, 1000);
        }
        
        // Esperar a que la página esté completamente cargada
        function waitForPageReady() {
          if (document.readyState === 'complete' && 
              (document.querySelector('[data-testid="conversation-compose-box-input"]') ||
               document.querySelector('[contenteditable="true"]'))) {
            setTimeout(attemptAutoSend, 2000);
          } else {
            setTimeout(waitForPageReady, 500);
          }
        }
        
        waitForPageReady();
        
        // También intentar cuando el DOM cambie
        const observer = new MutationObserver(() => {
          if (document.querySelector('[data-testid="send"]')) {
            observer.disconnect();
            setTimeout(attemptAutoSend, 1000);
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
      })();
    `;
    
    try {
      // Método 1: eval directo
      popup.eval(script);
    } catch (e1) {
      try {
        // Método 2: crear script element
        const scriptEl = popup.document.createElement('script');
        scriptEl.textContent = script;
        popup.document.head.appendChild(scriptEl);
      } catch (e2) {
        try {
          // Método 3: usando setTimeout en la ventana popup
          popup.setTimeout(script, 100);
        } catch (e3) {
          console.log('No se pudo inyectar script:', e3);
        }
      }
    }
  };
  
  // Escuchar respuestas
  const messageHandler = (event) => {
    if (event.data === 'whatsapp-sent') {
      window.removeEventListener('message', messageHandler);
      showToast(`🎉 ¡Mensaje enviado automáticamente a ${lead.contactName}!`, 'success');
    } else if (event.data === 'whatsapp-manual') {
      window.removeEventListener('message', messageHandler);
      showToast('⚡ WhatsApp listo - presiona Enter si no se envió', 'warning');
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Múltiples intentos de inyección
  popup.addEventListener('load', injectAdvancedScript);
  
  setTimeout(() => {
    if (popup && !popup.closed) {
      popup.focus();
      injectAdvancedScript();
    }
  }, 2000);
  
  setTimeout(() => {
    if (popup && !popup.closed) {
      injectAdvancedScript();
    }
  }, 4000);
  
  setTimeout(() => {
    if (popup && !popup.closed) {
      injectAdvancedScript();
    }
  }, 6000);
  
  // Timeout final
  setTimeout(() => {
    if (popup && !popup.closed) {
      showToast('💬 Verifica WhatsApp Web - puede requerir acción manual', 'info');
    }
  }, 20000);
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
