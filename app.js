// Mini-CRM B2B - Lógica principal
// Autor: martinbeasnunez

// Datos iniciales de leads
const leads = [
  {
    empresa: "TechNova S.A.",
    contacto: "Ana Torres",
    telefono: "987654321",
    industria: "Tecnología",
    distrito: "San Isidro"
  },
  {
    empresa: "AgroPerú SAC",
    contacto: "Luis Paredes",
    telefono: "945123456",
    industria: "Agricultura",
    distrito: "La Molina"
  },
  {
    empresa: "Finanzas Globales",
    contacto: "María López",
    telefono: "912345678",
    industria: "Finanzas",
    distrito: "Miraflores"
  },
  {
    empresa: "ConstruyeYa",
    contacto: "Carlos Ruiz",
    telefono: "999888777",
    industria: "Construcción",
    distrito: "Surco"
  },
  {
    empresa: "Salud Vital",
    contacto: "Patricia Gómez",
    telefono: "955667788",
    industria: "Salud",
    distrito: "San Borja"
  }
];
    function renderLeadsTable(data) {
      const tbody = document.querySelector('#leads-table tbody');
      tbody.innerHTML = '';
      data.forEach(lead => {
        const tr = document.createElement('tr');
        Object.entries(lead).forEach(([key, value]) => {
          const td = document.createElement('td');
          td.textContent = value;
          // Para versión mobile, agrega etiqueta
          td.setAttribute('data-label', key.charAt(0).toUpperCase() + key.slice(1));
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    // Filtra leads por texto (empresa o contacto)
    function filterLeads() {
      const filter = document.getElementById('lead-filter').value.toLowerCase();
      const filtered = leads.filter(lead =>
        lead.empresa.toLowerCase().includes(filter) ||
        lead.contacto.toLowerCase().includes(filter)
      );
      renderLeadsTable(filtered);
    }

    // Maneja la navegación entre secciones
    function setupNavigation() {
      const navBtns = document.querySelectorAll('.nav-btn');
      const sections = {
        leads: document.getElementById('leads-section'),
        pipeline: document.getElementById('pipeline-section'),
        plantillas: document.getElementById('plantillas-section'),
        recordatorios: document.getElementById('recordatorios-section'),
        importar: document.getElementById('importar-section')
      };
      navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Quitar activo de todos
          navBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // Ocultar todas las secciones
          Object.values(sections).forEach(sec => sec.classList.add('hidden'));
          // Mostrar la sección correspondiente
          const sectionKey = btn.getAttribute('data-section');
          sections[sectionKey].classList.remove('hidden');
        });
      });
    }

    // Inicializa eventos y renderizado
    function init() {
      renderLeadsTable(leads);
      document.getElementById('lead-filter').addEventListener('input', filterLeads);
      setupNavigation();
    }
