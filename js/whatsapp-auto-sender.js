// Script helper para automatizar WhatsApp Web
// Este script se puede usar como userscript o bookmark

(function() {
    'use strict';
    
    // Función para detectar y hacer click en el botón de enviar
    function autoSendMessage() {
        let attempts = 0;
        const maxAttempts = 20;
        
        const sender = setInterval(() => {
            attempts++;
            
            // Buscar el botón de enviar con múltiples selectores
            const sendButton = document.querySelector('[data-testid="send"]') ||
                              document.querySelector('button[aria-label*="Enviar"]') ||
                              document.querySelector('button[aria-label*="Send"]') ||
                              document.querySelector('[data-icon="send"]') ||
                              document.querySelector('span[data-testid="send"]') ||
                              document.querySelector('button[type="submit"]');
            
            // Verificar que el botón existe y está habilitado
            if (sendButton && !sendButton.disabled && sendButton.offsetParent !== null) {
                clearInterval(sender);
                
                // Hacer click en el botón de enviar
                setTimeout(() => {
                    sendButton.click();
                    console.log('✅ Mensaje enviado automáticamente');
                    
                    // Notificar al padre si existe
                    if (window.parent !== window) {
                        window.parent.postMessage('whatsapp-sent', '*');
                    }
                    
                    // Cerrar la ventana después de un momento
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                    
                }, 500);
                
                return;
            }
            
            // Si se agotaron los intentos, parar
            if (attempts >= maxAttempts) {
                clearInterval(sender);
                console.log('⚠️ No se pudo enviar automáticamente');
                
                // Notificar que requiere intervención manual
                if (window.parent !== window) {
                    window.parent.postMessage('whatsapp-manual', '*');
                }
            }
        }, 1000);
    }
    
    // Función para detectar cuando WhatsApp Web está listo
    function waitForWhatsAppReady() {
        const readyChecker = setInterval(() => {
            // Verificar múltiples indicadores de que WhatsApp está listo
            const isReady = document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                           document.querySelector('[contenteditable="true"][data-tab="10"]') ||
                           document.querySelector('div[contenteditable="true"][spellcheck="true"]') ||
                           (document.title.includes('WhatsApp') && !document.title.includes('Loading'));
            
            if (isReady) {
                clearInterval(readyChecker);
                console.log('📱 WhatsApp Web está listo');
                
                // Esperar un poco más para asegurar que todo esté cargado
                setTimeout(() => {
                    autoSendMessage();
                }, 2000);
            }
        }, 500);
        
        // Timeout de seguridad
        setTimeout(() => {
            clearInterval(readyChecker);
        }, 30000);
    }
    
    // Iniciar cuando el documento esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForWhatsAppReady);
    } else {
        waitForWhatsAppReady();
    }
    
    // También escuchar eventos de cambio en la página
    const observer = new MutationObserver(() => {
        // Si detectamos que se ha cargado un nuevo chat, intentar enviar
        if (document.querySelector('[data-testid="send"]')) {
            autoSendMessage();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();
