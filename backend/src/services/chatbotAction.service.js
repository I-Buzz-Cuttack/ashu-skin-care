import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import {
  getEffectivePermissionsForUser,
  getUserPermissions,
  replaceUserPermissions,
} from "./permission.service.js";

const CONFIRM_WORDS = new Set(["yes", "y", "ok", "okay", "confirm", "do it", "proceed", "sure"]);
const CANCEL_WORDS = new Set(["no", "n", "cancel", "stop", "don't", "dont"]);
const PERMISSION_RESOURCES = new Set(["dashboard", "opd", "prescription", "patient", "patient_scanner", "doctor", "ipd", "billing", "user", "permission"]);
const PERMISSION_ACTIONS = new Set(["read", "create", "update", "delete", "print", "export"]);

const normalize = (value) => String(value || "").trim().toLowerCase();
const compact = (value) => String(value || "").replace(/\s+/g, " ").trim();
const clean = (value) => value === undefined || value === null || value === "" ? "-" : value;
const pad = (value, length) => String(value).padStart(length, "0");

const dateCode = (date) => {
  const d = new Date(date);
  return `${pad(d.getDate(), 2)}${pad(d.getMonth() + 1, 2)}${d.getFullYear()}`;
};

const generateOpdIdentifiers = async (appointmentDate) => {
  const date = new Date(appointmentDate);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const countToday = await prisma.opdAppointment.count({
    where: { appointmentDate: { gte: startOfDay, lte: endOfDay } },
  });
  const sequence = pad(countToday + 1, 5);
  const code = dateCode(date);
  return { opdNo: `TKN-${code}-${sequence}`, caseId: `OPD-${code}-${sequence}` };
};

const generateUhid = () => {
  const d = new Date();
  const code = `${pad(d.getDate(), 2)}${pad(d.getMonth() + 1, 2)}${d.getFullYear()}`;
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `${code}${random}`;
};

const createPatientWithRetry = async (data, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await prisma.patient.create({ data: { ...data, uhid: generateUhid() } });
    } catch (error) {
      const collision = error.code === "P2002" && error.meta?.target?.includes("uhid");
      if (collision && attempt < retries - 1) continue;
      throw error;
    }
  }
  return prisma.patient.create({ data: { ...data, uhid: generateUhid() } });
};

const hasPermission = (permissions, resource, action) => {
  if (permissions.some((permission) => permission.resource === "*" && permission.action === "*")) return true;
  return permissions.some((permission) => permission.resource === resource && (permission.action === action || permission.action === "*"));
};

const requirePermission = (permissions, resource, action) =>
  hasPermission(permissions, resource, action) ? null : `You do not have permission for ${resource}:${action}.`;

const isConfirmation = (message) => {
  const text = normalize(message);
  return CONFIRM_WORDS.has(text) || /^yes\b|^ok\b|^okay\b|^confirm\b|^proceed\b|^do it\b/.test(text);
};

const isCancellation = (message) => {
  const text = normalize(message);
  return CANCEL_WORDS.has(text) || /^no\b|^cancel\b|^stop\b/.test(text);
};

const wantsAction = (message) =>
  /\b(add|create|register|update|change|edit|delete|remove|cancel|complete|convert|admit|give|grant|revoke|allow|deactivate|activate|make)\b/.test(normalize(message));

const findIdentifier = (message) => {
  const text = String(message || "");
  return {
    opd: text.match(/\bTKN-\d{8}-\d{5}\b/i)?.[0],
    caseId: text.match(/\bOPD-\d{8}-\d{5}\b/i)?.[0],
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
    uhidOrPhone: text.match(/\b\d{10,14}\b/)?.[0],
  };
};

const valueAfter = (message, labels) => {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const boundary = "(?=\\s+(?:name|patient name|member name|doctor name|phone|mobile|contact|email|gender|uhid|dob|date of birth|blood group|blood|address|allergies|allergy|remarks|remark|note|status|amount|charge|paid|payment|payment mode|diagnosis|complaint|chief complaint|advice|role)\\b|[,;]|$)";
  const match = String(message || "").match(new RegExp(`\\b(?:${escaped})\\s*[:=]?\\s*([^,;]+?)${boundary}`, "i"));
  return match ? compact(match[1]) : "";
};

