const express = require('express');
const cors = require('cors');
const wppconnect = require('@wppconnect-team/wppconnect');
const QRCode = require('qrcode');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let client = null;
let qrCodeData = null;
let isAuthenticated = false;

// Endpoint para desconectar
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (client) {
      await client.logout();
      client = null;
      isAuthenticated = false;
      qrCodeData = null;
      console.log('🔌 WhatsApp desconectado');
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error al desconectar WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inicializar servidor
async function initWhatsApp() {
  try {
    client = await wppconnect.create({
      session: 'crm-session',
      headless: true, // Modo headless para contenedores
      devtools: false,
      debug: false,
      logQR: true,
      browserArgs: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      autoClose: 60000,
      puppeteerOptions: {
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      },
      catchQR: (base64Qr, asciiQR) => {
        console.log('📱 QR Code generado');
        qrCodeData = base64Qr;
      },
      statusFind: (statusSession, session) => {
        console.log('Status Session: ', statusSession);
        if (statusSession === 'authenticated') {
          isAuthenticated = true;
          console.log('✅ WhatsApp conectado exitosamente!');
        }
      }
    });

    console.log('🚀 Servidor WhatsApp iniciado');
    
  } catch (error) {
    console.error('❌ Error al inicializar WhatsApp:', error);
  }
}

// Rutas de la API

// Verificar estado de conexión WhatsApp
app.get('/api/whatsapp/status', (req, res) => {
  if (isAuthenticated) {
    return res.json({ 
      status: 'authenticated',
      message: '✅ WhatsApp Conectado',
      authenticated: true,
      connected: true
    });
  }
  
  if (qrCodeData) {
    return res.json({ 
      status: 'qr_ready',
      message: 'Esperando escaneo de QR...',
      qr: qrCodeData,
      authenticated: false,
      connected: false
    });
  }
  
  res.json({ 
    status: 'connecting',
    message: 'Generando código QR...',
    authenticated: false,
    connected: false
  });
});

// Obtener QR Code (mantener compatibilidad)
app.get('/api/qr', async (req, res) => {
  if (isAuthenticated) {
    return res.json({ authenticated: true, message: 'Ya está conectado' });
  }
  
  if (qrCodeData) {
    try {
      const qrImageUrl = await QRCode.toDataURL(qrCodeData);
      res.json({ qr: qrImageUrl, authenticated: false });
    } catch (error) {
      res.status(500).json({ error: 'Error generando QR' });
    }
  } else {
    res.json({ message: 'Generando QR...', authenticated: false });
  }
});

// Verificar estado de conexión (mantener compatibilidad)
app.get('/api/status', (req, res) => {
  res.json({ 
    authenticated: isAuthenticated,
    connected: client ? true : false
  });
});

// Enviar mensaje WhatsApp
app.post('/api/whatsapp/send', async (req, res) => {
  const { number, message } = req.body;

  if (!isAuthenticated || !client) {
    return res.status(400).json({ 
      success: false,
      error: 'WhatsApp no está conectado. Escanea el QR primero.' 
    });
  }

  if (!number || !message) {
    return res.status(400).json({ 
      success: false,
      error: 'Número y mensaje son requeridos' 
    });
  }

  try {
    const formattedNumber = number.includes('@') ? number : `${number}@c.us`;
    await client.sendText(formattedNumber, message);
    
    console.log(`📤 Mensaje enviado a ${number}: ${message}`);
    res.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente' 
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al enviar mensaje: ' + error.message 
    });
  }
});

// Reiniciar conexión WhatsApp
app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    if (client) {
      await client.logout();
    }
    
    client = null;
    isAuthenticated = false;
    qrCodeData = null;
    
    console.log('🔄 Reiniciando conexión WhatsApp...');
    
    // Reinicializar después de un breve delay
    setTimeout(() => {
      initWhatsApp();
    }, 2000);
    
    res.json({ success: true, message: 'Reiniciando conexión...' });
  } catch (error) {
    console.error('Error reiniciando WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar mensaje (mantener compatibilidad)
app.post('/api/send-message', async (req, res) => {
  const { phone, message, contactName } = req.body;

  if (!isAuthenticated || !client) {
    return res.status(400).json({ 
      error: 'WhatsApp no está conectado. Escanea el QR primero.' 
    });
  }

  if (!phone || !message) {
    return res.status(400).json({ 
      error: 'Número de teléfono y mensaje son requeridos' 
    });
  }

  try {
    // Formatear número (agregar código de país si no lo tiene)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('51')) {
      formattedPhone = '51' + formattedPhone;
    }
    formattedPhone = formattedPhone + '@c.us';

    // Enviar mensaje
    const result = await client.sendText(formattedPhone, message);
    
    console.log(`✅ Mensaje enviado a ${contactName} (${phone})`);
    
    res.json({ 
      success: true, 
      messageId: result.id,
      phone: formattedPhone,
      message: 'Mensaje enviado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    res.status(500).json({ 
      error: 'Error enviando mensaje: ' + error.message 
    });
  }
});

// Reiniciar sesión
app.post('/api/restart', async (req, res) => {
  try {
    if (client) {
      await client.close();
    }
    isAuthenticated = false;
    qrCodeData = null;
    client = null;
    
    // Reinicializar
    setTimeout(() => {
      initWhatsApp();
    }, 2000);
    
    res.json({ message: 'Reiniciando sesión WhatsApp...' });
  } catch (error) {
    res.status(500).json({ error: 'Error reiniciando: ' + error.message });
  }
});

// Página de prueba simple
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>CRM WhatsApp Server</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>🚀 CRM WhatsApp Server</h1>
        <p><strong>Estado:</strong> ${isAuthenticated ? '✅ Conectado' : '❌ Desconectado'}</p>
        <h3>Endpoints disponibles:</h3>
        <ul>
          <li><code>GET /api/status</code> - Estado de conexión</li>
          <li><code>GET /api/qr</code> - Obtener QR code</li>
          <li><code>POST /api/send-message</code> - Enviar mensaje</li>
          <li><code>POST /api/restart</code> - Reiniciar sesión</li>
        </ul>
        <p>Puerto: ${PORT}</p>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
  initWhatsApp();
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
});

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});
