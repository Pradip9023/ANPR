import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDuration,
  calculateParkingFee,
  isDuplicateDetection,
  computeOccupancy,
} from './parkingLogic';

test('calculates duration accurately', () => {
  const entry = '2026-11-07T08:00:00.000Z';
  const exit = '2026-11-07T10:45:00.000Z';
  const res = calculateDuration(entry, exit);
  assert.equal(res.totalMinutes, 165);
  assert.equal(res.formattedDuration, '2h 45m');
});

test('parking fee logic applies free tier and hourly rate for visitors', () => {
  const entry = '2026-11-07T09:00:00.000Z';
  // 20 mins: free (under 30 mins)
  const exitQuick = '2026-11-07T09:20:00.000Z';
  assert.equal(calculateParkingFee(entry, exitQuick, 'VISITOR'), 0);

  // 1 hour 30 mins: 90 mins total. Billable = 60 mins -> 1 hour * 20 = 20 INR
  const exit1hr30 = '2026-11-07T10:30:00.000Z';
  assert.equal(calculateParkingFee(entry, exit1hr30, 'VISITOR'), 20);

  // Employee always free
  assert.equal(calculateParkingFee(entry, exit1hr30, 'EMPLOYEE'), 0);
});

test('duplicate detection blocks re-triggers within debounce window', () => {
  const t0 = '2026-11-07T10:00:00.000Z';
  const t1 = '2026-11-07T10:00:30.000Z'; // 30 sec later
  const t2 = '2026-11-07T10:02:00.000Z'; // 120 sec later

  assert.equal(isDuplicateDetection(t0, t1, 45), true);
  assert.equal(isDuplicateDetection(t0, t2, 45), false);
});

test('computes occupancy rates correctly', () => {
  const occ1 = computeOccupancy(100, 25);
  assert.equal(occ1.percentage, 25);
  assert.equal(occ1.status, 'LOW');
  assert.equal(occ1.available, 75);

  const occ2 = computeOccupancy(100, 85);
  assert.equal(occ2.percentage, 85);
  assert.equal(occ2.status, 'NEAR_FULL');

  const occ3 = computeOccupancy(100, 98);
  assert.equal(occ3.status, 'FULL');
});