const extractName = (message, entityLabel = "patient") => {
  const explicit = valueAfter(message, ["name", `${entityLabel} name`]);
  if (explicit) return explicit;
  const match = String(message || "").match(new RegExp(`\\b(?:add|create|register|update|delete|remove)\\s+(?:a\\s+)?${entityLabel}\\s+([a-z .]+?)(?:\\s+(?:phone|mobile|email|gender|uhid|dob|with|to|from|status|role)\\b|$)`, "i"));
  return match ? compact(match[1]) : "";
};

const extractPatientData = (message) => {
  const data = {};
  const entries = {
    name: extractName(message, "patient"),
    email: valueAfter(message, ["email"]),
    phone: valueAfter(message, ["phone", "mobile", "contact"]),
    gender: valueAfter(message, ["gender"]),
    dob: valueAfter(message, ["dob", "date of birth"]),
    bloodGroup: valueAfter(message, ["blood group", "blood"]),
    address: valueAfter(message, ["address"]),
    allergies: valueAfter(message, ["allergies", "allergy"]),
    remarks: valueAfter(message, ["remarks", "remark", "note"]),
    status: valueAfter(message, ["status"]),
  };
  Object.entries(entries).forEach(([key, value]) => {
    if (value) data[key] = value;
  });
  if (data.gender) data.gender = normalize(data.gender);
  if (data.bloodGroup) data.bloodGroup = data.bloodGroup.toUpperCase().replace(/\+/g, "_POS").replace(/-/g, "_NEG").replace(/\s+/g, "_");
  return data;
};

const findPatient = async (message) => {
  const { uhidOrPhone } = findIdentifier(message);
  const name = extractName(message, "patient") || valueAfter(message, ["patient"]);
  const where = [];
  if (uhidOrPhone) where.push({ uhid: uhidOrPhone }, { phone: uhidOrPhone });
  if (name) where.push({ name: { contains: name } });
  if (!where.length) return { type: "needs_clarification", message: "Please provide patient UHID, mobile number, or patient name." };

  const rows = await prisma.patient.findMany({ take: 5, where: { OR: where }, orderBy: { registeredAt: "desc" } });
  if (!rows.length) return { type: "not_found", message: "I could not find that patient." };
  if (rows.length > 1 && !uhidOrPhone) {
    return {
      type: "ambiguous",
      message: ["I found multiple matching patients. Please provide exact UHID or mobile number:", ...rows.map((row) => `- ${row.name} | UHID ${row.uhid} | ${clean(row.phone)}`)].join("\n"),
    };
  }
  return { type: "ready", record: rows[0] };
};

const findOpd = async (message) => {
  const { opd, caseId, uhidOrPhone } = findIdentifier(message);
  const patientName = extractName(message, "patient") || valueAfter(message, ["patient"]);
  const where = [];
  if (opd) where.push({ opdNo: opd });
  if (caseId) where.push({ caseId });
  if (uhidOrPhone) where.push({ patient: { uhid: uhidOrPhone } }, { patient: { phone: uhidOrPhone } });
  if (patientName) where.push({ patient: { name: { contains: patientName } } });
  if (!where.length) return { type: "needs_clarification", message: "Please provide OPD token, case ID, UHID, mobile number, or patient name." };

  const rows = await prisma.opdAppointment.findMany({
    take: 6,
    where: { OR: where },
    orderBy: { appointmentDate: "desc" },
    include: {
      patient: { select: { name: true, uhid: true, phone: true } },
      consultantDoctor: { select: { name: true } },
      department: { select: { name: true } },
    },
  });
  if (!rows.length) return { type: "not_found", message: "I could not find a matching OPD record." };
  if (rows.length > 1 && !opd && !caseId) {
    return {
      type: "ambiguous",
      message: ["I found multiple matching OPD records. Please provide the exact OPD token:", ...rows.map((row) => `- ${row.opdNo || row.caseId} | ${row.patient?.name || "-"} | UHID ${row.patient?.uhid || "-"} | ${new Date(row.appointmentDate).toLocaleDateString("en-IN")}`)].join("\n"),
    };
  }
  return { type: "ready", record: rows[0] };
};

