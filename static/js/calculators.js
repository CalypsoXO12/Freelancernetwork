// Freelance Financial Toolkit - Calculator Functions

/**
 * Utility function to format currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Utility function to format percentage
 * @param {number} percentage - The percentage to format
 * @returns {string} Formatted percentage string
 */
function formatPercentage(percentage) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(percentage / 100);
}

/**
 * Validate numeric input
 * @param {number} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value (optional)
 * @returns {boolean} Whether the value is valid
 */
function validateNumericInput(value, min = 0, max = Infinity) {
    return !isNaN(value) && value >= min && value <= max;
}

/**
 * Add visual feedback for form validation
 * @param {HTMLElement} element - The form element
 * @param {boolean} isValid - Whether the input is valid
 */
function setInputValidation(element, isValid) {
    element.classList.remove('is-valid', 'is-invalid');
    element.classList.add(isValid ? 'is-valid' : 'is-invalid');
}

/**
 * Calculate hourly rate based on freelancer inputs
 */
function calculateHourlyRate() {
    // Get input values
    const desiredIncome = parseFloat(document.getElementById('desiredIncome').value) || 0;
    const billableHours = parseFloat(document.getElementById('billableHours').value) || 0;
    const businessExpenses = parseFloat(document.getElementById('businessExpenses').value) || 0;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;
    
    // Validate inputs
    const inputs = [
        { element: document.getElementById('desiredIncome'), value: desiredIncome, min: 0 },
        { element: document.getElementById('billableHours'), value: billableHours, min: 1 },
        { element: document.getElementById('businessExpenses'), value: businessExpenses, min: 0 },
        { element: document.getElementById('profitMargin'), value: profitMargin, min: 0, max: 100 }
    ];
    
    let allValid = true;
    inputs.forEach(input => {
        const isValid = validateNumericInput(input.value, input.min, input.max);
        setInputValidation(input.element, isValid);
        if (!isValid) allValid = false;
    });
    
    if (!allValid) {
        showAlert('Please enter valid values for all fields.', 'danger');
        return;
    }
    
    // Perform calculations
    const totalCosts = desiredIncome + businessExpenses;
    const rateBeforeProfit = totalCosts / billableHours;
    const profitAmount = rateBeforeProfit * (profitMargin / 100);
    const suggestedHourlyRate = rateBeforeProfit + profitAmount;
    
    // Display results
    document.getElementById('suggestedRate').textContent = formatCurrency(suggestedHourlyRate);
    document.getElementById('rateBeforeProfit').textContent = formatCurrency(rateBeforeProfit);
    document.getElementById('profitAmount').textContent = formatCurrency(profitAmount);
    
    // Show results section and hide instructions
    document.getElementById('hourlyRateResults').style.display = 'block';
    document.getElementById('hourlyRateInstructions').style.display = 'none';
    
    // Add success feedback
    showAlert('Hourly rate calculated successfully!', 'success');
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
        document.getElementById('hourlyRateResults').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

/**
 * Reset the hourly rate calculator form
 */
function resetHourlyRateForm() {
    document.getElementById('hourlyRateForm').reset();
    
    // Remove validation classes
    document.querySelectorAll('#hourlyRateForm .form-control').forEach(element => {
        element.classList.remove('is-valid', 'is-invalid');
    });
    
    // Hide results and show instructions
    document.getElementById('hourlyRateResults').style.display = 'none';
    document.getElementById('hourlyRateInstructions').style.display = 'block';
    
    // Clear any alerts
    clearAlerts();
}

/**
 * Calculate project profitability
 */
function calculateProjectProfit() {
    // Get input values
    const projectRevenue = parseFloat(document.getElementById('projectRevenue').value) || 0;
    const projectCosts = parseFloat(document.getElementById('projectCosts').value) || 0;
    
    // Validate inputs
    const inputs = [
        { element: document.getElementById('projectRevenue'), value: projectRevenue, min: 0 },
        { element: document.getElementById('projectCosts'), value: projectCosts, min: 0 }
    ];
    
    let allValid = true;
    inputs.forEach(input => {
        const isValid = validateNumericInput(input.value, input.min);
        setInputValidation(input.element, isValid);
        if (!isValid) allValid = false;
    });
    
    if (!allValid) {
        showAlert('Please enter valid values for all fields.', 'danger');
        return;
    }
    
    // Perform calculations
    const netProfit = projectRevenue - projectCosts;
    const profitMarginPercent = projectRevenue > 0 ? (netProfit / projectRevenue) * 100 : 0;
    
    // Display results
    document.getElementById('netProfit').textContent = formatCurrency(netProfit);
    document.getElementById('profitMarginResult').textContent = formatPercentage(profitMarginPercent);
    document.getElementById('revenueDisplay').textContent = formatCurrency(projectRevenue);
    document.getElementById('costsDisplay').textContent = formatCurrency(projectCosts);
    
    // Set profitability indicator
    const indicator = document.getElementById('profitabilityIndicator');
    const message = document.getElementById('profitabilityMessage');
    
    indicator.className = 'alert'; // Reset classes
    
    if (netProfit < 0) {
        indicator.classList.add('alert-danger');
        message.textContent = 'This project will result in a loss. Consider renegotiating terms or declining.';
    } else if (profitMarginPercent < 10) {
        indicator.classList.add('alert-warning');
        message.textContent = 'Low profit margin. Consider if this project is worth your time and effort.';
    } else if (profitMarginPercent < 20) {
        indicator.classList.add('alert-info');
        message.textContent = 'Moderate profit margin. This could be acceptable depending on other factors.';
    } else {
        indicator.classList.add('alert-success');
        message.textContent = 'Excellent profit margin! This project looks very profitable.';
    }
    
    // Show results section and hide instructions
    document.getElementById('projectProfitResults').style.display = 'block';
    document.getElementById('projectProfitInstructions').style.display = 'none';
    
    // Add success feedback
    showAlert('Project profitability calculated successfully!', 'success');
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
        document.getElementById('projectProfitResults').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

/**
 * Reset the project profit calculator form
 */
function resetProjectProfitForm() {
    document.getElementById('projectProfitForm').reset();
    
    // Remove validation classes
    document.querySelectorAll('#projectProfitForm .form-control').forEach(element => {
        element.classList.remove('is-valid', 'is-invalid');
    });
    
    // Hide results and show instructions
    document.getElementById('projectProfitResults').style.display = 'none';
    document.getElementById('projectProfitInstructions').style.display = 'block';
    
    // Clear any alerts
    clearAlerts();
}

/**
 * Show alert message
 * @param {string} message - The message to display
 * @param {string} type - The alert type (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    clearAlerts();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Find the first container and prepend the alert
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Auto-dismiss success alerts after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                const alert = container.querySelector('.alert-success');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 3000);
        }
    }
}

/**
 * Clear all alert messages
 */
function clearAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        if (alert.classList.contains('show')) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    });
}

