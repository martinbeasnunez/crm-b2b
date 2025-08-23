# WhatsApp Server

Este servidor se encarga de la integración con WhatsApp Web usando wppconnect.

Comandos rápidos (desarrollo):

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

Docker image
------------

Se incluye un `Dockerfile` para construir la imagen del servidor. En GitHub Actions se publicará automáticamente la imagen en GHCR con la etiqueta `latest` cuando hagas push en la carpeta `whatsapp-server`.

Ejemplo local:

```bash
# construir imagen
docker build -t crm-whatsapp-server:local ./whatsapp-server

# ejecutar
docker run -p 3001:3001 crm-whatsapp-server:local
```

Despliegue a Render/Railway
---------------------------
Usa la imagen publicada en GHCR (ejemplo: `ghcr.io/<OWNER>/crm-whatsapp-server:latest`) o conecta directamente el repo a Railway/Render; establece variables de entorno si necesitas configuraciones adicionales.