const findUser = async (message) => {
  const { email } = findIdentifier(message);
  const name = extractName(message, "member") || extractName(message, "doctor") || valueAfter(message, ["member", "doctor", "user"]);
  const where = [];
  if (email) where.push({ email });
  if (name) where.push({ name: { contains: name } });
  if (!where.length) return { type: "needs_clarification", message: "Please provide member email or name." };

  const rows = await prisma.user.findMany({ take: 5, where: { OR: where }, orderBy: { name: "asc" } });
  if (!rows.length) return { type: "not_found", message: "I could not find that member." };
  if (rows.length > 1 && !email) {
    return {
      type: "ambiguous",
      message: ["I found multiple matching members. Please provide exact email:", ...rows.map((row) => `- ${row.name} | ${row.email} | ${row.role}`)].join("\n"),
    };
  }
  return { type: "ready", record: rows[0] };
};

const pending = (reply, action) => ({
  handled: true,
  reply,
  pendingAction: { ...action, label: action.label || reply },
});

const preparePatientAction = async (message, permissions) => {
  const text = normalize(message);
  const isCreate = /\b(add|create|register)\b/.test(text) && text.includes("patient");
  const isUpdate = /\b(update|change|edit)\b/.test(text) && text.includes("patient");
  const isDelete = /\b(delete|remove)\b/.test(text) && text.includes("patient");
  if (!isCreate && !isUpdate && !isDelete) return null;

  if (isCreate) {
    const denied = requirePermission(permissions, "patient", "create");
    if (denied) return { handled: true, reply: denied };
    const data = extractPatientData(message);
    if (!data.name) return { handled: true, reply: "Please provide the patient name to create a patient." };
    return pending(`Create patient ${data.name}${data.phone ? ` with mobile ${data.phone}` : ""}?`, {
      type: "CREATE_PATIENT",
      data,
      label: `Create patient ${data.name}`,
    });
  }

  const denied = requirePermission(permissions, "patient", isDelete ? "delete" : "update");
  if (denied) return { handled: true, reply: denied };
  const found = await findPatient(message);
  if (found.type !== "ready") return { handled: true, reply: found.message };

  if (isDelete) {
    return pending(`Delete patient ${found.record.name}, UHID ${found.record.uhid}?`, {
      type: "DELETE_PATIENT",
      patientId: found.record.id,
      label: `Delete patient ${found.record.name}`,
    });
  }

  const data = extractPatientData(message);
  delete data.name;
  if (!Object.keys(data).length) return { handled: true, reply: "Please tell me which patient field to update, such as phone, email, address, allergies, remarks, or status." };
  return pending(`Update patient ${found.record.name}, UHID ${found.record.uhid} with ${JSON.stringify(data)}?`, {
    type: "UPDATE_PATIENT",
    patientId: found.record.id,
    data,
    label: `Update patient ${found.record.name}`,
  });
};

