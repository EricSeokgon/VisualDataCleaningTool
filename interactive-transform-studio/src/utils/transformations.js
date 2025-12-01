/**
 * Normalize data to 0-1 range (Min-Max Scaling)
 * @param {Array<Object>} data - The dataset
 * @param {string} column - The column to transform
 * @returns {Array<Object>} - New dataset with transformed column
 */
export const normalize = (data, column) => {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (max === min) return data; // Avoid division by zero

    return data.map(row => {
        const val = parseFloat(row[column]);
        if (isNaN(val)) return row;
        const newVal = (val - min) / (max - min);
        return { ...row, [column]: newVal };
    });
};

/**
 * Standardize data to mean 0, std 1 (Z-Score Scaling)
 * @param {Array<Object>} data 
 * @param {string} column 
 * @returns {Array<Object>}
 */
export const standardize = (data, column) => {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    const n = values.length;
    if (n === 0) return data;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    if (std === 0) return data;

    return data.map(row => {
        const val = parseFloat(row[column]);
        if (isNaN(val)) return row;
        const newVal = (val - mean) / std;
        return { ...row, [column]: newVal };
    });
};

/**
 * One-Hot Encoding for categorical data
 * @param {Array<Object>} data 
 * @param {string} column 
 * @returns {Array<Object>}
 */
export const oneHotEncode = (data, column) => {
    const uniqueValues = [...new Set(data.map(row => row[column]))];

    return data.map(row => {
        const newRow = { ...row };
        // Remove original column? Optional. Let's keep it for now or maybe remove it.
        // Usually we replace the original column.
        delete newRow[column];

        uniqueValues.forEach(val => {
            newRow[`${column}_${val}`] = row[column] === val ? 1 : 0;
        });

        return newRow;
    });
};

export const applyTransformation = (data, type, column) => {
    switch (type) {
        case 'normalize':
            return normalize(data, column);
        case 'standardize':
            return standardize(data, column);
        case 'oneHot':
            return oneHotEncode(data, column);
        default:
            return data;
    }
};
