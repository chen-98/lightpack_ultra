const assert = require('node:assert/strict');
const test = require('node:test');

const { Library, normalizeGearTags } = require('../../client/dataTypes.js');
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

test('gear library only exposes items with names', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const placeholder = library.getItemById(category.categoryItems[0].itemId);

    placeholder.description = 'Has details but no name';
    placeholder.weight = weight.WeightToMg(1, 'oz');

    const namedItem = library.newItem({ category });
    namedItem.name = 'Stove';

    assert.deepEqual(library.getNamedItems().map(item => item.name), ['Stove']);
});

test('worn and consumable totals keep pack weight semantics stable', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const wornItem = library.getItemById(category.categoryItems[0].itemId);
    const consumableItem = library.newItem({ category });

    wornItem.name = 'Jacket';
    wornItem.weight = weight.WeightToMg(1, 'lb');
    category.categoryItems[0].qty = 2;
    category.categoryItems[0].worn = true;

    consumableItem.name = 'Food';
    consumableItem.weight = weight.WeightToMg(8, 'oz');
    category.categoryItems[1].qty = 3;
    category.categoryItems[1].consumable = true;

    list.calculateTotals();

    assert.equal(list.totalQty, 5);
    assert.equal(list.totalWeight, weight.WeightToMg(3.5, 'lb'));
    assert.equal(list.totalWornWeight, weight.WeightToMg(1, 'lb'));
    assert.equal(list.totalConsumableWeight, weight.WeightToMg(24, 'oz'));
    assert.equal(list.totalPackWeight, weight.WeightToMg(2.5, 'lb'));
    assert.equal(list.totalBaseWeight, weight.WeightToMg(1, 'lb'));
});

test('removing an item clears category references and id lookup', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const item = library.getItemById(category.categoryItems[0].itemId);

    item.name = 'Headlamp';
    library.removeItem(item.id);

    assert.equal(library.getItemById(item.id), undefined);
    assert.equal(category.getCategoryItemById(item.id), null);
    assert.equal(library.items.includes(item), false);
});

test('copying a list preserves category item references without duplicating gear items', () => {
    const library = new Library();
    const originalList = library.getListById(library.defaultListId);
    const originalCategory = library.getCategoryById(originalList.categoryIds[0]);
    const item = library.getItemById(originalCategory.categoryItems[0].itemId);

    originalList.name = 'Weekend';
    originalCategory.name = 'Sleep';
    item.name = 'Quilt';
    item.weight = weight.WeightToMg(20, 'oz');

    const copiedList = library.copyList(originalList.id);
    const copiedCategory = library.getCategoryById(copiedList.categoryIds[0]);

    assert.equal(copiedList.name, 'Copy of Weekend');
    assert.equal(copiedCategory.name, 'Sleep');
    assert.equal(copiedCategory.categoryItems[0].itemId, item.id);
    assert.equal(library.items.length, 1);
});

test('saved library data loads without stale first-run ids', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const item = library.getItemById(category.categoryItems[0].itemId);

    list.name = 'Loaded list';
    category.name = 'Cooking';
    item.name = 'Pot';
    item.weight = weight.WeightToMg(100, 'g');

    const saved = library.save();
    const loaded = new Library();
    loaded.load(saved);

    assert.equal(loaded.lists.length, 1);
    assert.equal(loaded.categories.length, 1);
    assert.equal(loaded.items.length, 1);
    assert.equal(loaded.getListById(saved.lists[0].id).name, 'Loaded list');
    assert.equal(loaded.getCategoryById(saved.categories[0].id).name, 'Cooking');
    assert.equal(loaded.getItemById(saved.items[0].id).name, 'Pot');
    assert.equal(loaded.getItemById(loaded.sequence + 1), undefined);
});

test('gear tags are normalized and deduplicated', () => {
    assert.deepEqual(normalizeGearTags([' sleep ', 'Sleep', '', 'cook']), ['sleep', 'cook']);
    assert.deepEqual(normalizeGearTags('sleep'), []);
});

test('new items inherit the current category name as their default gear tag', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);

    category.name = 'Kitchen';
    const item = library.newItem({ category });

    assert.deepEqual(item.gearTags, ['Kitchen']);
});

test('old saved items without gear tags load with an empty tag list', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const item = library.getItemById(category.categoryItems[0].itemId);

    item.name = 'Bottle';
    const saved = library.save();
    delete saved.items[0].gearTags;

    const loaded = new Library();
    loaded.load(saved);

    assert.deepEqual(loaded.items[0].gearTags, []);
});

test('gear tag list is derived from named items only', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const category = library.getCategoryById(list.categoryIds[0]);
    const unnamed = library.getItemById(category.categoryItems[0].itemId);
    const named = library.newItem({ category });

    unnamed.gearTags = ['hidden'];
    named.name = 'Tarp';
    named.gearTags = ['Shelter', 'sleep'];

    assert.deepEqual(library.getGearTags(), ['Shelter', 'sleep']);
});

test('weight insights rank categories and items by carried weight', () => {
    const library = new Library();
    const list = library.getListById(library.defaultListId);
    const firstCategory = library.getCategoryById(list.categoryIds[0]);
    const firstItem = library.getItemById(firstCategory.categoryItems[0].itemId);
    const secondCategory = library.newCategory({ list });
    const secondItem = library.newItem({ category: secondCategory });

    firstCategory.name = 'Sleep';
    firstItem.name = 'Quilt';
    firstItem.weight = weight.WeightToMg(20, 'oz');
    firstCategory.categoryItems[0].qty = 1;

    secondCategory.name = 'Water';
    secondItem.name = 'Bottle';
    secondItem.weight = weight.WeightToMg(12, 'oz');
    secondCategory.categoryItems[0].qty = 2;

    const insights = list.getWeightInsights();

    assert.equal(insights.topCategories[0].name, 'Water');
    assert.equal(insights.topItems[0].name, 'Bottle');
    assert.equal(insights.topItems[0].weight, weight.WeightToMg(24, 'oz'));
});
