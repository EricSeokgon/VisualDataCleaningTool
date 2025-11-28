// ===================================
// Global State
// ===================================
let originalData = [];
let currentData = [];
let columnTypes = {};
let missingValueIndices = [];
let outlierIndices = [];
let changedCells = new Set();

// ===================================
// DOM Elements
// ===================================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const dashboard = document.getElementById('dashboard');
const comparisonSection = document.getElementById('comparisonSection');

// Metrics
const qualityScore = document.getElementById('qualityScore');
const totalRows = document.getElementById('totalRows');
const totalColumns = document.getElementById('totalColumns');
const missingCount = document.getElementById('missingCount');
const missingPercent = document.getElementById('missingPercent');
const missingProgress = document.getElementById('missingProgress');
const outlierCount = document.getElementById('outlierCount');
const outlierPercent = document.getElementById('outlierPercent');
const outlierProgress = document.getElementById('outlierProgress');

// Controls
const missingMethod = document.getElementById('missingMethod');
const outlierMethod = document.getElementById('outlierMethod');
const applyMissingBtn = document.getElementById('applyMissingBtn');
const applyOutlierBtn = document.getElementById('applyOutlierBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const toggleComparisonBtn = document.getElementById('toggleComparisonBtn');

// Tables
const currentTableHead = document.getElementById('currentTableHead');
const currentTableBody = document.getElementById('currentTableBody');
const beforeTableHead = document.getElementById('beforeTableHead');
const beforeTableBody = document.getElementById('beforeTableBody');
const afterTableHead = document.getElementById('afterTableHead');
const afterTableBody = document.getElementById('afterTableBody');

// ===================================
// Event Listeners
// ===================================
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', handleDragOver);
uploadZone.addEventListener('dragleave', handleDragLeave);
uploadZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

missingMethod.addEventListener('change', () => {
  applyMissingBtn.disabled = !missingMethod.value;
});

outlierMethod.addEventListener('change', () => {
  applyOutlierBtn.disabled = !outlierMethod.value;
});

applyMissingBtn.addEventListener('click', handleMissingValues);
applyOutlierBtn.addEventListener('click', handleOutliers);
resetBtn.addEventListener('click', resetToOriginal);
exportBtn.addEventListener('click', exportCleanedData);
toggleComparisonBtn.addEventListener('click', toggleComparison);

// ===================================
// File Upload Handlers
// ===================================
function handleDragOver(e) {
  e.preventDefault();
  uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  uploadZone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function processFile(file) {
  const fileName = file.name.toLowerCase();
  const isCSV = fileName.endsWith('.csv');
  const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (!isCSV && !isXLSX) {
    alert('CSV 또는 XLSX 파일만 업로드 가능합니다.');
    return;
  }

  if (isCSV) {
    // Parse CSV file
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data.length === 0) {
          alert('파일에 데이터가 없습니다.');
          return;
        }

        originalData = results.data;
        currentData = JSON.parse(JSON.stringify(originalData));

        analyzeData();
        renderDashboard();
        renderCurrentTable();
      },
      error: function (error) {
        alert('파일 파싱 중 오류가 발생했습니다: ' + error.message);
      }
    });
  } else if (isXLSX) {
    // Parse XLSX file
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        if (jsonData.length === 0) {
          alert('파일에 데이터가 없습니다.');
          return;
        }

        originalData = jsonData;
        currentData = JSON.parse(JSON.stringify(originalData));

        analyzeData();
        renderDashboard();
        renderCurrentTable();
      } catch (error) {
        alert('XLSX 파일 파싱 중 오류가 발생했습니다: ' + error.message);
      }
    };

    reader.onerror = function () {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsArrayBuffer(file);
  }
}

// ===================================
// Data Analysis
// ===================================
function analyzeData() {
  if (currentData.length === 0) return;

  const columns = Object.keys(currentData[0]);

  // Detect column types
  columnTypes = {};
  columns.forEach(col => {
    columnTypes[col] = detectColumnType(col);
  });

  // Detect missing values
  missingValueIndices = [];
  currentData.forEach((row, rowIndex) => {
    columns.forEach(col => {
      if (isMissing(row[col])) {
        missingValueIndices.push({ row: rowIndex, col: col });
      }
    });
  });

  // Detect outliers in numeric columns
  outlierIndices = [];
  columns.forEach(col => {
    if (columnTypes[col] === 'numeric') {
      const outliers = detectOutliers(col);
      outlierIndices.push(...outliers);
    }
  });
}

