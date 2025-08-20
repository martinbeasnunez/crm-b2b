import { getState, setState, showToast, scoreICP } from './common.js';

// Función para enviar mensaje automático por WhatsApp - MÉTODOS ALTERNATIVOS
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
  
  // Mostrar opciones al usuario
  showWhatsAppOptions(phone, message, lead);
}

// Función para mostrar múltiples opciones de envío
function showWhatsAppOptions(phone, message, lead) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;">
      <h3 style="margin-top: 0; color: #25D366;">📱 Enviar WhatsApp a ${lead.contactName}</h3>
      <p style="color: #666; margin-bottom: 20px;">Número: +${phone}</p>
      
      <div style="margin-bottom: 20px;">
        <h4>Elige un método de envío:</h4>
        
        <button id="method1" style="width: 100%; padding: 15px; margin: 5px 0; border: 2px solid #25D366; background: #25D366; color: white; border-radius: 8px; cursor: pointer; font-size: 14px;">
          🔗 Método 1: URL de WhatsApp (Aplicación móvil)
        </button>
        
        <button id="method2" style="width: 100%; padding: 15px; margin: 5px 0; border: 2px solid #128C7E; background: #128C7E; color: white; border-radius: 8px; cursor: pointer; font-size: 14px;">
          📋 Método 2: Copiar mensaje y abrir WhatsApp
        </button>
        
        <button id="method3" style="width: 100%; padding: 15px; margin: 5px 0; border: 2px solid #075E54; background: #075E54; color: white; border-radius: 8px; cursor: pointer; font-size: 14px;">
          📱 Método 3: Generar QR para WhatsApp
        </button>
        
        <button id="method4" style="width: 100%; padding: 15px; margin: 5px 0; border: 2px solid #34B7F1; background: #34B7F1; color: white; border-radius: 8px; cursor: pointer; font-size: 14px;">
          💬 Método 4: Telegram (alternativo)
        </button>
        
        <button id="methodClose" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; background: #f5f5f5; color: #666; border-radius: 8px; cursor: pointer;">
          ❌ Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners para cada método
  document.getElementById('method1').onclick = () => {
    document.body.removeChild(modal);
    sendViaWhatsAppURL(phone, message, lead);
  };
  
  document.getElementById('method2').onclick = () => {
    document.body.removeChild(modal);
    sendViaCopyPaste(phone, message, lead);
  };
  
  document.getElementById('method3').onclick = () => {
    document.body.removeChild(modal);
    sendViaQRCode(phone, message, lead);
  };
  
  document.getElementById('method4').onclick = () => {
    document.body.removeChild(modal);
    sendViaTelegram(phone, message, lead);
  };
  
  document.getElementById('methodClose').onclick = () => {
    document.body.removeChild(modal);
  };
}

// Método 1: URL directa de WhatsApp (abre app móvil si está disponible)
function sendViaWhatsAppURL(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
  const webURL = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  showToast('📱 Abriendo WhatsApp...', 'info');
  
  // Intentar abrir app nativa primero
  window.location.href = whatsappURL;
  
  // Fallback a web después de 2 segundos
  setTimeout(() => {
    window.open(webURL, '_blank');
    showToast(`📤 WhatsApp abierto para ${lead.contactName}`, 'success');
  }, 2000);
}

// Método 2: Copiar mensaje al clipboard y abrir WhatsApp
function sendViaCopyPaste(phone, message, lead) {
  // Copiar mensaje al clipboard
  navigator.clipboard.writeText(message).then(() => {
    showToast('📋 Mensaje copiado al portapapeles', 'success');
    
    // Abrir WhatsApp
    const whatsappURL = `https://api.whatsapp.com/send?phone=${phone}`;
    window.open(whatsappURL, '_blank');
    
    setTimeout(() => {
      showToast('✅ Pega el mensaje (Ctrl+V) en WhatsApp y envía', 'info');
    }, 1500);
    
  }).catch(() => {
    // Fallback si no se puede copiar
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
      align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;">
        <h3>📋 Copia este mensaje:</h3>
        <textarea readonly style="width: 100%; height: 150px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">${message}</textarea>
        <button onclick="this.parentElement.parentElement.remove(); window.open('https://api.whatsapp.com/send?phone=${phone}', '_blank')" 
                style="width: 100%; padding: 10px; margin-top: 10px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer;">
          📱 Abrir WhatsApp
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  });
}

// Método 3: Generar código QR
function sendViaQRCode(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  // Usar API de QR code
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappURL)}`;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
      <h3 style="color: #25D366;">� Escanea con tu móvil</h3>
      <img src="${qrURL}" alt="QR Code" style="max-width: 100%; margin: 20px 0;" />
      <p style="color: #666; font-size: 14px;">Escanea este código QR con tu teléfono para abrir WhatsApp con el mensaje listo</p>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer;">
        ✅ Cerrar
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  showToast(`📱 QR generado para ${lead.contactName}`, 'success');
}

// Método 4: Telegram como alternativa
function sendViaTelegram(phone, message, lead) {
  const encodedMessage = encodeURIComponent(message);
  const telegramURL = `https://t.me/share/url?url=&text=${encodedMessage}`;
  
  window.open(telegramURL, '_blank');
  showToast(`📤 Telegram abierto para enviar a ${lead.contactName}`, 'info');
  
  setTimeout(() => {
    showToast('💡 Recuerda agregar el número de teléfono en Telegram', 'warning');
  }, 2000);
}

export function renderPipeline() {

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
