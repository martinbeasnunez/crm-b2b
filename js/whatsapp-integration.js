// Configuración para integración WhatsApp
class WhatsAppIntegration {
  constructor() {
  this.serverUrl = 'https://crmwhatsapp3001.loca.lt';
    this.isConnected = false;
    this.checkInterval = null;
  }

  // Verificar estado de conexión
  async checkStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      const data = await response.json();
      this.isConnected = data.authenticated;
      return data;
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      this.isConnected = false;
      return { authenticated: false, connected: false };
    }
  }

  // Obtener QR Code
  async getQRCode() {
    try {
      const response = await fetch(`${this.serverUrl}/api/qr`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting QR code:', error);
      return { error: 'No se pudo obtener el QR' };
    }
  }

  // Enviar mensaje
  async sendMessage(phone, message, contactName = '') {
    try {
      const response = await fetch(`${this.serverUrl}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          message: message,
          contactName: contactName
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }

  // Reiniciar sesión
  async restart() {
    try {
      const response = await fetch(`${this.serverUrl}/api/restart`, {
        method: 'POST'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error restarting WhatsApp:', error);
      return { error: 'Error reiniciando WhatsApp' };
    }
  }

  // Mostrar modal de configuración WhatsApp
  showSetupModal() {
    const modal = document.createElement('div');
    modal.id = 'whatsapp-setup-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
      align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center;">
        <h2 style="color: #25D366; margin-top: 0;">📱 Configurar WhatsApp</h2>
        
        <div id="connection-status" style="margin: 20px 0; padding: 15px; border-radius: 8px; background: #f0f0f0;">
          Verificando conexión...
        </div>
        
        <div id="qr-container" style="margin: 20px 0; display: none;">
          <p style="color: #666;">Escanea este código QR con tu WhatsApp:</p>
          <img id="qr-image" style="max-width: 300px; width: 100%; border: 1px solid #ddd; border-radius: 8px;" />
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            Abre WhatsApp → Menú (3 puntos) → Dispositivos vinculados → Vincular dispositivo
          </p>
        </div>
        
        <div style="margin-top: 20px;">
          <button id="refresh-qr" style="padding: 10px 20px; margin: 5px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🔄 Actualizar QR
          </button>
          <button id="restart-session" style="padding: 10px 20px; margin: 5px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🔄 Reiniciar Sesión
          </button>
          <button id="close-modal" style="padding: 10px 20px; margin: 5px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
            ❌ Cerrar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('refresh-qr').onclick = () => this.updateQR();
    document.getElementById('restart-session').onclick = () => this.restartAndUpdate();
    document.getElementById('close-modal').onclick = () => document.body.removeChild(modal);
    
    // Actualizar estado inicial
    this.updateConnectionStatus();
    this.updateQR();
    
    // Auto-actualizar cada 3 segundos
    const updateInterval = setInterval(() => {
      if (document.getElementById('whatsapp-setup-modal')) {
        this.updateConnectionStatus();
        if (!this.isConnected) {
          this.updateQR();
        }
      } else {
        clearInterval(updateInterval);
      }
    }, 3000);
  }

  // Actualizar estado de conexión en el modal
  async updateConnectionStatus() {
    const statusDiv = document.getElementById('connection-status');
    if (!statusDiv) return;
    
    const status = await this.checkStatus();
    
    if (status.authenticated) {
      statusDiv.innerHTML = '✅ WhatsApp conectado y listo para enviar mensajes';
      statusDiv.style.background = '#d4edda';
      statusDiv.style.color = '#155724';
      document.getElementById('qr-container').style.display = 'none';
    } else {
      statusDiv.innerHTML = '❌ WhatsApp no conectado - Escanea el QR para conectar';
      statusDiv.style.background = '#f8d7da';
      statusDiv.style.color = '#721c24';
      document.getElementById('qr-container').style.display = 'block';
    }
  }

  // Actualizar QR Code
  async updateQR() {
    const qrImage = document.getElementById('qr-image');
    if (!qrImage) return;
    
    const qrData = await this.getQRCode();
    
    if (qrData.qr) {
      qrImage.src = qrData.qr;
    } else if (qrData.authenticated) {
      document.getElementById('qr-container').style.display = 'none';
    }
  }

  // Reiniciar y actualizar
  async restartAndUpdate() {
    const statusDiv = document.getElementById('connection-status');
    statusDiv.innerHTML = '🔄 Reiniciando sesión WhatsApp...';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.color = '#856404';
    
    await this.restart();
    
    setTimeout(() => {
      this.updateConnectionStatus();
      this.updateQR();
    }, 3000);
  }
}

// Instancia global
const whatsapp = new WhatsAppIntegration();

// Función para enviar WhatsApp desde el pipeline
window.sendWhatsAppFromPipeline = async function(lead) {
  try {
    // Verificar conexión
    const status = await whatsapp.checkStatus();
    
    if (!status.authenticated) {
      showToast('⚠️ WhatsApp no conectado. Abre la consola para configurar conexión.', 'warning');
      console.log('🔧 Para conectar WhatsApp:');
      console.log('1. Ejecuta: cd whatsapp-server && node server.js');
  console.log('2. Visita: https://crmwhatsapp3001.loca.lt y escanea el QR');
      console.log('3. Una vez conectado, vuelve a mover la tarjeta');
      return;
    }

    const phone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
    
    if (!phone) {
      showToast('❌ Este lead no tiene número de teléfono', 'error');
      return;
    }

    const message = `Hola ${lead.contactName || 'estimado/a'}, 

Gracias por tu interés en nuestros servicios. Me pongo en contacto contigo desde ${lead.companyName || 'tu empresa'} para conversar sobre cómo podemos ayudarte.

¿Cuándo sería un buen momento para tener una breve conversación?

Saludos!`;

    showToast('📤 Enviando mensaje por WhatsApp...', 'info');

    const result = await whatsapp.sendMessage(phone, message, lead.contactName);

    if (result.success) {
      showToast(`✅ Mensaje enviado a ${lead.contactName} (${phone})`, 'success');
    } else {
      showToast(`❌ Error: ${result.error}`, 'error');
      console.error('Error detallado:', result);
    }
  } catch (error) {
    console.error('Error en sendWhatsAppFromPipeline:', error);
    showToast('❌ Error al enviar WhatsApp. Verifica que el servidor esté funcionando.', 'error');
  }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WhatsAppIntegration, whatsapp };
}