function detectColumnType(columnName) {
  let numericCount = 0;
  let totalCount = 0;

  currentData.forEach(row => {
    const value = row[columnName];
    if (!isMissing(value)) {
      totalCount++;
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        numericCount++;
      }
    }
  });

  return (numericCount / totalCount) > 0.8 ? 'numeric' : 'text';
}

function isMissing(value) {
  return value === null ||
    value === undefined ||
    value === '' ||
    value === 'NA' ||
    value === 'N/A' ||
    value === 'null' ||
    value === 'NaN';
}

function detectOutliers(columnName) {
  const values = currentData
    .map((row, index) => ({ value: parseFloat(row[columnName]), index }))
    .filter(item => !isNaN(item.value) && isFinite(item.value));

  if (values.length < 4) return [];

  // Sort values
  const sortedValues = values.map(v => v.value).sort((a, b) => a - b);

  // Calculate Q1, Q3, and IQR
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Find outliers
  const outliers = [];
  values.forEach(item => {
    if (item.value < lowerBound || item.value > upperBound) {
      outliers.push({
        row: item.index,
        col: columnName,
        bounds: { lower: lowerBound, upper: upperBound }
      });
    }
  });

  return outliers;
}

function calculateQualityScore() {
  const totalCells = currentData.length * Object.keys(currentData[0]).length;
  const missingCells = missingValueIndices.length;
  const outlierCells = outlierIndices.length;

  const completeness = ((totalCells - missingCells) / totalCells) * 100;
  const outlierPenalty = (outlierCells / totalCells) * 100;

  const score = Math.max(0, Math.min(100, completeness - outlierPenalty));
  return Math.round(score);
}

// ===================================
// Rendering Functions
// ===================================
function renderDashboard() {
  dashboard.classList.add('active');

  const columns = Object.keys(currentData[0]);
  const totalCells = currentData.length * columns.length;
  const numericCells = columns.filter(col => columnTypes[col] === 'numeric').length * currentData.length;

  // Update metrics
  totalRows.textContent = currentData.length.toLocaleString();
  totalColumns.textContent = columns.length;
  missingCount.textContent = missingValueIndices.length.toLocaleString();
  outlierCount.textContent = outlierIndices.length.toLocaleString();

  const missingPct = ((missingValueIndices.length / totalCells) * 100).toFixed(1);
  const outlierPct = numericCells > 0 ? ((outlierIndices.length / numericCells) * 100).toFixed(1) : 0;

  missingPercent.textContent = `${missingPct}% of total cells`;
  outlierPercent.textContent = `${outlierPct}% of numeric cells`;

  missingProgress.style.width = `${missingPct}%`;
  outlierProgress.style.width = `${outlierPct}%`;

  // Animate quality score
  const score = calculateQualityScore();
  animateScore(score);
}

function animateScore(targetScore) {
  let currentScore = 0;
  const increment = targetScore / 50;
  const interval = setInterval(() => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(interval);
    }
    qualityScore.textContent = Math.round(currentScore);
  }, 20);
}

function renderCurrentTable() {
  if (currentData.length === 0) return;

  const columns = Object.keys(currentData[0]);

  // Render header
  currentTableHead.innerHTML = `
    <tr>
      ${columns.map(col => `<th>${col}</th>`).join('')}
    </tr>
  `;

  // Render body
  currentTableBody.innerHTML = currentData.map((row, rowIndex) => `
    <tr>
      ${columns.map(col => {
    const value = row[col];
    const cellId = `${rowIndex}-${col}`;

    let cellClass = '';
    if (isMissing(value)) {
      cellClass = 'cell-missing';
    } else if (outlierIndices.some(o => o.row === rowIndex && o.col === col)) {
      cellClass = 'cell-outlier';
    } else if (changedCells.has(cellId)) {
      cellClass = 'cell-changed';
    }

    const displayValue = isMissing(value) ? 'NULL' : value;
    return `<td class="${cellClass}">${displayValue}</td>`;
  }).join('')}
    </tr>
  `).join('');
}

