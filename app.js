document.addEventListener('DOMContentLoaded', init);

// Mini-CRM B2B - JS sin frameworks
// Estado global y helpers
const STAGES = ['Nuevo','Calificado','En Conversación','Propuesta','Cerrado-Won','Cerrado-Lost'];
const DISTRICTS = ['Miraflores','San Isidro','Barranco','Surco','La Molina','San Borja'];
const INDUSTRIAS_ICP = ['Hotelería','Clínica','Salud'];
const LS_KEY = 'miniCrmB2B';

function getState() {
  let state = localStorage.getItem(LS_KEY);
  if (state) return JSON.parse(state);
  // Seed inicial
  return {
    leads: [
      {companyName:'Ramada Encore',contactName:'Úrsula',phone:'+51999999999',industry:'Hotelería',size:60,district:'San Isidro',email:'',notes:'',source:'Web',status:'Nuevo'},
      {companyName:'Clínica Providencia',contactName:'Admisión',phone:'+51988888888',industry:'Clínica',size:80,district:'San Borja',email:'',notes:'',source:'Web',status:'Calificado'},
      {companyName:'Casa Convivencia',contactName:'María',phone:'+51977777777',industry:'Residencial',size:30,district:'Miraflores',email:'',notes:'',source:'Web',status:'En Conversación'}
    ],
    templates: [
      'Hola {{contactName}}, te escribo de {{companyName}} para conversar sobre una posible colaboración.',
      'Estimado/a {{contactName}}, ¿podemos agendar una llamada para conocer más sobre {{companyName}}?'
    ],
    reminders: []
  };
}
function setState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
function scoreICP(lead) {
  let score = 0;
  if (INDUSTRIAS_ICP.some(i => (lead.industry||'').toLowerCase().includes(i.toLowerCase()))) score += 10;
  if (DISTRICTS.includes(lead.district)) score += 10;
  if (lead.size && lead.size >= 50) score += 5;
  if (/^\+51\d{9}$/.test(lead.phone)) score += 5;
  return score;
}
function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab===tab));
  document.querySelectorAll('main > section').forEach(sec => sec.classList.toggle('hidden', sec.id!==`tab-${tab}`));
  if (tab==='leads') renderLeads();
  if (tab==='pipeline') renderKanban();
  if (tab==='plantillas') renderTemplates();
  if (tab==='recordatorios') renderReminders();
}
// Leads
function renderLeads() {
  const state = getState();
  let leads = state.leads.map(l => ({...l, icpScore: scoreICP(l)}));
  const q = document.getElementById('leadSearch').value.toLowerCase();
  if (q) leads = leads.filter(l => (l.companyName+l.contactName).toLowerCase().includes(q));
  leads = leads.sort((a,b)=>b.icpScore-a.icpScore);
  let html = `<table><thead><tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th>Industria</th><th>Distrito</th><th>Tamaño</th><th>ICP</th><th>Estado</th><th></th></tr></thead><tbody>`;
  for(const l of leads) {
    html += `<tr><td>${l.companyName}</td><td>${l.contactName}</td><td>${l.phone}</td><td>${l.industry}</td><td>${l.district}</td><td>${l.size||''}</td><td>${l.icpScore}</td><td>${l.status}</td><td><button class="btn ghost" onclick="editLead('${l.companyName}')">Editar</button></td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('leadsTableWrap').innerHTML = html;
}
window.editLead = function(companyName) {
  const state = getState();
  const lead = state.leads.find(l=>l.companyName===companyName);
  if (!lead) return;
  const dlg = document.getElementById('leadDialog');
  dlg.showModal();
  dlg.dataset.company = companyName;
  document.getElementById('dlgCompany').value = lead.companyName;
  document.getElementById('dlgContact').value = lead.contactName;
  document.getElementById('dlgPhone').value = lead.phone;
  document.getElementById('dlgIndustry').value = lead.industry;
  document.getElementById('dlgDistrict').value = lead.district;
  document.getElementById('dlgSize').value = lead.size||'';
  document.getElementById('dlgEmail').value = lead.email||'';
  document.getElementById('dlgNotes').value = lead.notes||'';
  document.getElementById('dlgSource').value = lead.source||'';
  document.getElementById('dlgStatus').value = lead.status||'Nuevo';
}
function clearLeadDialog() {
  document.getElementById('leadDialog').dataset.company = '';
  ['dlgCompany','dlgContact','dlgPhone','dlgIndustry','dlgDistrict','dlgSize','dlgEmail','dlgNotes','dlgSource','dlgStatus'].forEach(id=>document.getElementById(id).value='');
}
document.getElementById('addLeadBtn').onclick = ()=>{
  clearLeadDialog();
  document.getElementById('leadDialog').showModal();
};
document.getElementById('dlgCancel').onclick = ()=>{
  document.getElementById('leadDialog').close();
};
document.getElementById('leadDialog').onsubmit = function(e) {
  e.preventDefault();
  const state = getState();
  const company = document.getElementById('dlgCompany').value.trim();
  if (!company) return;
  const lead = {
    companyName: company,
    contactName: document.getElementById('dlgContact').value.trim(),
    phone: document.getElementById('dlgPhone').value.trim(),
    industry: document.getElementById('dlgIndustry').value.trim(),
    district: document.getElementById('dlgDistrict').value.trim(),
    size: parseInt(document.getElementById('dlgSize').value)||0,
    email: document.getElementById('dlgEmail').value.trim(),
    notes: document.getElementById('dlgNotes').value.trim(),
    source: document.getElementById('dlgSource').value.trim(),
    status: document.getElementById('dlgStatus').value
  };
  const idx = state.leads.findIndex(l=>l.companyName===company);
  if (idx>=0) state.leads[idx]=lead; else state.leads.push(lead);
  setState(state);
  document.getElementById('leadDialog').close();
  renderLeads();
  showToast('Lead guardado');
};
document.getElementById('dlgDelete').onclick = function() {
  const state = getState();
  const company = document.getElementById('leadDialog').dataset.company;
  if (!company) return;
  state.leads = state.leads.filter(l=>l.companyName!==company);
  setState(state);
  document.getElementById('leadDialog').close();
  renderLeads();
  showToast('Lead eliminado');
};
document.getElementById('leadSearch').oninput = renderLeads;
// Kanban
function renderKanban() {
  const state = getState();
  let html = '<div class="kanban">';
  for(const stage of STAGES) {
    html += `<div class="col" data-stage="${stage}"><div class="col-title">${stage}</div>`;
    for(const l of state.leads.filter(x=>x.status===stage)) {
      html += `<div class="card" draggable="true" data-company="${l.companyName}">${l.companyName}<br><span style="color:var(--sub)">${l.contactName}</span></div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('kanbanWrap').innerHTML = html;
  // Drag&Drop
  document.querySelectorAll('.card').forEach(card => {
    card.ondragstart = e => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.company);
    };
    card.ondragend = ()=>card.classList.remove('dragging');
  });
  document.querySelectorAll('.col').forEach(col => {
    col.ondragover = e => e.preventDefault();
    col.ondrop = e => {
      const company = e.dataTransfer.getData('text/plain');
      moveLead(company, col.dataset.stage);
    };
  });
}
function moveLead(company, stage) {
  const state = getState();
  const lead = state.leads.find(l=>l.companyName===company);
  if (!lead) return;
  lead.status = stage;
  setState(state);
  renderKanban();
}
// Plantillas
function renderTemplates() {
  const state = getState();
  let html = '<ul>';
  state.templates.forEach((tpl,i)=>{
    html += `<li>${tpl} <button class="btn ghost" onclick="useTpl(${i})">Usar</button> <button class="btn danger" onclick="delTpl(${i})">Eliminar</button></li>`;
  });
  html += '</ul>';
  document.getElementById('tplList').innerHTML = html;
}
window.useTpl = function(idx) {
  const state = getState();
  const tpl = state.templates[idx];
  if (!tpl) return;
  showToast('Selecciona un lead para aplicar la plantilla');
};
window.delTpl = function(idx) {
  const state = getState();
  state.templates.splice(idx,1);
  setState(state);
  renderTemplates();
  showToast('Plantilla eliminada');
};
document.getElementById('addTplBtn').onclick = function() {
  const val = document.getElementById('tplInput').value.trim();
  if (!val) return;
  const state = getState();
  state.templates.push(val);
  setState(state);
  document.getElementById('tplInput').value = '';
  renderTemplates();
  showToast('Plantilla agregada');
};
// Recordatorios
function renderReminders() {
  const state = getState();
  let html = '<ul>';
  state.reminders.forEach((r,i)=>{
    html += `<li><span>${r.text}</span> <button class="btn ok" onclick="markRem(${i})">Hecho</button> <button class="btn danger" onclick="delRem(${i})">Eliminar</button></li>`;
  });
  html += '</ul>';
  document.getElementById('remList').innerHTML = html;
}
window.markRem = function(idx) {
  const state = getState();
  state.reminders[idx].done = true;
  setState(state);
  renderReminders();
};
window.delRem = function(idx) {
  const state = getState();
  state.reminders.splice(idx,1);
  setState(state);
  renderReminders();
};
document.getElementById('addRemBtn').onclick = function() {
  const val = document.getElementById('remInput').value.trim();
  if (!val) return;
  const state = getState();
  state.reminders.push({text:val,done:false});
  setState(state);
  document.getElementById('remInput').value = '';
  renderReminders();
  showToast('Recordatorio agregado');
};
// Dialog Recordatorio
document.getElementById('dlgRemCancel').onclick = ()=>{
  document.getElementById('remDialog').close();
};
document.getElementById('remDialog').onsubmit = function(e) {
  e.preventDefault();
  // Implementar edición de recordatorio si se requiere
  document.getElementById('remDialog').close();
};
document.getElementById('dlgRemDelete').onclick = function() {
  // Implementar eliminación de recordatorio si se requiere
  document.getElementById('remDialog').close();
};
// Import/Export CSV
document.getElementById('importBtn').onclick = function() {
  const input = document.getElementById('csvInput');
  if (!input.files.length) return showToast('Selecciona un archivo CSV');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split(/\r?\n/).filter(Boolean);
    const headers = rows[0].split(',');
    const leads = rows.slice(1).map(row => {
      const vals = row.split(',');
      const obj = {};
      headers.forEach((h,i)=>obj[h]=vals[i]);
      obj.icpScore = scoreICP(obj);
      return obj;
    });
    const state = getState();
    state.leads = leads;
    setState(state);
    renderLeads();
    showToast('Leads importados');
  };
  reader.readAsText(file);
};
document.getElementById('exportBtn').onclick = function() {
  const state = getState();
  const headers = ['companyName','contactName','phone','email','industry','size','district','notes','source','status','icpScore'];
  const csv = [headers.join(',')].concat(state.leads.map(l=>headers.map(h=>l[h]||'').join(','))).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leads.csv';
  a.click();
  showToast('Leads exportados');
};
// Tabs
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick = ()=>showTab(btn.dataset.tab);
});
// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
// Bug opacidad recordatorio
document.querySelectorAll('#remList li').forEach(row=>{
  const r = getState().reminders.find(rem=>rem.text===row.textContent);
  if (r) row.style.opacity = r.done ? 0.5 : 1;
});
// Inicial
document.addEventListener('DOMContentLoaded',()=>{
  showTab('leads');
});
