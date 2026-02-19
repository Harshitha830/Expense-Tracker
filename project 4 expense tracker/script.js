let transactions = [];
let pieChart, barChart;
let currentYearStart = new Date().getFullYear() - 9;
let selectedYear = 'all';
let selectedMonth = 'all';

// Load transactions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setTodayDate();
    populateYearGrid();
    populateMonthGrid();
    displayTransactions();
    updateDashboard();
    renderCharts();
});

// Set today's date as default
function setTodayDate() {
    document.getElementById('date').valueAsDate = new Date();
}

// Load from localStorage
function loadTransactions() {
    const data = localStorage.getItem('transactions');
    if (data) {
        transactions = JSON.parse(data);
    }
}

// Save to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Add transaction
document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: document.getElementById('type').value,
        title: document.getElementById('title').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        paymentMode: document.getElementById('paymentMode').value
    };
    
    transactions.push(transaction);
    saveTransactions();
    displayTransactions();
    updateDashboard();
    renderCharts();
    
    document.getElementById('transactionForm').reset();
    setTodayDate();
});

// Display transactions
function displayTransactions() {
    const tbody = document.getElementById('transactionList');
    const filterCategory = document.getElementById('filterCategory').value;
    const searchTitle = document.getElementById('searchTitle').value.toLowerCase();
    
    let filtered = transactions.filter(t => {
        const matchCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchYear = selectedYear === 'all' || t.date.substring(0, 4) === selectedYear;
        const matchMonth = selectedMonth === 'all' || t.date.substring(5, 7) === selectedMonth;
        const matchTitle = t.title.toLowerCase().includes(searchTitle);
        return matchCategory && matchYear && matchMonth && matchTitle;
    });
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = filtered.map(t => `
        <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.title}</td>
            <td>${t.category}</td>
            <td class="type-${t.type}">${t.type.toUpperCase()}</td>
            <td>₹${t.amount}</td>
            <td>${t.paymentMode}</td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    displayTransactions();
    updateDashboard();
    renderCharts();
}

// Update dashboard
function updateDashboard() {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expense += t.amount;
        }
    });
    
    const balance = income - expense;
    
    document.getElementById('totalIncome').textContent = `₹${income}`;
    document.getElementById('totalExpense').textContent = `₹${expense}`;
    document.getElementById('balance').textContent = `₹${balance}`;
}

// Populate year grid
function populateYearGrid() {
    const grid = document.getElementById('yearGrid');
    grid.innerHTML = '<div class="year-box active" data-year="all">All</div>';
    
    for (let i = 0; i < 10; i++) {
        const year = currentYearStart + i;
        const yearBox = document.createElement('div');
        yearBox.className = 'year-box';
        yearBox.textContent = year;
        yearBox.dataset.year = year;
        yearBox.addEventListener('click', () => selectYear(year.toString()));
        grid.appendChild(yearBox);
    }
    
    // Add All Years click handler
    grid.firstChild.addEventListener('click', () => selectYear('all'));
}

// Populate month grid
function populateMonthGrid() {
    const grid = document.getElementById('monthGrid');
    const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthValues = ['all', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    grid.innerHTML = '';
    months.forEach((month, index) => {
        const monthBox = document.createElement('div');
        monthBox.className = index === 0 ? 'month-box active' : 'month-box';
        monthBox.textContent = month;
        monthBox.dataset.month = monthValues[index];
        monthBox.addEventListener('click', () => selectMonth(monthValues[index]));
        grid.appendChild(monthBox);
    });
}

// Select year
function selectYear(year) {
    selectedYear = year;
    const label = year === 'all' ? 'All Years' : year;
    document.getElementById('yearLabel').textContent = label;
    document.querySelectorAll('.year-box').forEach(box => {
        box.classList.toggle('active', box.dataset.year === year);
    });
    document.getElementById('yearDropdown').style.display = 'none';
    document.querySelector('#yearHeader .arrow').textContent = '▼';
    displayTransactions();
}

// Select month
function selectMonth(month) {
    selectedMonth = month;
    const monthNames = {
        'all': 'All Months', '01': 'January', '02': 'February', '03': 'March',
        '04': 'April', '05': 'May', '06': 'June', '07': 'July',
        '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    document.getElementById('monthLabel').textContent = monthNames[month];
    document.querySelectorAll('.month-box').forEach(box => {
        box.classList.toggle('active', box.dataset.month === month);
    });
    document.getElementById('monthDropdown').style.display = 'none';
    document.querySelector('#monthHeader .arrow').textContent = '▼';
    displayTransactions();
}

// Toggle year dropdown
document.getElementById('yearHeader').addEventListener('click', () => {
    const dropdown = document.getElementById('yearDropdown');
    const arrow = document.querySelector('#yearHeader .arrow');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        dropdown.style.display = 'none';
        arrow.textContent = '▼';
    }
});

// Toggle month dropdown
document.getElementById('monthHeader').addEventListener('click', () => {
    const dropdown = document.getElementById('monthDropdown');
    const arrow = document.querySelector('#monthHeader .arrow');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        dropdown.style.display = 'none';
        arrow.textContent = '▼';
    }
});

// Year navigation
document.getElementById('yearPrev').addEventListener('click', () => {
    currentYearStart -= 10;
    populateYearGrid();
});

document.getElementById('yearNext').addEventListener('click', () => {
    currentYearStart += 10;
    populateYearGrid();
});

// Filter listeners
document.getElementById('filterCategory').addEventListener('change', displayTransactions);
document.getElementById('searchTitle').addEventListener('input', displayTransactions);

// Render charts
function renderCharts() {
    renderPieChart();
    renderBarChart();
}

// Pie chart - Category wise expenses
function renderPieChart() {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryData = {};
    
    expenses.forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Bar chart - Monthly summary
function renderBarChart() {
    const monthlyData = {};
    
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyData[month].income += t.amount;
        } else {
            monthlyData[month].expense += t.amount;
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(m => monthlyData[m].income);
    const expenseData = months.map(m => monthlyData[m].expense);
    
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => {
                const date = new Date(m + '-01');
                return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: '#f44336'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