/**
 * Add real-time validation to form inputs
 */
function addRealTimeValidation() {
    // Hourly rate calculator validation
    const hourlyRateInputs = document.querySelectorAll('#hourlyRateForm .form-control');
    hourlyRateInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            let isValid = false;
            
            switch (this.id) {
                case 'desiredIncome':
                case 'businessExpenses':
                    isValid = validateNumericInput(value, 0);
                    break;
                case 'billableHours':
                    isValid = validateNumericInput(value, 1);
                    break;
                case 'profitMargin':
                    isValid = validateNumericInput(value, 0, 100);
                    break;
            }
            
            if (this.value === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else {
                setInputValidation(this, isValid);
            }
        });
    });
    
    // Project profit calculator validation
    const projectProfitInputs = document.querySelectorAll('#projectProfitForm .form-control');
    projectProfitInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const isValid = validateNumericInput(value, 0);
            
            if (this.value === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else {
                setInputValidation(this, isValid);
            }
        });
    });
}

/**
 * Add keyboard shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter to calculate
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const activeForm = document.querySelector('form:focus-within') || 
                              document.querySelector('#hourlyRateForm, #projectProfitForm');
            
            if (activeForm) {
                event.preventDefault();
                if (activeForm.id === 'hourlyRateForm') {
                    calculateHourlyRate();
                } else if (activeForm.id === 'projectProfitForm') {
                    calculateProjectProfit();
                }
            }
        }
        
        // Escape to reset form
        if (event.key === 'Escape') {
            const activeForm = document.querySelector('form:focus-within') || 
                              document.querySelector('#hourlyRateForm, #projectProfitForm');
            
            if (activeForm) {
                if (activeForm.id === 'hourlyRateForm') {
                    resetHourlyRateForm();
                } else if (activeForm.id === 'projectProfitForm') {
                    resetProjectProfitForm();
                }
            }
        }
    });
}

/**
 * Initialize calculators when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add real-time validation
    addRealTimeValidation();
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
    
    // Add Enter key support for calculate buttons
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.target.classList.contains('form-control')) {
            event.preventDefault();
            
            // Find the calculate button in the same form
            const form = event.target.closest('form');
            if (form) {
                const calculateBtn = form.parentElement.querySelector('button[onclick*="calculate"]');
                if (calculateBtn) {
                    calculateBtn.click();
                }
            }
        }
    });
    
    // Add tooltips for better UX (if Bootstrap tooltips are available)
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

/**
 * Export calculator results to PDF
 * @param {string} calculatorType - 'hourly-rate' or 'project-profit'
 */
