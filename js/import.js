import { getState, setState, showToast } from './common.js';
import { renderLeads } from './leads.js';

export function importLeads(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const leads = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i] || '';
        });
        return obj;
      });
    
    if (leads.length === 0) {
      showToast('No se encontraron leads en el archivo', 'error');
      return;
    }
    
    const state = getState();
    leads.forEach(lead => {
      if (!state.leads.find(l => l.companyName === lead.companyName)) {
        state.leads.push(lead);
      }
    });
    
    setState(state);
    renderLeads();
    showToast(`${leads.length} leads importados`);
  };
  reader.readAsText(file);
}

export function exportLeads() {
  const state = getState();
  const headers = ['companyName','contactName','phone','industry','district','size','email','notes','source','status'];
  const csvContent = [
    headers.join(','),
    ...state.leads.map(lead => 
      headers.map(h => JSON.stringify(lead[h] || '')).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leads.csv';
  link.click();
}

export function initImport() {
  // Event listeners
  document.getElementById('importBtn')?.addEventListener('click', () => {
    const file = document.getElementById('csvInput').files[0];
    if (file) {
      importLeads(file);
    } else {
      showToast('Selecciona un archivo CSV', 'error');
    }
  });
  
  document.getElementById('exportBtn')?.addEventListener('click', exportLeads);
}

// Exponer funciones globalmente
window.importLeads = importLeads;
window.exportLeads = exportLeads;
