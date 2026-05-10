const assert = require('node:assert/strict');
const test = require('node:test');

const { Library } = require('../../client/dataTypes.js');
const weight = require('../../client/utils/weight.js');

test('default placeholder item does not affect totals', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);

    list.calculateTotals();

    assert.equal(list.totalQty, 0);
    assert.equal(list.totalWeight, 0);
    assert.equal(list.totalPrice, 0);
});

test('empty placeholder item is filtered from saved library data', () => {
    const library = new Library();
    const saved = library.save();

    assert.equal(saved.items.length, 0);
    assert.equal(saved.categories.length, 1);
    assert.deepEqual(saved.categories[0].categoryItems, []);
});

test('meaningful item remains in totals and saved library data', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const item = library.getItemById(category.categoryItems[0].itemId);

    item.name = 'Tent';
    item.weight = weight.WeightToMg(2, 'lb');
    item.authorUnit = 'lb';
    item.price = 199.99;
    category.categoryItems[0].qty = 2;

    list.calculateTotals();
    const saved = library.save();

    assert.equal(list.totalQty, 2);
    assert.equal(list.totalWeight, weight.WeightToMg(4, 'lb'));
    assert.equal(list.totalPrice, 399.98);
    assert.equal(saved.items.length, 1);
    assert.equal(saved.categories[0].categoryItems.length, 1);
});
