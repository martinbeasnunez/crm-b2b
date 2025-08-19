// Bookmarklet para WhatsApp Auto-Sender
// Copia este código y crea un bookmark con esta URL:
// javascript:(function(){/* CÓDIGO AQUÍ */})();

(function() {
    'use strict';
    
    console.log('🚀 WhatsApp Auto-Sender activado');
    
    // Función para esperar elemento
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function check() {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout esperando elemento: ' + selector));
                } else {
                    setTimeout(check, 100);
                }
            }
            
            check();
        });
    }
    
    // Función para simular eventos reales
    function triggerEvent(element, eventType, options = {}) {
        const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
            ...options
        });
        element.dispatchEvent(event);
    }
    
    // Función para simular tecla Enter
    function pressEnter(element) {
        const keyEvents = ['keydown', 'keypress', 'keyup'];
        keyEvents.forEach(eventType => {
            const event = new KeyboardEvent(eventType, {
                key: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        });
    }
    
    // Función principal de envío automático
    async function autoSendMessage() {
        try {
            console.log('🔍 Buscando elementos de WhatsApp...');
            
            // Esperar que aparezca el área de texto
            const textArea = await waitForElement([
                '[data-testid="conversation-compose-box-input"]',
                '[contenteditable="true"][data-tab="10"]',
                'div[contenteditable="true"][spellcheck="true"]',
                '.selectable-text[contenteditable="true"]'
            ].join(','));
            
            console.log('✅ Área de texto encontrada');
            
            // Enfocar el área de texto
            textArea.focus();
            textArea.click();
            
            // Esperar un momento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Buscar botón de enviar
            const sendButton = await waitForElement([
                '[data-testid="send"]',
                'button[aria-label*="Enviar"]',
                'button[aria-label*="Send"]',
                '[data-icon="send"]',
                'span[data-testid="send"]'
            ].join(','));
            
            console.log('✅ Botón de enviar encontrado');
            
            // Método 1: Presionar Enter
            console.log('📤 Intentando envío con Enter...');
            pressEnter(textArea);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Método 2: Click en botón
            console.log('📤 Intentando envío con click...');
            sendButton.click();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Método 3: Evento click simulado
            console.log('📤 Intentando envío con evento simulado...');
            triggerEvent(sendButton, 'click');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Método 4: MouseEvent
            const rect = sendButton.getBoundingClientRect();
            const mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });
            sendButton.dispatchEvent(mouseEvent);
            
            console.log('🎉 Mensaje enviado automáticamente');
            
            // Cerrar ventana después de enviar
            setTimeout(() => {
                window.close();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error en envío automático:', error);
            alert('No se pudo enviar automáticamente. Presiona Enter para enviar manualmente.');
        }
    }
    
    // Verificar si estamos en WhatsApp Web
    if (window.location.hostname === 'web.whatsapp.com') {
        // Esperar a que la página cargue completamente
        if (document.readyState === 'complete') {
            setTimeout(autoSendMessage, 2000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(autoSendMessage, 2000);
            });
        }
    } else {
        console.log('❌ Este script solo funciona en WhatsApp Web');
    }
    
})();
