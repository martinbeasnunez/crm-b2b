#!/bin/bash

echo "🚀 Instalando CRM WhatsApp Integration..."
echo "========================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "📥 Descarga Node.js desde: https://nodejs.org/"
    echo "💡 Instala la versión LTS y vuelve a ejecutar este script"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Ir al directorio del servidor WhatsApp
cd whatsapp-server

echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Instalación completada exitosamente!"
    echo "========================================"
    echo ""
    echo "🚀 Para iniciar el servidor WhatsApp:"
    echo "   cd whatsapp-server"
    echo "   npm start"
    echo ""
    echo "📱 Luego abre tu CRM y haz clic en '📱 WhatsApp' para conectar"
    echo ""
    echo "📖 Consulta WHATSAPP-SETUP.md para instrucciones detalladas"
else
    echo "❌ Error durante la instalación"
    echo "💡 Intenta ejecutar manualmente:"
    echo "   cd whatsapp-server"
    echo "   npm install"
fi
