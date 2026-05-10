const assert = require('node:assert/strict');
const test = require('node:test');

const weight = require('../../client/utils/weight.js');

test('converts supported units to milligrams', () => {
    assert.equal(weight.WeightToMg(1, 'g'), 1000);
    assert.equal(weight.WeightToMg(1, 'kg'), 1000000);
    assert.equal(weight.WeightToMg(1, 'oz'), 28349.5);
    assert.equal(weight.WeightToMg(1, 'lb'), 453592);
});

test('converts milligrams to rounded display weights', () => {
    assert.equal(weight.MgToWeight(1000, 'g'), 1);
    assert.equal(weight.MgToWeight(1000000, 'kg'), 1);
    assert.equal(weight.MgToWeight(28349.5, 'oz'), 1);
    assert.equal(weight.MgToWeight(453592, 'lb'), 1);
});
