const assert = require('node:assert/strict');
const test = require('node:test');

const { parseCsvImport } = require('../../client/utils/csv-import.js');

test('imports original ten column export fields', () => {
    const parsed = parseCsvImport([
        'Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable',
        'Rain Jacket,Clothing,Shell,1,12,ounce,https://example.com/jacket,129.95,Worn,',
        'Food,Kitchen,Dinner,2,100,gram,https://example.com/food,5.50,,Consumable',
    ].join('\n'), 'Weekend');

    assert.equal(parsed.name, 'Weekend');
    assert.deepEqual(parsed.data, [
        {
            name: 'Rain Jacket',
            category: 'Clothing',
            description: 'Shell',
            qty: 1,
            weight: 12,
            unit: 'oz',
            url: 'https://example.com/jacket',
            price: 129.95,
            worn: true,
            consumable: false,
        },
        {
            name: 'Food',
            category: 'Kitchen',
            description: 'Dinner',
            qty: 2,
            weight: 100,
            unit: 'g',
            url: 'https://example.com/food',
            price: 5.50,
            worn: false,
            consumable: true,
        },
    ]);
});

test('keeps old six column CSV imports compatible', () => {
    const parsed = parseCsvImport('Tent,Shelter,Two person,1,2.5,lb', 'Old');

    assert.deepEqual(parsed.data, [
        {
            name: 'Tent',
            category: 'Shelter',
            description: 'Two person',
            qty: 1,
            weight: 2.5,
            unit: 'lb',
            url: '',
            price: 0,
            worn: false,
            consumable: false,
        },
    ]);
});

test('parses quoted commas and escaped double quotes', () => {
    const parsed = parseCsvImport([
        'Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable',
        '"Pot, 750ml",Kitchen,"Has ""wide"" lid",1,200,g,https://example.com/pot,39.99,,',
    ].join('\n'), 'Quoted');

    assert.equal(parsed.data[0].name, 'Pot, 750ml');
    assert.equal(parsed.data[0].description, 'Has "wide" lid');
});

test('leaves blank optional migration fields at defaults', () => {
    const parsed = parseCsvImport([
        'Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable',
        'Bottle,Water,,1,50,grams,,,,',
    ].join('\n'), 'Blank optional fields');

    assert.equal(parsed.data[0].url, '');
    assert.equal(parsed.data[0].price, 0);
    assert.equal(parsed.data[0].worn, false);
    assert.equal(parsed.data[0].consumable, false);
});

test('recognizes full units and short units', () => {
    const parsed = parseCsvImport([
        'Ounce,Test,,1,1,ounce',
        'Ounces,Test,,1,1,ounces',
        'Oz,Test,,1,1,oz',
        'Pound,Test,,1,1,pound',
        'Pounds,Test,,1,1,pounds',
        'Lb,Test,,1,1,lb',
        'Lbs,Test,,1,1,lbs',
        'Gram,Test,,1,1,gram',
        'Grams,Test,,1,1,grams',
        'G,Test,,1,1,g',
        'Kilogram,Test,,1,1,kilogram',
        'Kilograms,Test,,1,1,kilograms',
        'Kg,Test,,1,1,kg',
        'Kgs,Test,,1,1,kgs',
    ].join('\n'), 'Units');

    assert.deepEqual(parsed.data.map(row => row.unit), [
        'oz',
        'oz',
        'oz',
        'lb',
        'lb',
        'lb',
        'lb',
        'g',
        'g',
        'g',
        'kg',
        'kg',
        'kg',
        'kg',
    ]);
});

test('uses header mapping before fixed column positions', () => {
    const parsed = parseCsvImport([
        'Category,Item Name,unit,weight,qty,consumable,worn,price,url,description',
        'Sleep,Quilt,kg,0.5,1,true,false,250,https://example.com/quilt,Warm',
    ].join('\n'), 'Header mapped');

    assert.deepEqual(parsed.data[0], {
        name: 'Quilt',
        category: 'Sleep',
        description: 'Warm',
        qty: 1,
        weight: 0.5,
        unit: 'kg',
        url: 'https://example.com/quilt',
        price: 250,
        worn: false,
        consumable: true,
    });
});
