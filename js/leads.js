import { getState, setState, showToast, scoreICP } from './common.js';

function hasPendingReminders(state, lead) {
  const now = new Date();
  return (state.reminders || []).some(r => r.lead === lead.companyName && r.status !== 'completed' && new Date(r.date) >= new Date(now.setHours(0,0,0,0)));
}

function nextStepLabel(lead) {
  try {
    const state = getState();
    // Clave de industria normalizada se resuelve en messages.js, aquí usamos industria tal cual para contar
    const total = 3; // definimos 3 toques por la normalización
    const sent = Array.isArray(lead.msgHistory) ? lead.msgHistory.length : 0;
    if (sent >= total) return '✔️ Completo';
    return `${sent + 1}/${total}`;
  } catch (e) {
    return '1/3';
  }
}

export function renderLeads() {
  const state = getState();
  let leads = state.leads.map(l => ({...l, icpScore: scoreICP(l)}));
  const q = document.getElementById('leadSearch').value.toLowerCase();
  if (q) {
    leads = leads.filter(l => 
      (l.companyName + l.contactName).toLowerCase().includes(q)
    );
  }
  leads.sort((a,b) => b.icpScore - a.icpScore);
  
  const html = `
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Industria</th>
          <th>Distrito</th>
          <th>Tamaño</th>
          <th>ICP</th>
          <th>Estado</th>
          <th>Sig.</th>
          <th>Msg</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(l => {
          const bell = hasPendingReminders(state, l) ? ' 🔔' : '';
          return `
          <tr${l.lastMsg ? " style='background:var(--muted)'" : ""}>
            <td>${l.companyName}</td>
            <td>${l.contactName}</td>
            <td>${l.phone}</td>
            <td>${l.industry}</td>
            <td>${l.district}</td>
            <td>${l.size || ''}</td>
            <td>${l.icpScore}</td>
            <td>${l.status} ${l.lastMsg ? '💬' : ''}${bell}</td>
            <td>${nextStepLabel(l)}</td>
            <td>
              <button class='btn primary' onclick='window.showMsgDialog(${JSON.stringify(l.companyName)})'>
                💬 Mensaje
              </button>
            </td>
            <td>
              <button class="btn ghost" onclick='window.editLead(${JSON.stringify(l.companyName)})'>
                Editar
              </button>
            </td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
  `;
  
  document.getElementById('leadsTableWrap').innerHTML = html;
}

export function editLead(companyName) {
  const dialog = document.getElementById('leadDialog');
  const state = getState();
  const lead = companyName ? state.leads.find(l => l.companyName === companyName) : {
    companyName: '',
    contactName: '',
    phone: '',
    industry: '',
    district: '',
    size: '',
    email: '',
    notes: '',
    source: '',
    status: 'Nuevo'
  };

  // Llenar el formulario
  document.getElementById('dlgCompany').value = lead.companyName;
  document.getElementById('dlgContact').value = lead.contactName;
  document.getElementById('dlgPhone').value = lead.phone;
  document.getElementById('dlgIndustry').value = lead.industry;
  document.getElementById('dlgDistrict').value = lead.district;
  document.getElementById('dlgSize').value = lead.size;
  document.getElementById('dlgEmail').value = lead.email;
  document.getElementById('dlgNotes').value = lead.notes;
  document.getElementById('dlgSource').value = lead.source;
  document.getElementById('dlgStatus').value = lead.status;

  // Mostrar/ocultar botón eliminar
  document.getElementById('dlgDelete').style.display = companyName ? 'block' : 'none';

  // Manejar guardar
  dialog.onsubmit = (e) => {
    e.preventDefault();
    const newLead = {
      companyName: document.getElementById('dlgCompany').value,
      contactName: document.getElementById('dlgContact').value,
      phone: document.getElementById('dlgPhone').value,
      industry: document.getElementById('dlgIndustry').value,
      district: document.getElementById('dlgDistrict').value,
      size: document.getElementById('dlgSize').value,
      email: document.getElementById('dlgEmail').value,
      notes: document.getElementById('dlgNotes').value,
      source: document.getElementById('dlgSource').value,
      status: document.getElementById('dlgStatus').value
    };

    const state = getState();
    const index = state.leads.findIndex(l => l.companyName === companyName);
    
    if (index >= 0) {
      state.leads[index] = newLead;
    } else {
      state.leads.push(newLead);
    }
    
    setState(state);
    renderLeads();
    dialog.close();
    showToast(companyName ? 'Lead actualizado' : 'Lead creado');
  };

  dialog.showModal();
}

export function deleteLead(companyName) {
  if (!companyName) return;
  
  if (confirm(`¿Estás seguro de eliminar el lead ${companyName}?`)) {
    const state = getState();
    state.leads = state.leads.filter(l => l.companyName !== companyName);
    setState(state);
    renderLeads();
    document.getElementById('leadDialog').close();
    showToast('Lead eliminado');
  }
}

// Inicialización del módulo de Leads
export function initLeads() {
  // Botón nuevo lead
  document.getElementById('addLeadBtn')?.addEventListener('click', () => editLead());
  // Búsqueda
  document.getElementById('leadSearch')?.addEventListener('input', renderLeads);
  // Dialogo Lead: cancelar
  document.getElementById('dlgCancel')?.addEventListener('click', () => document.getElementById('leadDialog').close());
  // Dialogo Lead: eliminar
  document.getElementById('dlgDelete')?.addEventListener('click', () => {
    const companyName = document.getElementById('dlgCompany')?.value;
    if (companyName) deleteLead(companyName);
  });
  // Render inicial
  if (document.getElementById('leadsTableWrap')) {
    renderLeads();
  }
}

// Exponer funciones necesarias globalmente
window.editLead = editLead;
window.deleteLead = deleteLead;
window.renderLeads = renderLeads;

// Helper para pruebas: añadir un lead programáticamente y guardar
window.addLeadProgrammatically = function(lead) {
  const state = getState();
  state.leads.push(lead);
  setState(state);
  renderLeads();
  return lead;
}