const prepareOpdAction = async (message, permissions) => {
  const text = normalize(message);
  const create = /\b(add|create|register)\b/.test(text) && text.includes("opd");
  const convert = /\b(convert|admit|move)\b/.test(text) && text.includes("ipd");
  const cancel = text.includes("cancel") && text.includes("opd");
  const complete = text.includes("complete") && text.includes("opd");
  if (!create && !convert && !cancel && !complete) return null;

  if (create) {
    const denied = requirePermission(permissions, "opd", "create");
    if (denied) return { handled: true, reply: denied };
    const patient = await findPatient(message);
    if (patient.type !== "ready") return { handled: true, reply: patient.message };
    const amount = Number(valueAfter(message, ["amount", "charge", "paid"])) || 0;
    return pending(`Create OPD for ${patient.record.name}, UHID ${patient.record.uhid}${amount ? ` with amount ${amount}` : ""}?`, {
      type: "CREATE_OPD",
      data: {
        patientId: patient.record.id,
        appointmentDate: new Date().toISOString(),
        amount,
        paidAmount: amount,
        paymentMode: valueAfter(message, ["payment", "payment mode"]) || "cash",
        status: "registered",
      },
      label: `Create OPD for ${patient.record.name}`,
    });
  }

  const denied = convert
    ? requirePermission(permissions, "opd", "update") || ((hasPermission(permissions, "ipd", "create") || hasPermission(permissions, "ipd", "update")) ? null : "You do not have permission for ipd:create.")
    : requirePermission(permissions, "opd", "update");
  if (denied) return { handled: true, reply: denied };
  const opd = await findOpd(message);
  if (opd.type !== "ready") return { handled: true, reply: opd.message };

  const status = convert ? "admitted" : cancel ? "cancelled" : "completed";
  if (opd.record.status === status) return { handled: true, reply: `This OPD is already ${status}.` };
  const phrase = convert ? "convert this OPD visit to IPD" : `${status} this OPD visit`;
  return pending(`I found ${opd.record.patient?.name || "the patient"}, OPD ${opd.record.opdNo || opd.record.caseId}. Do you want me to ${phrase}?`, {
    type: "UPDATE_OPD_STATUS",
    opdAppointmentId: opd.record.id,
    status,
    label: `${phrase}: ${opd.record.opdNo || opd.record.caseId}`,
  });
};

const preparePrescriptionAction = async (message, permissions) => {
  const text = normalize(message);
  if (!(/\b(add|create|make|update|edit)\b/.test(text) && text.includes("prescription"))) return null;
  const denied = requirePermission(permissions, "prescription", text.includes("update") || text.includes("edit") ? "update" : "create");
  if (denied) return { handled: true, reply: denied };
  const opd = await findOpd(message);
  if (opd.type !== "ready") return { handled: true, reply: opd.message };

  const data = {
    opdAppointmentId: opd.record.id,
    diagnosis: valueAfter(message, ["diagnosis"]),
    chiefComplaint: valueAfter(message, ["complaint", "chief complaint"]),
    advice: valueAfter(message, ["advice"]),
    status: valueAfter(message, ["status"]) || "draft",
  };
  Object.keys(data).forEach((key) => data[key] || delete data[key]);
  if (Object.keys(data).length <= 1) return { handled: true, reply: "Please provide prescription details like diagnosis, complaint, or advice." };
  return pending(`Create/update prescription for ${opd.record.patient?.name || "patient"} OPD ${opd.record.opdNo || opd.record.caseId}?`, {
    type: "UPSERT_PRESCRIPTION",
    data,
    label: `Create/update prescription ${opd.record.opdNo || opd.record.caseId}`,
  });
};

