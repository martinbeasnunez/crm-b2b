# 🚀 CRM WhatsApp Integration - La Más FÁCIL

## 📋 Instrucciones de Instalación

### 1. Instalar Node.js
Si no tienes Node.js instalado:
- Descarga desde: https://nodejs.org/
- Instala la versión LTS (recomendada)

### 2. Instalar dependencias del servidor WhatsApp

```bash
cd whatsapp-server
npm install
```

### 3. Iniciar el servidor WhatsApp

```bash
npm start
```

**¡Eso es TODO!** 🎉

## 🔧 Cómo Funciona

### 1. **Iniciar el Servidor**
```bash
cd whatsapp-server
npm start
```
- El servidor se ejecutará en `http://localhost:3001`
- Se abrirá una ventana de navegador automáticamente

### 2. **Conectar WhatsApp**
- En tu CRM, haz clic en el botón **📱 WhatsApp** (esquina superior derecha)
- Se abrirá un modal con un código QR
- Abre WhatsApp en tu móvil
- Ve a: **Menú (3 puntos) → Dispositivos vinculados → Vincular dispositivo**
- Escanea el QR que aparece en el modal
- ¡Listo! 🎉

### 3. **Usar el Sistema**
- Mueve cualquier tarjeta del pipeline a **"En Conversación"**
- **¡El mensaje de WhatsApp se enviará AUTOMÁTICAMENTE!** 📤
- Verás una notificación de confirmación

## 📱 Estados de Conexión

- ✅ **Verde**: WhatsApp conectado y listo
- ❌ **Rojo**: WhatsApp desconectado - escanear QR
- 🔄 **Amarillo**: Conectando...

## 🔄 Botones del Modal

- **🔄 Actualizar QR**: Regenera el código QR
- **🔄 Reiniciar Sesión**: Reinicia completamente la conexión
- **❌ Cerrar**: Cierra el modal

## 🛠️ Solución de Problemas

### Problema: "Error de conexión con el servidor"
**Solución**: Asegúrate de que el servidor esté corriendo:
```bash
cd whatsapp-server
npm start
```

### Problema: "WhatsApp no conectado"
**Solución**: 
1. Haz clic en **📱 WhatsApp** en el CRM
2. Escanea el QR con tu móvil
3. Espera a ver ✅ "WhatsApp conectado"

### Problema: El QR no aparece
**Solución**: 
1. Haz clic en **🔄 Reiniciar Sesión**
2. Espera 5 segundos
3. Haz clic en **🔄 Actualizar QR**

### Problema: La sesión se desconecta
**Solución**: Es normal. Solo vuelve a escanear el QR cuando sea necesario.

## 📂 Estructura de Archivos

```
crm-b2b/
├── whatsapp-server/          # Servidor de WhatsApp
│   ├── package.json         # Dependencias
│   ├── server.js            # Servidor principal
│   └── node_modules/        # (se crea al hacer npm install)
├── js/
│   ├── whatsapp-integration.js  # Integración frontend
│   └── pipeline.js             # Pipeline con WhatsApp
└── index.html                   # CRM principal
```

## 🎯 Características

- ✅ **Súper fácil de instalar** (solo `npm install` + `npm start`)
- ✅ **Conexión por QR** (como WhatsApp Web)
- ✅ **Envío automático** al mover tarjetas
- ✅ **Interfaz visual** para gestionar conexión
- ✅ **Reconexión automática** en caso de desconexión
- ✅ **Mensajes personalizados** con nombre y empresa
- ✅ **Sin APIs de pago** - usa tu WhatsApp personal

## 🚀 ¡Ya está listo para usar!

1. `cd whatsapp-server && npm start`
2. Abrir el CRM en el navegador
3. Clic en **📱 WhatsApp** y escanear QR
4. Mover tarjetas a "En Conversación"
5. **¡Los mensajes se envían automáticamente!** 🎉
