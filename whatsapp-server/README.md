# WhatsApp Server

Este servidor se encarga de la integración con WhatsApp Web usando wppconnect.

Comandos rápidos (desarrollo):

```bash
cd whatsapp-server
npm install
node server.js
```

Endpoints importantes:

- GET /api/whatsapp/status - estado y posible `qr` (base64)
- GET /api/qr - compatibilidad, retorna `qr` como data URL
- POST /api/whatsapp/send - enviar mensaje (body: { number, message })
- POST /api/whatsapp/restart - reiniciar la sesión

Notas:
- En desarrollo se permite CORS desde cualquier origen.
- QR se almacena en memoria en `qrCodeData`.
- Para producción se recomienda desplegar en un host con HTTPS y proteger accesos.