const prepareMemberAction = async (message, permissions) => {
  const text = normalize(message);
  const create = /\b(add|create|register)\b/.test(text) && /\b(member|doctor|user|staff)\b/.test(text);
  const update = /\b(update|change|edit|activate|deactivate)\b/.test(text) && /\b(member|doctor|user|staff)\b/.test(text);
  const remove = /\b(delete|remove)\b/.test(text) && /\b(member|doctor|user|staff)\b/.test(text);
  if (!create && !update && !remove) return null;

  if (create) {
    const denied = requirePermission(permissions, "user", "create");
    if (denied) return { handled: true, reply: denied };
    const name = extractName(message, text.includes("doctor") ? "doctor" : "member");
    const email = findIdentifier(message).email;
    if (!name || !email) return { handled: true, reply: "Please provide member name and email." };
    const role = text.includes("doctor") ? "DOCTOR" : (valueAfter(message, ["role"]) || "STAFF").toUpperCase().replace(/\s+/g, "_");
    return pending(`Create ${role} member ${name} with email ${email}?`, {
      type: "CREATE_MEMBER",
      data: {
        name,
        email,
        phone: valueAfter(message, ["phone", "mobile"]) || null,
        role,
        roleId: role === "DOCTOR" ? 2 : 1,
      },
      label: `Create member ${name}`,
    });
  }

  const denied = requirePermission(permissions, "user", remove ? "delete" : "update");
  if (denied) return { handled: true, reply: denied };
  const member = await findUser(message);
  if (member.type !== "ready") return { handled: true, reply: member.message };
  if (remove) {
    return pending(`Delete member ${member.record.name} (${member.record.email})?`, {
      type: "DELETE_MEMBER",
      userId: member.record.id,
      label: `Delete member ${member.record.name}`,
    });
  }

  const data = {};
  const phone = valueAfter(message, ["phone", "mobile"]);
  const role = valueAfter(message, ["role"]);
  if (phone) data.phone = phone;
  if (role) data.role = role.toUpperCase().replace(/\s+/g, "_");
  if (text.includes("deactivate")) data.isActive = false;
  if (text.includes("activate")) data.isActive = true;
  if (!Object.keys(data).length) return { handled: true, reply: "Please tell me what to update for this member, such as phone, role, activate, or deactivate." };
  return pending(`Update member ${member.record.name} (${member.record.email}) with ${JSON.stringify(data)}?`, {
    type: "UPDATE_MEMBER",
    userId: member.record.id,
    data,
    label: `Update member ${member.record.name}`,
  });
};

const extractPermissionChanges = (message) => {
  const text = normalize(message);
  const resources = [...PERMISSION_RESOURCES].filter((resource) => text.includes(resource.replace("_", " ")) || text.includes(resource));
  const actions = [...PERMISSION_ACTIONS].filter((action) => text.includes(action));
  return { resources, actions: actions.length ? actions : ["read"] };
};

const preparePermissionAction = async (message, permissions) => {
  const text = normalize(message);
  const grant = /\b(give|grant|allow|add)\b/.test(text) && text.includes("permission");
  const revoke = /\b(remove|revoke|deny)\b/.test(text) && text.includes("permission");
  if (!grant && !revoke) return null;
  const denied = requirePermission(permissions, "permission", "update");
  if (denied) return { handled: true, reply: denied };
  const member = await findUser(message);
  if (member.type !== "ready") return { handled: true, reply: member.message };
  const changes = extractPermissionChanges(message);
  if (!changes.resources.length) return { handled: true, reply: "Please mention which section permission to change, such as patient, OPD, billing, prescription, user, or IPD." };

  const permissionRows = changes.resources.flatMap((resource) => changes.actions.map((action) => ({ resource, action })));
  return pending(`${grant ? "Grant" : "Remove"} ${permissionRows.map((p) => `${p.resource}:${p.action}`).join(", ")} for ${member.record.name}?`, {
    type: grant ? "GRANT_PERMISSIONS" : "REVOKE_PERMISSIONS",
    userId: member.record.id,
    permissions: permissionRows,
    label: `${grant ? "Grant" : "Remove"} permissions for ${member.record.name}`,
  });
};

export const detectPendingAction = async ({ user, message }) => {
  if (!wantsAction(message)) return null;
  const permissions = await getEffectivePermissionsForUser(user);
  const preparers = [preparePermissionAction, prepareOpdAction, preparePrescriptionAction, preparePatientAction, prepareMemberAction];
  for (const prepare of preparers) {
    const result = await prepare(message, permissions);
    if (result) return result;
  }
  return {
    handled: true,
    reply: "I can help with website operations like patients, OPD, IPD conversion, prescriptions, members, and permissions. Please include the exact record details and action.",
  };
};

