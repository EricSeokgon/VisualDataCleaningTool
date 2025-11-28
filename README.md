# 📊 Visual Data Cleaning Tool
A web application for uploading CSV data and visually detecting and cleaning missing values and outliers

## ✨ Key Features

### 1. 📁 CSV File Upload
- Drag and drop support
- Click to select files
- Automatic parsing and data analysis

### 2. 🔍 Automatic Detection
- **Missing Value Detection**: Automatically detects NULL, empty values, "NA", "N/A", etc.
- **Outlier Detection**: Statistical outlier detection using IQR (Interquartile Range) method
- Real-time statistics calculation and visualization

### 3. 🎨 Visual Highlighting
- 🔴 **Missing Values**: Highlighted in red
- 🟠 **Outliers**: Highlighted in orange
- 🟢 **Modified Values**: Highlighted in green

### 4. 🛠️ Data Cleaning Options

**Missing Value Treatment**
- Fill with Mean: Replace missing values with the mean of numeric columns
- Fill with Median: Replace missing values with the median of numeric columns
- Fill with Mode: Replace missing values with the most frequent value
- Delete Rows: Remove entire rows containing missing values

**Outlier Treatment**
- Cap at Boundaries: Limit outliers to IQR boundary values
- Delete Rows: Remove entire rows containing outliers

### 5. 👁️ Before/After Comparison
- Compare original and cleaned data side by side
- Automatic highlighting of modified cells
- Toggle button to open/close comparison view

### 6. 📊 Data Quality Dashboard
- **Quality Score**: Data quality assessment on 0-100 scale
- **Metric Cards**:
  - Total rows / columns
  - Missing value count and percentage
  - Outlier count and percentage
  - Visualization with progress bars

### 7. 💾 Data Export
- Download cleaned data as CSV file
- Auto-generated filename with timestamp

## 🚀 How to Use

### 1. Launch Application
```bash
# Navigate to project directory
cd data-cleaning-tool

# Open index.html in browser
# Method 1: Double-click index.html in file explorer
# Method 2: Open file in browser (Ctrl+O)
```

### 2. Upload CSV File
- Click the upload area or drag and drop a CSV file
- Sample data: Use the included `sample_data.csv` file

### 3. Review Data Analysis
- Check the automatically generated quality score
- Review missing value and outlier statistics
- Check highlighted cells in the data table

### 4. Clean Data
- Select missing value treatment method and click "Apply"
- Select outlier treatment method and click "Apply"
- Review changes in real-time

### 5. Compare Before/After
- Click "Before/After Comparison" button
- Compare original and cleaned data

### 6. Export Data
- Click "Download Cleaned Data" button
- CSV file downloads automatically

## 📁 File Structure
```
data-cleaning-tool/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet (design system)
├── script.js           # JavaScript logic
├── sample_data.csv     # Sample data for testing
└── README.md           # Project documentation
```

## 🎨 Design Features
- **Dark Theme**: Dark background to reduce eye strain
- **Gradients**: Purple-blue gradient accent colors
- **Glassmorphism**: Modern card design with translucent effects
- **Smooth Animations**: Enhanced UX with micro-interactions
- **Responsive Design**: Mobile, tablet, and desktop support

## 🔧 Tech Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom design system, animations
- **JavaScript (ES6+)**: Data processing logic
- **Papa Parse**: CSV parsing library
- **Google Fonts**: Inter font family

## 📊 Algorithms

### Missing Value Detection
```javascript
// The following values are considered missing:
- null
- undefined
- Empty string ("")
- "NA", "N/A"
- "null", "NaN"
```

### Outlier Detection (IQR Method)
```
Q1 = 25th percentile
Q3 = 75th percentile
IQR = Q3 - Q1

Lower Bound = Q1 - 1.5 × IQR
Upper Bound = Q3 + 1.5 × IQR

// Values below lower bound or above upper bound are considered outliers
```

### Quality Score Calculation
```
Completeness = (Total Cells - Missing Values) / Total Cells × 100
Outlier Penalty = Outlier Count / Total Cells × 100

Quality Score = Completeness - Outlier Penalty (range: 0-100)
```

## 📝 Sample Data Information
The `sample_data.csv` file contains 30 employee records:

- **Columns**: Name, Age, Salary, Department, Experience, Score
- **Intentional Missing Values**: Empty values in multiple rows
- **Intentional Outliers**: Salary column contains 250000 (extreme value)

## 🌟 Key Highlights
- **Client-Side Processing**: All data processing happens in the browser (no server required)
- **Real-Time Feedback**: Immediate visual feedback for all operations
- **Undo Functionality**: "Reset to Original" button to restore initial state anytime
- **Multiple Processing Options**: Various missing value/outlier treatment methods
- **Visual Comparison**: Before/After view for clear change verification

## 🎯 Use Cases
- Data preprocessing before analysis
- Data cleaning before machine learning model training
- Data quality validation
- Data preparation for statistical analysis
- Data anomaly detection and correction

## 📄 License
This project is freely available for educational and personal use.

## 🤝 Contributing
Improvements and bug reports are always welcome!

---

Made with ❤️ for Data Scientists and Analysts
