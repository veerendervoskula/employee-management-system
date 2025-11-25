// Client-side validation descriptors and helpers.
// This intentionally avoids importing the 'joi' package so the React
// bundler won't attempt to parse node-only artifacts in node_modules.

function _msgStringBase(label) {
  return `${label} must be a string`;
}
function _msgStringEmpty(label) {
  return `${label} is required`;
}
function _msgStringMin(label, limit) {
  return `${label} must be at least ${limit} characters`;
}
function _msgStringMax(label, limit) {
  return `${label} must be at most ${limit} characters`;
}
function _msgRequired(label) {
  return `${label} is required`;
}
function _msgBoolean(label) {
  return `${label} must be true or false`;
}

function validateField(name, value, schema) {
  const def = schema && schema[name];
  if (!def) return null;
  const label = def.label || name;

  if (def.type === 'string') {
    if (def.required && (value === undefined || value === null || value === '')) {
      return _msgStringEmpty(label);
    }
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') return _msgStringBase(label);
    if (def.min && value.length < def.min) return _msgStringMin(label, def.min);
    if (def.max && value.length > def.max) return _msgStringMax(label, def.max);
    return null;
  }

  if (def.type === 'number') {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'number') return `${label} must be a number`;
    return null;
  }

  if (def.type === 'boolean') {
    if (def.required && (value === undefined || value === null)) return _msgRequired(label);
    if (value === undefined || value === null) return null;
    if (typeof value !== 'boolean') return _msgBoolean(label);
    return null;
  }

  return null;
}

function validateData(data, schema) {
  const errors = {};
  let hasErrors = false;

  for (const key of Object.keys(schema)) {
    const err = validateField(key, data[key], schema);
    if (err) {
      errors[key] = err;
      hasErrors = true;
    }
  }

  return hasErrors ? errors : null;
}

module.exports = {
  validateData,
  validateField
};
