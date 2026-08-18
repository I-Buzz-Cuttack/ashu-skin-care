// src/utils/validation.utils.js

/**
 * Collection of common form validators.
 * Each returns a string error message or undefined if valid.
 *
 * Usage with native state:
 *   const error = validateEmail(form.email);
 *   if (error) { setErrors(e => ({ ...e, email: error })); return; }
 */

export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
};

export const validatePhone = (value) => {
  if (!value) return 'Phone number is required';
  if (!/^\d{10}$/.test(String(value).replace(/\D/g, ''))) return 'Enter a valid 10-digit phone number';
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
};

export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
};

export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) return `${fieldName} must not exceed ${max} characters`;
};

export const validateAadhaar = (value) => {
  if (!value) return 'Aadhaar number is required';
  if (!/^\d{12}$/.test(String(value).replace(/\s/g, ''))) return 'Enter a valid 12-digit Aadhaar number';
};

export const validatePincode = (value) => {
  if (!value) return 'Pincode is required';
  if (!/^\d{6}$/.test(String(value))) return 'Enter a valid 6-digit pincode';
};

/**
 * Validates an entire form object against a rules map.
 * Returns: { isValid: boolean, errors: { [field]: string } }
 *
 * Usage:
 *   const rules = {
 *     email:    (v) => validateEmail(v),
 *     password: (v) => validatePassword(v),
 *   };
 *   const { isValid, errors } = validateForm(formData, rules);
 */
export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) errors[field] = error;
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
