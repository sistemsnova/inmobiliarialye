
export var PropertyStatus;
(function (PropertyStatus) {
  PropertyStatus["AVAILABLE"] = "Disponible";
  PropertyStatus["RESERVED"] = "Reservado";
  PropertyStatus["SOLD"] = "Vendido";
  PropertyStatus["RENTED"] = "Alquilado";
})(PropertyStatus || (PropertyStatus = {}));

export var LeadStatus;
(function (LeadStatus) {
  LeadStatus["NEW"] = "Nuevo";
  LeadStatus["CONTACTED"] = "Contactado";
  LeadStatus["VIEWING"] = "Visita";
  LeadStatus["NEGOTIATION"] = "Negociación";
  LeadStatus["CLOSED"] = "Cerrado";
})(LeadStatus || (LeadStatus = {}));