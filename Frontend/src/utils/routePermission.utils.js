import { matchPath } from "react-router-dom";
import { ROUTES } from "@constants/routes";

const permission = (path, resource, action = "read") => ({
  path,
  resource,
  action,
});

export const ROUTE_PERMISSIONS = [
  permission(ROUTES.SUPER_ADMIN.PATIENTS, "patient"),
  permission(ROUTES.SUPER_ADMIN.PATIENT_CREATE, "patient", "create"),
  permission(ROUTES.SUPER_ADMIN.PATIENT_VIEW, "patient"),
  permission(ROUTES.SUPER_ADMIN.PATIENT_EDIT, "patient", "update"),

  permission(ROUTES.SUPER_ADMIN.APPOINTMENTS, "appointment"),
  permission(ROUTES.SUPER_ADMIN.BOOK_APPOINTMENT, "appointment", "create"),
  permission(ROUTES.SUPER_ADMIN.DOCTOR_WISE, "appointment"),
  permission(ROUTES.SUPER_ADMIN.QUEUE, "appointment"),

  permission(ROUTES.SUPER_ADMIN.OPD, "opd"),
  permission(ROUTES.SUPER_ADMIN.OPD_ADD, "opd", "create"),
  permission(ROUTES.SUPER_ADMIN.ADD_PRESCRIPTION, "prescription", "create"),
  permission(ROUTES.SUPER_ADMIN.ADMIT, "ipd_admission", "create"),

  permission(ROUTES.SUPER_ADMIN.IPD, "ipd_admission"),
  permission(ROUTES.SUPER_ADMIN.IPD_PATIENTS, "ipd_admission"),
  permission(ROUTES.SUPER_ADMIN.ADD_IPD, "ipd_admission", "create"),
  permission(ROUTES.SUPER_ADMIN.VIEW_IPD, "ipd_admission"),
  permission(ROUTES.SUPER_ADMIN.ADMITTED_PATIENTS, "ipd_admission"),
  permission(ROUTES.SUPER_ADMIN.DISCHARGED_PATIENTS, "ipd_discharge"),
  permission(ROUTES.SUPER_ADMIN.WARD, "ward"),
  permission(ROUTES.SUPER_ADMIN.ROOM, "room"),
  permission(ROUTES.SUPER_ADMIN.BED, "bed"),
  permission(ROUTES.SUPER_ADMIN.BED_STATUS, "bed"),

    // ── IPD Staff ──
  permission(ROUTES.IPD_STAFF.IPD,                 "ipd_admission"),
  permission(ROUTES.IPD_STAFF.ADMITTED_PATIENTS,   "ipd_admission"),
  permission(ROUTES.IPD_STAFF.DISCHARGED_PATIENTS, "ipd_discharge"),
  permission(ROUTES.IPD_STAFF.WARD,                "ward"),
  permission(ROUTES.IPD_STAFF.ROOM,                "room"),
  permission(ROUTES.IPD_STAFF.BED,                 "bed"),
  permission(ROUTES.IPD_STAFF.BED_STATUS,          "bed"),

  permission(ROUTES.SUPER_ADMIN.PHARMA, "pharmacy_overview"),
  permission(ROUTES.SUPER_ADMIN.ADD_MEDICINES, "medicine"),
  permission(ROUTES.SUPER_ADMIN.IMPORT_MEDICINES_PAGE, "medicine", "create"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_PRESCRIPTION, "prescription"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_SELL, "sell_medicine"),
  permission(ROUTES.SUPER_ADMIN.PHARMA_GENERATE_BILL_PAGE, "sell_medicine", "create"),
  permission(ROUTES.SUPER_ADMIN.PURCHASE_PAGE, "purchase_medicine"),
  permission(ROUTES.SUPER_ADMIN.PURCHASE_NEW_PAGE, "purchase_medicine", "create"),
  permission(ROUTES.SUPER_ADMIN.PURCHASE_EDIT_PAGE, "purchase_medicine", "create"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_SALES, "sell_medicine"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_PURCHASES, "purchase_medicine"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_PURCHASE_RETURNS, "purchase_return"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_SALES_RETURNS, "sales_return"),
  permission(ROUTES.SUPER_ADMIN.ITEM_MASTER, "medicine"),
  permission(ROUTES.SUPER_ADMIN.ITEM_CATEGORY, "medicine_category"),
  permission(ROUTES.SUPER_ADMIN.ITEM_SUBCATEGORY, "medicine_subcategory"),
  permission(ROUTES.SUPER_ADMIN.SELF_MASTER, "medicine_self"),
  permission(ROUTES.SUPER_ADMIN.SUPPLIER, "supplier"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_EXPIRY, "expiry"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_STOCK_LEDGER, "stock_ledger"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_REPORTS, "pharmacy_report"),
  permission(ROUTES.SUPER_ADMIN.PHARMACY_BILL_PAGE, "sell_medicine"),

  permission(ROUTES.SUPER_ADMIN.PATHOLOGY, "pathology_overview"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_ORDERS, "pathology_order"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_PRESCRIPTION, "pathology_order"),
  permission(ROUTES.SUPER_ADMIN.ADD_PATHOLOGY_TEST, "pathology_master"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_CATEGORY, "pathology_category"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_SUBCATEGORY, "pathology_subcategory"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_CHARGE_CATEGORY, "pathology_charge_category"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_CHARGE_NAME, "pathology_charge_name"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_GENERATE_BILL_PAGE, "pathology_invoice", "create"),
  permission(ROUTES.SUPER_ADMIN.PATHOLOGY_BILL_PAGE, "pathology_invoice"),

  permission(ROUTES.SUPER_ADMIN.RADIOLOGY, "radiology_overview"),
  permission(ROUTES.SUPER_ADMIN.ORDERS, "radiology_order"),
  permission(ROUTES.SUPER_ADMIN.RADIOLOGY_PRESCRIPTION, "radiology_order"),
  permission(ROUTES.SUPER_ADMIN.ADD_RADIOLOGY_TEST, "radiology_master"),
  permission(ROUTES.SUPER_ADMIN.CATEGORY, "radiology_category"),
  permission(ROUTES.SUPER_ADMIN.CHARGE_CATEGORY, "radiology_charge_category"),
  permission(ROUTES.SUPER_ADMIN.CHARGE_NAME, "radiology_charge_name"),
  permission(ROUTES.SUPER_ADMIN.TEST_PARAMETERS, "radiology_test_parameter"),
  permission(ROUTES.SUPER_ADMIN.RADIOLOGY_INVOICE, "radiology_invoice"),
  permission(ROUTES.SUPER_ADMIN.RADIOLOGY_GENERATE_BILL_PAGE, "radiology_invoice", "create"),
  permission(ROUTES.SUPER_ADMIN.RADIOLOGY_BILL_PAGE, "radiology_invoice"),

  permission(ROUTES.SUPER_ADMIN.HOSPITALS, "hospital"),
  permission(ROUTES.SUPER_ADMIN.HOSPITAL, "hospital"),
  permission(ROUTES.SUPER_ADMIN.DEPARTMENTS, "department"),
  permission(ROUTES.SUPER_ADMIN.USER_MANAGEMENT, "user"),
  permission(ROUTES.SUPER_ADMIN.ROLES, "role"),
  permission(ROUTES.SUPER_ADMIN.PERMISSIONS, "permission"),
  permission(ROUTES.SUPER_ADMIN.APPOINTMENT_BILL_PAGE, "appointment_billing"),
];

export const getRoutePermission = (pathname) =>
  ROUTE_PERMISSIONS.find(({ path }) =>
    // matchPath({ path, end: true }, pathname),
   path && matchPath({ path, end: true }, pathname),
  );
