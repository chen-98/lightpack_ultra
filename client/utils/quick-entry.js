const supportedUnits = ['oz', 'lb', 'g', 'kg'];

function parseQuickEntryRows(input, defaultUnit) {
    return String(input || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => parseQuickEntryRow(line, defaultUnit))
        .filter(row => row && row.name);
}

function parseQuickEntryRow(line, defaultUnit) {
    const fields = line.split(/\t|,/).map(field => field.trim()).filter(Boolean);
    if (fields.length >= 2) {
        return rowFromParts(fields[0], fields[1], fields[2], defaultUnit);
    }

    const match = line.match(/^(.*?)\s+([0-9]*\.?[0-9]+)\s*(oz|lb|g|kg)?$/i);
    if (!match) {
        return { name: line, weight: 0, unit: defaultUnit || 'oz' };
    }
    return rowFromParts(match[1], match[2], match[3], defaultUnit);
}

function rowFromParts(name, weight, unit, defaultUnit) {
    const parsedWeight = parseFloat(weight, 10);
    const normalizedUnit = normalizeUnit(unit, defaultUnit);
    return {
        name: String(name || '').trim(),
        weight: isNaN(parsedWeight) ? 0 : parsedWeight,
        unit: normalizedUnit,
    };
}

function normalizeUnit(unit, defaultUnit) {
    const normalized = String(unit || defaultUnit || 'oz').toLowerCase();
    if (supportedUnits.indexOf(normalized) > -1) {
        return normalized;
    }
    return defaultUnit || 'oz';
}

module.exports = {
    parseQuickEntryRows,
};
