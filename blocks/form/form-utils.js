/**
 * Pure helper utilities for EDS Spreadsheet-Driven Form block.
 * Separated from DOM logic for deterministic Node unit testing.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(row, key) {
  const lower = key.toLowerCase();
  const match = Object.keys(row).find((k) => k.toLowerCase() === lower);
  return match ? row[match] : '';
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  const str = String(value || '').trim().toLowerCase();
  return str === 'true' || str === 'yes' || str === 'x' || str === '1';
}

export function normalizeFormFields(payload) {
  if (!payload || !Array.isArray(payload.data)) return [];
  return payload.data
    .filter((row) => row && typeof row === 'object' && readField(row, 'Name'))
    .map((row) => ({
      name: String(readField(row, 'Name')).trim(),
      type: String(readField(row, 'Type') || 'text').trim().toLowerCase(),
      label: String(readField(row, 'Label') || readField(row, 'Name')).trim(),
      placeholder: String(readField(row, 'Placeholder') || '').trim(),
      mandatory: toBool(readField(row, 'Mandatory')),
      options: String(readField(row, 'Options') || '')
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean),
    }));
}

export function validateSubmission(fields, values) {
  const errors = {};
  if (!Array.isArray(fields)) return { valid: false, errors: { _form: 'Invalid form definition' } };

  fields.forEach((field) => {
    if (field.type === 'submit' || field.type === 'heading') return;
    const raw = values ? values[field.name] : undefined;

    if (field.type === 'checkbox') {
      if (field.mandatory && raw !== true) {
        errors[field.name] = 'Please check this required confirmation.';
      }
      return;
    }

    const strVal = String(raw || '').trim();
    if (field.mandatory && !strVal) {
      errors[field.name] = `${field.label} is required.`;
      return;
    }
    if (field.type === 'email' && strVal && !EMAIL_PATTERN.test(strVal)) {
      errors[field.name] = 'Please enter a valid email address.';
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildSubmissionPayload(fields, values) {
  const data = {};
  (fields || []).forEach((field) => {
    if (field.type === 'submit' || field.type === 'heading') return;
    const raw = values ? values[field.name] : '';
    data[field.name] = field.type === 'checkbox'
      ? Boolean(raw)
      : String(raw || '').trim();
  });
  return { data };
}
