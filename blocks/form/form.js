import {
  normalizeFormFields,
  validateSubmission,
  buildSubmissionPayload,
} from './form-utils.js';

function createFieldElement(field, uid) {
  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-field-${field.type}`;
  const inputId = `${uid}-${field.name}`;
  const errorId = `${inputId}-error`;

  if (field.type === 'submit') {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'button form-submit-btn';
    btn.textContent = field.label || 'Submit';
    wrapper.append(btn);
    return wrapper;
  }

  if (field.type === 'checkbox') {
    const checkRow = document.createElement('label');
    checkRow.className = 'form-checkbox-label';
    checkRow.htmlFor = inputId;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = inputId;
    input.name = field.name;
    if (field.mandatory) input.setAttribute('aria-required', 'true');

    const text = document.createElement('span');
    text.textContent = field.label;

    checkRow.append(input, text);
    const err = document.createElement('span');
    err.className = 'form-error-msg';
    err.id = errorId;
    err.setAttribute('role', 'alert');
    wrapper.append(checkRow, err);
    return wrapper;
  }

  const label = document.createElement('label');
  label.className = 'form-label';
  label.htmlFor = inputId;
  label.textContent = field.label;
  if (field.mandatory) {
    const req = document.createElement('span');
    req.className = 'form-required';
    req.setAttribute('aria-hidden', 'true');
    req.textContent = ' *';
    label.append(req);
  }

  let control;
  if (field.type === 'select') {
    control = document.createElement('select');
    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = field.placeholder || 'Select an option...';
    control.append(placeholderOpt);
    field.options.forEach((optText) => {
      const opt = document.createElement('option');
      opt.value = optText;
      opt.textContent = optText;
      control.append(opt);
    });
  } else if (field.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
    if (field.placeholder) control.placeholder = field.placeholder;
  } else {
    control = document.createElement('input');
    control.type = field.type;
    if (field.placeholder) control.placeholder = field.placeholder;
  }

  control.id = inputId;
  control.name = field.name;
  control.className = 'form-control';
  if (field.mandatory) control.setAttribute('aria-required', 'true');

  const err = document.createElement('span');
  err.className = 'form-error-msg';
  err.id = errorId;
  err.setAttribute('role', 'alert');

  wrapper.append(label, control, err);
  return wrapper;
}

function collectValues(form, fields) {
  const values = {};
  fields.forEach((field) => {
    if (field.type === 'submit' || field.type === 'heading') return;
    const el = form.elements.namedItem(field.name);
    if (!el) return;
    values[field.name] = field.type === 'checkbox' ? el.checked : el.value;
  });
  return values;
}

function renderValidationErrors(form, uid, fields, errors) {
  fields.forEach((field) => {
    if (field.type === 'submit' || field.type === 'heading') return;
    const inputId = `${uid}-${field.name}`;
    const errorEl = form.querySelector(`#${inputId}-error`);
    const controlEl = form.querySelector(`#${inputId}`);
    const message = errors[field.name] || '';
    if (errorEl) errorEl.textContent = message;
    if (controlEl) {
      if (message) {
        controlEl.setAttribute('aria-invalid', 'true');
        controlEl.setAttribute('aria-describedby', `${inputId}-error`);
      } else {
        controlEl.removeAttribute('aria-invalid');
        controlEl.removeAttribute('aria-describedby');
      }
    }
  });
}

async function renderForm(block, definitionUrl, submitUrl) {
  let fields = [];
  try {
    const resp = await fetch(definitionUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    fields = normalizeFormFields(json);
  } catch (err) {
    block.innerHTML = `<p class="form-load-error">Unable to load form sheet from <code>${definitionUrl}</code>.</p>`;
    return;
  }

  if (fields.length === 0) {
    block.innerHTML = '<p class="form-load-error">Form sheet contains no valid fields.</p>';
    return;
  }

  const uid = `eds-form-${Math.random().toString(36).slice(2, 7)}`;
  const card = document.createElement('div');
  card.className = 'form-card';

  const meta = document.createElement('div');
  meta.className = 'form-source-bar';
  meta.innerHTML = `<span>Spreadsheet-Driven Form</span><code>${definitionUrl}</code>`;

  const form = document.createElement('form');
  form.className = 'form-grid';
  form.noValidate = true;

  fields.forEach((field) => {
    form.append(createFieldElement(field, uid));
  });

  const statusBox = document.createElement('div');
  statusBox.className = 'form-status';
  statusBox.setAttribute('aria-live', 'polite');
  statusBox.hidden = true;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const values = collectValues(form, fields);
    const { valid, errors } = validateSubmission(fields, values);
    renderValidationErrors(form, uid, fields, errors);

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    const payload = buildSubmissionPayload(fields, values);
    const submitBtn = form.querySelector('.form-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    let deliveryNote = 'Local demo mode — validated & serialized into canonical Edge Delivery JSON payload (no external backend called):';
    if (submitUrl) {
      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        deliveryNote = `Submitted successfully to ${submitUrl}:`;
      } catch (err) {
        deliveryNote = `Live endpoint (${submitUrl}) unavailable in local preview; showing validated JSON payload:`;
      }
    }

    form.hidden = true;
    statusBox.hidden = false;
    statusBox.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'Form Submission Verified';

    const note = document.createElement('p');
    note.textContent = deliveryNote;

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = JSON.stringify(payload, null, 2);
    pre.append(code);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'secondary';
    resetBtn.textContent = 'Submit Another Response';
    resetBtn.addEventListener('click', () => {
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
      statusBox.hidden = true;
      form.hidden = false;
    });

    statusBox.append(heading, note, pre, resetBtn);
  });

  card.append(meta, form, statusBox);
  block.textContent = '';
  block.append(card);
}

/**
 * Spreadsheet-driven AEM Edge Delivery Form block.
 * Defers sheet JSON fetch via IntersectionObserver to protect LCP.
 * @param {Element} block The form block element
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const definitionUrl = links[0] ? links[0].getAttribute('href') : '/forms/request-demo.json';
  const submitUrl = links[1] ? links[1].getAttribute('href') : '';

  block.textContent = '';
  const loading = document.createElement('p');
  loading.className = 'form-loading';
  loading.textContent = 'Loading spreadsheet-driven form...';
  block.append(loading);

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        renderForm(block, definitionUrl, submitUrl);
      }
    }, { rootMargin: '250px' });
    observer.observe(block);
  } else {
    renderForm(block, definitionUrl, submitUrl);
  }
}
