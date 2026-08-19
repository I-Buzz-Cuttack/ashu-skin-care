const clinicKnowledge = {
  clinicName: "",
  services: [],
  doctors: [],
  openingHours: "",
  location: "",
  contact: "",
  appointmentInfo: "",
  pricing: "",
  faqs: [],
  policies: [],
};

export const getClinicKnowledge = () => clinicKnowledge;

export const formatClinicKnowledgeForPrompt = () => {
  const knowledge = getClinicKnowledge();
  const lines = [
    ["Clinic name", knowledge.clinicName],
    ["Services", knowledge.services.join(", ")],
    ["Doctors", knowledge.doctors.join(", ")],
    ["Opening hours", knowledge.openingHours],
    ["Location", knowledge.location],
    ["Contact", knowledge.contact],
    ["Appointment information", knowledge.appointmentInfo],
    ["Pricing", knowledge.pricing],
    ["FAQs", knowledge.faqs.join(" | ")],
    ["Policies", knowledge.policies.join(" | ")],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return lines.length
    ? lines.join("\n")
    : "No clinic-specific information has been configured yet.";
};
