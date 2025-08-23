# crm-b2b

Mini-CRM B2B con integración básica a WhatsApp Web (WPPConnect).

Quickstart (desarrollo local)

1. Backend WhatsApp

```bash
cd whatsapp-server
npm install
node server.js
```

El servidor corre en `http://localhost:3001` por defecto y expone endpoints en `/api/whatsapp/*`.

2. Frontend

```bash
# desde la raíz del repo
python3 -m http.server 8000
```

Abrir `http://localhost:8000` en el navegador. El archivo `index.html` ya fija `window.WA_SERVER_URL` a `http://localhost:3001` en desarrollo.

3. Conectar WhatsApp

- En la UI del CRM, abre la pestaña `📱 WhatsApp` y haz click en "Abrir WhatsApp QR" o ejecuta en la consola del navegador:

```js
window.whatsapp && window.whatsapp.showSetupModal()
```

- Escanea el QR desde WhatsApp (Menú → Dispositivos vinculados → Vincular dispositivo).

Tests y CI

- Tests unitarios con Jest están en `test/`.
- Ejecutar tests localmente:

```bash
npm install
npm test
```

El repositorio ejecuta tests automáticamente en GitHub Actions en cada push/PR.

Limpieza y legacy

- Los scripts legacy relacionados con WhatsApp se movieron a `whatsapp/legacy/`.
- Las vistas antiguas se movieron a `views/legacy/`.

Próximos pasos recomendados

- Desplegar `whatsapp-server` a un host (Railway/Render) si necesitas URL pública estable.
- Añadir más tests para `sendMessage` y UI modal.

Contacto

Si quieres que yo automatice el despliegue o siga con tests, responde con la preferencia y lo hago.