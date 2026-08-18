const ACTION_KEYWORDS = [
  { action: 'delete', words: ['delete', 'remove', 'trash'] },
  { action: 'update', words: ['edit', 'update', 'save changes', 'mark done', 'complete', 'switch to edit'] },
  { action: 'create', words: ['add', 'create', 'new', 'save', 'submit', 'generate', 'book', 'issue', 'admit', 'pay', 'import', 'upload', 'confirm', 'schedule', 'assign', 'restock', 'sell', 'purchase', 'payment'] },
  { action: 'approve', words: ['approve'] },
  { action: 'export', words: ['export', 'download'] },
  { action: 'read', words: ['view', 'print', 'preview'] },
];

const PATH_RESOURCE_RULES = [
  { includes: ['ipd', 'discharged'], resource: 'ipd_discharge' },
  { includes: ['ipd', 'billing'], resource: 'ipd_billing' },
  { includes: ['ipd', 'bed-transfer'], resource: 'ipd_bed_transfer' },
  { includes: ['ipd'], resource: 'ipd_admission' },
  { includes: ['pathology', 'generate-bill'], resource: 'pathology_invoice' },
  { includes: ['pathology', 'bill'], resource: 'pathology_invoice' },
  { includes: ['pathology', 'invoice'], resource: 'pathology_invoice' },
  { includes: ['pathology', 'payment'], resource: 'pathology_payment' },
  { includes: ['pathology', 'add-test'], resource: 'pathology_master' },
  { includes: ['pathology', 'pathology-test'], resource: 'pathology_master' },
  { includes: ['pathology', 'subcategory'], resource: 'pathology_subcategory' },
  { includes: ['pathology', 'charge-category'], resource: 'pathology_charge_category' },
  { includes: ['pathology', 'charge-name'], resource: 'pathology_charge_name' },
  { includes: ['pathology', 'category'], resource: 'pathology_category' },
  { includes: ['pathology'], resource: 'pathology_order' },
  { includes: ['radiology', 'generate-bill'], resource: 'radiology_invoice' },
  { includes: ['radiology', 'bill'], resource: 'radiology_invoice' },
  { includes: ['radiology', 'invoice'], resource: 'radiology_invoice' },
  { includes: ['radiology', 'payment'], resource: 'radiology_payment' },
  { includes: ['radiology', 'add-test'], resource: 'radiology_master' },
  { includes: ['radiology', 'test-parameters'], resource: 'radiology_test_parameter' },
  { includes: ['radiology', 'charge-category'], resource: 'radiology_charge_category' },
  { includes: ['radiology', 'charge-name'], resource: 'radiology_charge_name' },
  { includes: ['radiology', 'category'], resource: 'radiology_category' },
  { includes: ['radiology', 'orders'], resource: 'radiology_order' },
  { includes: ['radiology'], resource: 'radiology_order' },
  { includes: ['appointment-bill'], resource: 'appointment_billing' },
  { includes: ['appointments'], resource: 'appointment' },
  { includes: ['pharma', 'sales-returns'], resource: 'sales_return' },
  { includes: ['pharma', 'purchase-returns'], resource: 'purchase_return' },
  { includes: ['pharma', 'sell'], resource: 'sell_medicine' },
  { includes: ['pharma', 'sales'], resource: 'sell_medicine' },
  { includes: ['pharma', 'purchase'], resource: 'purchase_medicine' },
  { includes: ['pharma', 'item-category'], resource: 'medicine_category' },
  { includes: ['pharma', 'itemsubcategory'], resource: 'medicine_subcategory' },
  { includes: ['pharma', 'self-master'], resource: 'medicine_self' },
  { includes: ['pharma', 'supplier'], resource: 'supplier' },
  { includes: ['pharma', 'expiry'], resource: 'expiry' },
  { includes: ['pharma', 'stock-ledger'], resource: 'stock_ledger' },
  { includes: ['pharma', 'reports'], resource: 'pharmacy_report' },
  { includes: ['pharma', 'item-master'], resource: 'medicine' },
  { includes: ['pharma'], resource: 'medicine' },
  { includes: ['pharmacy'], resource: 'medicine' },
  { includes: ['stocks'], resource: 'stock' },
  { includes: ['stock'], resource: 'stock' },
];

const PATH_RESOURCE_MAP = [
  { segment: 'patients', resource: 'patient' },
  { segment: 'appointments', resource: 'appointment' },
  { segment: 'opd', resource: 'opd' },
  { segment: 'ipd', resource: 'ipd_admission' },
  { segment: 'emergency', resource: 'emergency' },
  { segment: 'pharma', resource: 'medicine' },
  { segment: 'pharmacy', resource: 'medicine' },
  { segment: 'item-category', resource: 'medicine_category' },
  { segment: 'itemsubcategory', resource: 'medicine_subcategory' },
  { segment: 'self-master', resource: 'medicine_self' },
  { segment: 'supplier', resource: 'supplier' },
  { segment: 'expiry', resource: 'expiry' },
  { segment: 'stock-ledger', resource: 'stock_ledger' },
  { segment: 'stocks', resource: 'stock' },
  { segment: 'stock', resource: 'stock' },
  { segment: 'pathology', resource: 'pathology_order' },
  { segment: 'radiology', resource: 'radiology_order' },
  { segment: 'doctors', resource: 'doctor' },
  { segment: 'doctor', resource: 'doctor' },
  { segment: 'hospitals', resource: 'hospital' },
  { segment: 'hospital', resource: 'hospital' },
  { segment: 'roles', resource: 'role' },
  { segment: 'permissions', resource: 'permission' },
  { segment: 'settings', resource: 'settings' },
  { segment: 'reports', resource: 'report' },
  { segment: 'blood-bank', resource: 'bloodBank' },
  { segment: 'ot', resource: 'ot' },
  { segment: 'billing', resource: 'billing' },
  { segment: 'ambulance', resource: 'ambulance' },
  { segment: 'wards-beds', resource: 'ward' },
  { segment: 'ward', resource: 'ward' },
  { segment: 'room', resource: 'room' },
  { segment: 'bed', resource: 'bed' },
  { segment: 'departments', resource: 'department' },
  { segment: 'staff', resource: 'staff' },
  { segment: 'inventory', resource: 'inventory' },
];

export const extractNodeText = (node) => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join(' ');
  if (node?.props?.children) return extractNodeText(node.props.children);
  return '';
};

export const inferActionFromLabel = (label) => {
  const normalized = String(label || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const match = ACTION_KEYWORDS.find(({ words }) =>
    words.some((word) => normalized.includes(word)),
  );

  return match?.action || null;
};

export const inferResourceFromPath = (pathname = '') => {
  const segments = pathname.split('/').filter(Boolean);
  const rule = PATH_RESOURCE_RULES.find(({ includes }) =>
    includes.every((segment) => segments.includes(segment)),
  );
  if (rule) return rule.resource;

  const match = PATH_RESOURCE_MAP.find(({ segment }) => segments.includes(segment));
  return match?.resource || null;
};

export const resolveActionPermission = ({
  pathname,
  label,
  resource,
  action,
}) => {
  const resolvedAction = action || inferActionFromLabel(label);
  if (!resolvedAction) return null;

  return {
    resource: resource || inferResourceFromPath(pathname),
    action: resolvedAction,
  };
};
