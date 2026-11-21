import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeFormFields,
  validateSubmission,
  buildSubmissionPayload,
} from '../blocks/form/form-utils.js';

const SAMPLE_FORM_SHEET = {
  total: 4,
  offset: 0,
  limit: 4,
  data: [
    {
      Name: 'fullName',
      Type: 'text',
      Label: 'Full Name',
      Mandatory: 'true',
      Options: '',
    },
    {
      Name: 'email',
      Type: 'email',
      Label: 'Work Email',
      Mandatory: 'true',
      Options: '',
    },
    {
      Name: 'useCase',
      Type: 'select',
      Label: 'Use Case',
      Mandatory: 'false',
      Options: 'Campaigns, Commerce, Migration',
    },
    {
      Name: 'consent',
      Type: 'checkbox',
      Label: 'Consent',
      Mandatory: 'true',
      Options: '',
    },
    {
      Name: 'submit',
      Type: 'submit',
      Label: 'Send',
    },
    {
      // malformed row without Name should be skipped
      Type: 'text',
      Label: 'Broken Row',
    },
  ],
  ':type': 'sheet',
};

test('normalizeFormFields parses valid rows and splits select options', () => {
  const fields = normalizeFormFields(SAMPLE_FORM_SHEET);
  assert.equal(fields.length, 5);
  assert.equal(fields[0].mandatory, true);
  assert.deepEqual(fields[2].options, ['Campaigns', 'Commerce', 'Migration']);
  assert.deepEqual(normalizeFormFields(null), []);
});

test('validateSubmission flags missing required fields, bad email, and unchecked consent', () => {
  const fields = normalizeFormFields(SAMPLE_FORM_SHEET);
  const bad = validateSubmission(fields, {
    fullName: '   ',
    email: 'not-an-email',
    useCase: '',
    consent: false,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.consent);
  assert.equal(bad.errors.useCase, undefined);
});

test('validateSubmission passes valid input and builds canonical EDS payload', () => {
  const fields = normalizeFormFields(SAMPLE_FORM_SHEET);
  const input = {
    fullName: '  Jordan Taylor ',
    email: 'jordan@enterprise.com',
    useCase: 'Commerce',
    consent: true,
  };
  const res = validateSubmission(fields, input);
  assert.equal(res.valid, true);
  assert.deepEqual(buildSubmissionPayload(fields, input), {
    data: {
      fullName: 'Jordan Taylor',
      email: 'jordan@enterprise.com',
      useCase: 'Commerce',
      consent: true,
    },
  });
});