function renderComparisonTables() {
  if (originalData.length === 0) return;

  const columns = Object.keys(originalData[0]);

  // Render headers
  const headerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>`;
  beforeTableHead.innerHTML = headerHTML;
  afterTableHead.innerHTML = headerHTML;

  // Render before table (original data)
  beforeTableBody.innerHTML = originalData.map((row, rowIndex) => `
    <tr>
      ${columns.map(col => {
    const value = row[col];
    let cellClass = '';
    if (isMissing(value)) {
      cellClass = 'cell-missing';
    }
    const displayValue = isMissing(value) ? 'NULL' : value;
    return `<td class="${cellClass}">${displayValue}</td>`;
  }).join('')}
    </tr>
  `).join('');

  // Render after table (current data)
  afterTableBody.innerHTML = currentData.map((row, rowIndex) => `
    <tr>
      ${columns.map(col => {
    const value = row[col];
    const originalValue = originalData[rowIndex] ? originalData[rowIndex][col] : null;
    const cellId = `${rowIndex}-${col}`;

    let cellClass = '';
    if (changedCells.has(cellId) || value !== originalValue) {
      cellClass = 'cell-changed';
    } else if (isMissing(value)) {
      cellClass = 'cell-missing';
    }

    const displayValue = isMissing(value) ? 'NULL' : value;
    return `<td class="${cellClass}">${displayValue}</td>`;
  }).join('')}
    </tr>
  `).join('');
}

// ===================================
// Data Cleaning Operations
// ===================================
function handleMissingValues() {
  const method = missingMethod.value;
  if (!method) return;

  changedCells.clear();
  const columns = Object.keys(currentData[0]);

  if (method === 'delete') {
    // Remove rows with missing values
    const rowsToDelete = new Set(missingValueIndices.map(m => m.row));
    currentData = currentData.filter((_, index) => !rowsToDelete.has(index));
  } else {
    // Fill missing values
    columns.forEach(col => {
      const missingInColumn = missingValueIndices.filter(m => m.col === col);
      if (missingInColumn.length === 0) return;

      let fillValue;
      if (columnTypes[col] === 'numeric') {
        fillValue = calculateFillValue(col, method);
      } else {
        fillValue = calculateMode(col);
      }

      missingInColumn.forEach(m => {
        currentData[m.row][col] = fillValue;
        changedCells.add(`${m.row}-${col}`);
      });
    });
  }

  analyzeData();
  renderDashboard();
  renderCurrentTable();

  missingMethod.value = '';
  applyMissingBtn.disabled = true;
}

function handleOutliers() {
  const method = outlierMethod.value;
  if (!method) return;

  if (method === 'delete') {
    // Remove rows with outliers
    const rowsToDelete = new Set(outlierIndices.map(o => o.row));
    currentData = currentData.filter((_, index) => !rowsToDelete.has(index));
    changedCells.clear();
  } else if (method === 'cap') {
    // Cap outliers at boundaries
    outlierIndices.forEach(outlier => {
      const value = parseFloat(currentData[outlier.row][outlier.col]);
      let cappedValue;

      if (value < outlier.bounds.lower) {
        cappedValue = outlier.bounds.lower.toFixed(2);
      } else if (value > outlier.bounds.upper) {
        cappedValue = outlier.bounds.upper.toFixed(2);
      }

      if (cappedValue) {
        currentData[outlier.row][outlier.col] = cappedValue;
        changedCells.add(`${outlier.row}-${outlier.col}`);
      }
    });
  }

  analyzeData();
  renderDashboard();
  renderCurrentTable();

  outlierMethod.value = '';
  applyOutlierBtn.disabled = true;
}

function calculateFillValue(columnName, method) {
  const values = currentData
    .map(row => parseFloat(row[columnName]))
    .filter(v => !isNaN(v) && isFinite(v));

  if (values.length === 0) return 0;

  if (method === 'mean') {
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(2);
  } else if (method === 'median') {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
      : sorted[mid].toFixed(2);
  } else if (method === 'mode') {
    return calculateMode(columnName);
  }

  return 0;
}

function calculateMode(columnName) {
  const values = currentData
    .map(row => row[columnName])
    .filter(v => !isMissing(v));

  if (values.length === 0) return '';

  const frequency = {};
  values.forEach(v => {
    frequency[v] = (frequency[v] || 0) + 1;
  });

  let maxFreq = 0;
  let mode = values[0];

  for (const [value, freq] of Object.entries(frequency)) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  }

  return mode;
}

// ===================================
// Utility Functions
// ===================================
function resetToOriginal() {
  currentData = JSON.parse(JSON.stringify(originalData));
  changedCells.clear();

  analyzeData();
  renderDashboard();
  renderCurrentTable();

  comparisonSection.classList.remove('active');
}

function toggleComparison() {
  const isActive = comparisonSection.classList.toggle('active');

  if (isActive) {
    renderComparisonTables();
    toggleComparisonBtn.textContent = '❌ 비교 닫기';
  } else {
    toggleComparisonBtn.textContent = '👁️ Before/After 비교';
  }
}

function exportCleanedData() {
  if (currentData.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  const csv = Papa.unparse(currentData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  link.href = URL.createObjectURL(blob);
  link.download = `cleaned_data_${timestamp}.csv`;
  link.click();

  URL.revokeObjectURL(link.href);
}