const executeAction = async (pendingAction) => {
  switch (pendingAction.type) {
    case "CREATE_PATIENT":
      return createPatientWithRetry(pendingAction.data);
    case "UPDATE_PATIENT":
      return prisma.patient.update({ where: { id: pendingAction.patientId }, data: pendingAction.data });
    case "DELETE_PATIENT":
      return prisma.patient.delete({ where: { id: pendingAction.patientId } });
    case "CREATE_OPD":
      return prisma.opdAppointment.create({
        data: {
          ...pendingAction.data,
          ...(await generateOpdIdentifiers(pendingAction.data.appointmentDate)),
        },
        include: { patient: true },
      });
    case "UPDATE_OPD_STATUS":
      return prisma.opdAppointment.update({
        where: { id: pendingAction.opdAppointmentId },
        data: { status: pendingAction.status },
        include: { patient: { select: { name: true, uhid: true } } },
      });
    case "UPSERT_PRESCRIPTION":
      return prisma.prescription.upsert({
        where: { opdAppointmentId: pendingAction.data.opdAppointmentId },
        update: pendingAction.data,
        create: pendingAction.data,
      });
    case "CREATE_MEMBER":
      return prisma.user.create({ data: { ...pendingAction.data, password: await bcrypt.hash("changeme123", 10) } });
    case "UPDATE_MEMBER":
      return prisma.user.update({ where: { id: pendingAction.userId }, data: pendingAction.data });
    case "DELETE_MEMBER":
      return prisma.user.delete({ where: { id: pendingAction.userId } });
    case "GRANT_PERMISSIONS": {
      const current = await getUserPermissions(pendingAction.userId);
      const merged = Array.from(new Map([...current, ...pendingAction.permissions].map((permission) => [`${permission.resource}:${permission.action}`, permission])).values());
      return replaceUserPermissions(pendingAction.userId, merged);
    }
    case "REVOKE_PERMISSIONS": {
      const remove = new Set(pendingAction.permissions.map((permission) => `${permission.resource}:${permission.action}`));
      const current = await getUserPermissions(pendingAction.userId);
      return replaceUserPermissions(pendingAction.userId, current.filter((permission) => !remove.has(`${permission.resource}:${permission.action}`)));
    }
    default:
      throw new Error("Unsupported chatbot action.");
  }
};

const permissionForPending = (pendingAction) => {
  switch (pendingAction?.type) {
    case "CREATE_PATIENT": return [["patient", "create"]];
    case "UPDATE_PATIENT": return [["patient", "update"]];
    case "DELETE_PATIENT": return [["patient", "delete"]];
    case "CREATE_OPD": return [["opd", "create"]];
    case "UPDATE_OPD_STATUS": return pendingAction.status === "admitted" ? [["opd", "update"], ["ipd", "create"]] : [["opd", "update"]];
    case "UPSERT_PRESCRIPTION": return [["prescription", "create"]];
    case "CREATE_MEMBER": return [["user", "create"]];
    case "UPDATE_MEMBER": return [["user", "update"]];
    case "DELETE_MEMBER": return [["user", "delete"]];
    case "GRANT_PERMISSIONS":
    case "REVOKE_PERMISSIONS": return [["permission", "update"]];
    default: return [];
  }
};

export const executePendingAction = async ({ user, message, pendingAction }) => {
  if (isCancellation(message)) return { handled: true, reply: "Okay, I cancelled that action.", clearPendingAction: true };
  if (!isConfirmation(message)) return { handled: true, reply: "Please reply yes to confirm this action, or no to cancel it.", pendingAction };

  const permissions = await getEffectivePermissionsForUser(user);
  const missing = permissionForPending(pendingAction).find(([resource, action]) => !hasPermission(permissions, resource, action));
  if (missing) {
    return { handled: true, reply: `You do not have permission for ${missing[0]}:${missing[1]}.`, clearPendingAction: true };
  }

  try {
    const result = await executeAction(pendingAction);
    const detail = result?.patient?.name || result?.name || result?.opdNo || result?.email || "";
    return {
      handled: true,
      reply: `Done. ${pendingAction.label || "The requested action"} completed${detail ? ` for ${detail}` : ""}.`,
      clearPendingAction: true,
    };
  } catch (error) {
    return {
      handled: true,
      reply: `I could not complete that action: ${error?.message || "unknown error"}`,
      clearPendingAction: true,
    };
  }
};
