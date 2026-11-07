import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanPlateText,
  parseAndNormalizeIndianPlate,
  formatPlateDisplay,
  INDIAN_STATE_CODES,
} from './plateParser';

test('cleanPlateText strips spaces, hyphens, and dots', () => {
  assert.equal(cleanPlateText('GJ-01-AB-1234'), 'GJ01AB1234');
  assert.equal(cleanPlateText('MH 12 EF 3456'), 'MH12EF3456');
  assert.equal(cleanPlateText('dl.8.caf.1234'), 'DL8CAF1234');
});

test('parses standard Indian registration plates with high confidence', () => {
  const p1 = parseAndNormalizeIndianPlate('GJ01AB1234');
  assert.equal(p1.isValid, true);
  assert.equal(p1.normalizedPlate, 'GJ01AB1234');
  assert.equal(p1.stateCode, 'GJ');
  assert.equal(p1.stateName, 'Gujarat');
  assert.equal(p1.districtCode, '01');
  assert.equal(p1.seriesCode, 'AB');
  assert.equal(p1.uniqueNumber, '1234');
  assert.equal(p1.formatType, 'STANDARD');

  const p2 = parseAndNormalizeIndianPlate('MH12EF3456');
  assert.equal(p2.isValid, true);
  assert.equal(p2.normalizedPlate, 'MH12EF3456');
  assert.equal(p2.stateCode, 'MH');
  assert.equal(p2.stateName, 'Maharashtra');

  const p3 = parseAndNormalizeIndianPlate('KA03MN9876');
  assert.equal(p3.isValid, true);
  assert.equal(p3.normalizedPlate, 'KA03MN9876');
  assert.equal(p3.stateName, 'Karnataka');
});

test('handles Delhi single digit RTO formats like DL8CAF1234', () => {
  const p = parseAndNormalizeIndianPlate('DL8CAF1234');
  assert.equal(p.isValid, true);
  assert.equal(p.normalizedPlate, 'DL08CAF1234');
  assert.equal(p.stateCode, 'DL');
  assert.equal(p.districtCode, '08');
  assert.equal(p.seriesCode, 'CAF');
  assert.equal(p.uniqueNumber, '1234');
});

test('normalizes OCR character confusions (O/0, S/5, Z/2, B/8)', () => {
  // 'O' instead of '0' in district, 'S' instead of '5' in number block
  const noisy = parseAndNormalizeIndianPlate('GJ O1 AB 12S4');
  assert.equal(noisy.isValid, true);
  assert.equal(noisy.normalizedPlate, 'GJ01AB1254');
  assert.ok(noisy.ocrCorrectionsApplied.length > 0);

  // '0L' instead of 'DL', 'I2' instead of '12'
  const noisyDL = parseAndNormalizeIndianPlate('0L 8 CAF I234');
  assert.equal(noisyDL.isValid, true);
  assert.equal(noisyDL.normalizedPlate, 'DL08CAF1234');
});

test('parses Bharat Series (BH) registrations', () => {
  const bh = parseAndNormalizeIndianPlate('22BH1234AA');
  assert.equal(bh.isValid, true);
  assert.equal(bh.formatType, 'BHARAT_SERIES');
  assert.equal(bh.bhYear, '22');
  assert.equal(bh.uniqueNumber, '1234');
  assert.equal(bh.bhSeries, 'AA');

  // OCR confusion in BH series (e.g. 228H1234AA where B became 8)
  const noisyBH = parseAndNormalizeIndianPlate('228H1234AA');
  assert.equal(noisyBH.isValid, true);
  assert.equal(noisyBH.normalizedPlate, '22BH1234AA');
});

test('formats plate display with spaces', () => {
  assert.equal(formatPlateDisplay('GJ01AB1234'), 'GJ 01 AB 1234');
  assert.equal(formatPlateDisplay('22BH1234AA'), '22 BH 1234 AA');
});
