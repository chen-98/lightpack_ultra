const assert = require('node:assert/strict');
const test = require('node:test');

const { parseQuickEntryRows } = require('../../client/utils/quick-entry.js');

test('parses tabular quick entry rows', () => {
    assert.deepEqual(parseQuickEntryRows('Tent\t2\tlb\nStove\t300\tg', 'oz'), [
        { name: 'Tent', weight: 2, unit: 'lb' },
        { name: 'Stove', weight: 300, unit: 'g' },
    ]);
});

test('parses simple name weight unit rows', () => {
    assert.deepEqual(parseQuickEntryRows('Rain jacket 12 oz\nFuel 0.5 kg', 'g'), [
        { name: 'Rain jacket', weight: 12, unit: 'oz' },
        { name: 'Fuel', weight: 0.5, unit: 'kg' },
    ]);
});

test('uses default unit when the pasted row has no supported unit', () => {
    assert.deepEqual(parseQuickEntryRows('Bottle 750', 'g'), [
        { name: 'Bottle', weight: 750, unit: 'g' },
    ]);
});
