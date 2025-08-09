const leads = [
  {
    empresa: "Ramada Encore",
    contacto: "Úrsula",
    telefono: "+51999999999",
    industria: "Hotelería",
    distrito: "San Isidro",
    estado: "Cliente",
    icp: 15
  },
  {
    empresa: "Clínica Providencia",
    contacto: "Admisión",
    telefono: "+51988888888",
    industria: "Clínica/Salud",
    distrito: "San Borja",
    estado: "Lead",
    icp: 15
  },
  {
    empresa: "Casa Convivencia",
    contacto: "María",
    telefono: "+51977777777",
    industria: "Residencial",
    distrito: "Miraflores",
    estado: "Propuesta",
    icp: 15
  }
];

function renderLeads() {
  const tbody = document.querySelector("#leads-table tbody");
  tbody.innerHTML = "";

  leads.forEach(lead => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${lead.empresa}</td>
      <td>${lead.contacto}</td>
      <td>${lead.telefono}</td>
      <td>${lead.industria}</td>
      <td>${lead.distrito}</td>
      <td>${lead.estado}</td>
      <td>${lead.icp}</td>
    `;
    tbody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", renderLeads);
