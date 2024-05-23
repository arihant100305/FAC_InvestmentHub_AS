function analyzeBalanceSheet() {
    const fileInput = document.getElementById('balance-sheet-upload');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const data = parseCSV(content);
            if (data) {
                const ratios = calculateRatios(data);
                if (ratios) {
                    displayRatios(ratios);
                } else {
                    alert('Insufficient data to calculate ratios.');
                }
            } else {
                alert('Failed to parse CSV data.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a CSV file.');
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const data = {};

    for (let i = 1; i < lines.length; i++) {
        const [key, value] = lines[i].split(',');
        if (key && value) {
            data[key.trim()] = parseFloat(value.trim());
        } else {
            return null; // Invalid CSV format
        }
    }
    
    return data;
}

function calculateRatios(data) {
    if (
        data['Current Assets'] !== undefined &&
        data['Current Liabilities'] !== undefined &&
        data['Total Liabilities'] !== undefined &&
        data['Total Equity'] !== undefined &&
        data['Net Income'] !== undefined
    ) {
        const ratios = {};
        ratios['liquidityRatio'] = (data['Current Assets'] / data['Current Liabilities']).toFixed(2);
        ratios['debtToEquityRatio'] = (data['Total Liabilities'] / data['Total Equity']).toFixed(2);
        ratios['profitabilityRatio'] = (data['Net Income'] / data['Total Equity']).toFixed(2);
        return ratios;
    } else {
        return null; // Insufficient data to calculate ratios
    }
}

function displayRatios(ratios) {
    const resultElement = document.getElementById('ratio-result');
    resultElement.innerHTML = `<p>Liquidity Ratio: ${ratios.liquidityRatio}</p>
                                <p>Debt to Equity Ratio: ${ratios.debtToEquityRatio}</p>
                                <p>Profitability Ratio: ${ratios.profitabilityRatio}</p>`;
}

function calculateNPVFV() {
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
    const discountRate = parseFloat(document.getElementById('discount-rate').value);
    const periods = parseInt(document.getElementById('periods').value);

    const npv = calculateNPV(initialInvestment, discountRate, periods);
    const fv = calculateFV(initialInvestment, discountRate, periods);

    const npvResultElement = document.getElementById('npv-result');
    npvResultElement.textContent = `Net Present Value (NPV): $${npv.toFixed(2)}`;

    const fvResultElement = document.getElementById('fv-result');
    fvResultElement.textContent = `Future Value (FV): $${fv.toFixed(2)}`;
}

function calculateNPV(initialInvestment, discountRate, periods) {
    let npv = -initialInvestment; // Initial investment is considered as negative cash flow

    for (let i = 0; i < periods; i++) {
        npv += initialInvestment / Math.pow(1 + discountRate / 100, i + 1);
    }

    return npv;
}

function calculateFV(initialInvestment, discountRate, periods) {
    const fv = initialInvestment * Math.pow(1 + discountRate / 100, periods);

    return fv;
}


function analyzeData() {
    const fileInput = document.getElementById('data-upload');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const data = parseCSV(content);
            if (data) {
                plotClosingPriceChart(data);
                displayYearlyHighLow(data);
            } else {
                alert('Failed to parse CSV data.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a CSV file.');
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const data = {
        dates: [],
        closingPrices: []
    };

    for (let i = 1; i < lines.length; i++) {
        const [date, close] = lines[i].split(',');
        data.dates.push(date.trim());
        data.closingPrices.push(parseFloat(close.trim()));
    }
    
    return data;
}

function plotClosingPriceChart(data) {
    const ctx = document.getElementById('closing-price-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Closing Price',
                data: data.closingPrices,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            responsive: false, // Disable responsiveness
            maintainAspectRatio: false // Do not maintain aspect ratio
        }
    });
}

function displayYearlyHighLow(data) {
    const yearlyHighLowTable = document.getElementById('yearly-high-low-body');
    yearlyHighLowTable.innerHTML = '';

    const yearlyData = getYearlyHighLow(data);
    yearlyData.forEach(entry => {
        const row = `<tr><td>${entry.year}</td><td>${entry.high}</td><td>${entry.low}</td></tr>`;
        yearlyHighLowTable.innerHTML += row;
    });
}

function getYearlyHighLow(data) {
    const yearlyData = [];
    let currentYear = null;
    let yearlyHigh = -Infinity;
    let yearlyLow = Infinity;

    for (let i = 0; i < data.dates.length; i++) {
        const year = data.dates[i].substring(0, 4);
        const price = data.closingPrices[i];

        if (year !== currentYear) {
            if (currentYear !== null) {
                yearlyData.push({ year: currentYear, high: yearlyHigh, low: yearlyLow });
            }
            currentYear = year;
            yearlyHigh = -Infinity;
            yearlyLow = Infinity;
        }

        if (price > yearlyHigh) {
            yearlyHigh = price;
        }
        if (price < yearlyLow) {
            yearlyLow = price;
        }
    }

    // Add data for the last year
    if (currentYear !== null) {
        yearlyData.push({ year: currentYear, high: yearlyHigh, low: yearlyLow });
    }

    return yearlyData;
}