function exportToPDF(calculatorType) {
    if (calculatorType === 'hourly-rate') {
        exportHourlyRateToPDF();
    } else if (calculatorType === 'project-profit') {
        exportProjectProfitToPDF();
    }
}

/**
 * Export calculator results to spreadsheet (CSV)
 * @param {string} calculatorType - 'hourly-rate' or 'project-profit'
 */
function exportToSpreadsheet(calculatorType) {
    if (calculatorType === 'hourly-rate') {
        exportHourlyRateToCSV();
    } else if (calculatorType === 'project-profit') {
        exportProjectProfitToCSV();
    }
}

/**
 * Export hourly rate results to PDF using browser print
 */
function exportHourlyRateToPDF() {
    const results = document.getElementById('hourlyRateResults');
    if (!results || results.style.display === 'none') {
        showAlert('Please calculate your hourly rate first before exporting.', 'warning');
        return;
    }

    // Get input values
    const desiredIncome = document.getElementById('desiredIncome').value;
    const billableHours = document.getElementById('billableHours').value;
    const businessExpenses = document.getElementById('businessExpenses').value;
    const profitMargin = document.getElementById('profitMargin').value;
    
    // Get calculated results
    const suggestedRate = document.getElementById('suggestedRate').textContent;
    const rateBeforeProfit = document.getElementById('rateBeforeProfit').textContent;
    const profitAmount = document.getElementById('profitAmount').textContent;

    // Create print-friendly content
    const printContent = `
        <html>
        <head>
            <title>Hourly Rate Calculation Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .result { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .highlight { font-size: 24px; color: #28a745; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Freelancer Hourly Rate Calculation</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
                <h2>Input Parameters</h2>
                <table>
                    <tr><th>Parameter</th><th>Value</th></tr>
                    <tr><td>Desired Annual Income</td><td>${formatCurrency(parseFloat(desiredIncome))}</td></tr>
                    <tr><td>Annual Billable Hours</td><td>${billableHours} hours</td></tr>
                    <tr><td>Annual Business Expenses</td><td>${formatCurrency(parseFloat(businessExpenses))}</td></tr>
                    <tr><td>Desired Profit Margin</td><td>${profitMargin}%</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Calculation Results</h2>
                <div class="result">
                    <h3>Suggested Hourly Rate: <span class="highlight">${suggestedRate}</span></h3>
                </div>
                <table>
                    <tr><th>Component</th><th>Amount</th></tr>
                    <tr><td>Rate Before Profit</td><td>${rateBeforeProfit}</td></tr>
                    <tr><td>Profit Amount</td><td>${profitAmount}</td></tr>
                    <tr><td><strong>Final Hourly Rate</strong></td><td><strong>${suggestedRate}</strong></td></tr>
                </table>
            </div>
            
            <div class="section">
                <p><small>Generated by Freelance Financial Toolkit - toolkitfreelance@gmail.com</small></p>
            </div>
        </body>
        </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Export project profit results to PDF using browser print
 */
function exportProjectProfitToPDF() {
    const results = document.getElementById('projectProfitResults');
    if (!results || results.style.display === 'none') {
        showAlert('Please calculate project profitability first before exporting.', 'warning');
        return;
    }

    // Get input values
    const projectRevenue = document.getElementById('projectRevenue').value;
    const projectCosts = document.getElementById('projectCosts').value;
    
    // Get calculated results
    const netProfit = document.getElementById('netProfit').textContent;
    const profitMargin = document.getElementById('profitMarginResult').textContent;
    const profitabilityMessage = document.getElementById('profitabilityMessage').textContent;

    // Create print-friendly content
    const printContent = `
        <html>
        <head>
            <title>Project Profitability Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .result { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .highlight { font-size: 24px; color: #28a745; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Project Profitability Analysis</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
                <h2>Project Details</h2>
                <table>
                    <tr><th>Parameter</th><th>Value</th></tr>
                    <tr><td>Project Revenue</td><td>${formatCurrency(parseFloat(projectRevenue))}</td></tr>
                    <tr><td>Project Costs</td><td>${formatCurrency(parseFloat(projectCosts))}</td></tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Profitability Results</h2>
                <div class="result">
                    <h3>Net Profit: <span class="highlight">${netProfit}</span></h3>
                    <h3>Profit Margin: <span class="highlight">${profitMargin}</span></h3>
                </div>
                <div class="result">
                    <p><strong>Analysis:</strong> ${profitabilityMessage}</p>
                </div>
            </div>
            
            <div class="section">
                <p><small>Generated by Freelance Financial Toolkit - toolkitfreelance@gmail.com</small></p>
            </div>
        </body>
        </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Export hourly rate results to CSV
 */
function exportHourlyRateToCSV() {
    const results = document.getElementById('hourlyRateResults');
    if (!results || results.style.display === 'none') {
        showAlert('Please calculate your hourly rate first before exporting.', 'warning');
        return;
    }

    // Get input values
    const desiredIncome = document.getElementById('desiredIncome').value;
    const billableHours = document.getElementById('billableHours').value;
    const businessExpenses = document.getElementById('businessExpenses').value;
    const profitMargin = document.getElementById('profitMargin').value;
    
    // Get calculated results (remove currency formatting for CSV)
    const suggestedRate = document.getElementById('suggestedRate').textContent.replace('$', '').replace(',', '');
    const rateBeforeProfit = document.getElementById('rateBeforeProfit').textContent.replace('$', '').replace(',', '');
    const profitAmount = document.getElementById('profitAmount').textContent.replace('$', '').replace(',', '');

    const csvContent = `Freelancer Hourly Rate Calculation Report
Generated on: ${new Date().toLocaleDateString()}

INPUT PARAMETERS
Parameter,Value
Desired Annual Income,$${desiredIncome}
Annual Billable Hours,${billableHours}
Annual Business Expenses,$${businessExpenses}
Desired Profit Margin,${profitMargin}%

CALCULATION RESULTS
Component,Amount
Rate Before Profit,$${rateBeforeProfit}
Profit Amount,$${profitAmount}
Suggested Hourly Rate,$${suggestedRate}

Generated by Freelance Financial Toolkit
Contact: toolkitfreelance@gmail.com`;

    downloadCSV(csvContent, 'hourly-rate-calculation.csv');
}

/**
 * Export project profit results to CSV
 */
function exportProjectProfitToCSV() {
    const results = document.getElementById('projectProfitResults');
    if (!results || results.style.display === 'none') {
        showAlert('Please calculate project profitability first before exporting.', 'warning');
        return;
    }

    // Get input values
    const projectRevenue = document.getElementById('projectRevenue').value;
    const projectCosts = document.getElementById('projectCosts').value;
    
    // Get calculated results
    const netProfit = document.getElementById('netProfit').textContent.replace('$', '').replace(',', '');
    const profitMargin = document.getElementById('profitMarginResult').textContent.replace('%', '');
    const profitabilityMessage = document.getElementById('profitabilityMessage').textContent;

    const csvContent = `Project Profitability Analysis Report
Generated on: ${new Date().toLocaleDateString()}

PROJECT DETAILS
Parameter,Value
Project Revenue,$${projectRevenue}
Project Costs,$${projectCosts}

PROFITABILITY RESULTS
Metric,Value
Net Profit,$${netProfit}
Profit Margin,${profitMargin}%

ANALYSIS
${profitabilityMessage}

Generated by Freelance Financial Toolkit
Contact: toolkitfreelance@gmail.com`;

    downloadCSV(csvContent, 'project-profitability-analysis.csv');
}

/**
 * Download CSV content as file
 * @param {string} content - CSV content
 * @param {string} filename - File name
 */
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Spreadsheet exported successfully!', 'success');
    } else {
        showAlert('Export not supported in this browser.', 'danger');
    }
}

// Export functions for testing (if in a module environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatPercentage,
        validateNumericInput,
        calculateHourlyRate,
        calculateProjectProfit,
        resetHourlyRateForm,
        resetProjectProfitForm,
        exportToPDF,
        exportToSpreadsheet
    };
}
