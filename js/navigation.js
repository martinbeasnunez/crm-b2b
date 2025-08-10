// Gestión de navegación por pestañas
export function showTab(tabId) {
  // Ocultar todos los paneles
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Mostrar el panel seleccionado
  const panel = document.getElementById(`tab-${tabId}`);
  if (panel) {
    panel.classList.remove('hidden');
  }
  
  // Actualizar botones de navegación
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
}
