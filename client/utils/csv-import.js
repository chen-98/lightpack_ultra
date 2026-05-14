const fullUnitToUnit = {
    ounce: 'oz',
    ounces: 'oz',
    oz: 'oz',
    pound: 'lb',
    pounds: 'lb',
    lb: 'lb',
    lbs: 'lb',
    gram: 'g',
    grams: 'g',
    g: 'g',
    kilogram: 'kg',
    kilograms: 'kg',
    kg: 'kg',
    kgs: 'kg',
};

const fixedColumnMap = {
    name: 0,
    category: 1,
    description: 2,
    qty: 3,
    weight: 4,
    unit: 5,
    url: 6,
    price: 7,
    worn: 8,
    consumable: 9,
};

const headerAliases = {
    itemname: 'name',
    name: 'name',
    category: 'category',
    desc: 'description',
    description: 'description',
    qty: 'qty',
    quantity: 'qty',
    weight: 'weight',
    unit: 'unit',
    url: 'url',
    link: 'url',
    price: 'price',
    worn: 'worn',
    consumable: 'consumable',
};

function CSVToArray(strData) {
    const strDelimiter = ',';
    const arrData = [[]];
    let arrMatches = null;

    const objPattern = new RegExp(
        (
            `(\\${strDelimiter}|\\r?\\n|\\r|^)`
            + '(?:"([^"]*(?:""[^"]*)*)"|'
            + `([^"\\${strDelimiter}\\r\\n]*))`
        ), 'gi',
    );

    while (arrMatches = objPattern.exec(strData)) {
        const strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }

        let strMatchedValue;
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return arrData;
}

function normalizeHeader(header) {
    return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getHeaderMap(row) {
    const map = {};

    row.forEach((header, index) => {
        const key = headerAliases[normalizeHeader(header)];
        if (key && typeof map[key] === 'undefined') {
            map[key] = index;
        }
    });

    if (typeof map.name === 'undefined' || typeof map.qty === 'undefined' || typeof map.weight === 'undefined' || typeof map.unit === 'undefined') {
        return null;
    }

    return map;
}

function getCell(row, columnMap, key) {
    const index = columnMap[key];
    if (typeof index === 'undefined') {
        return '';
    }
    return row[index] || '';
}

function parseNumber(value) {
    const number = parseFloat(String(value || '').trim());
    return Number.isNaN(number) ? null : number;
}

function parsePrice(value) {
    const text = String(value || '').trim();
    if (!text) {
        return 0;
    }
    const number = parseFloat(text.replace(/[$,]/g, ''));
    return Number.isNaN(number) ? 0 : number;
}

function parseFlag(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === '0' || text === 'false' || text === 'no' || text === 'n' || text === 'off') {
        return false;
    }
    return true;
}

function normalizeUnit(value) {
    return fullUnitToUnit[String(value || '').trim().toLowerCase()];
}

function parseCsvImport(input, name) {
    const csv = CSVToArray(input);
    const importData = { data: [], name };
    let columnMap = fixedColumnMap;
    let startIndex = 0;

    if (csv.length) {
        const headerMap = getHeaderMap(csv[0]);
        if (headerMap) {
            columnMap = headerMap;
            startIndex = 1;
        }
    }

    for (let i = startIndex; i < csv.length; i++) {
        const row = csv[i];
        if (!row || row.length < 6) continue;

        const qty = parseNumber(getCell(row, columnMap, 'qty'));
        const weight = parseNumber(getCell(row, columnMap, 'weight'));
        const unit = normalizeUnit(getCell(row, columnMap, 'unit'));

        if (qty === null || weight === null || typeof unit === 'undefined') continue;

        importData.data.push({
            name: getCell(row, columnMap, 'name'),
            category: getCell(row, columnMap, 'category'),
            description: getCell(row, columnMap, 'description'),
            qty,
            weight,
            unit,
            url: getCell(row, columnMap, 'url'),
            price: parsePrice(getCell(row, columnMap, 'price')),
            worn: parseFlag(getCell(row, columnMap, 'worn')),
            consumable: parseFlag(getCell(row, columnMap, 'consumable')),
        });
    }

    return importData;
}

module.exports = {
    CSVToArray,
    parseCsvImport,
    fullUnitToUnit,
};
