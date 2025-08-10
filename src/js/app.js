document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing data for testing
    localStorage.clear();
    
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-display');
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let totalExpenses = 0;

    // Add console logs for debugging
    console.log('Form element:', expenseForm);
    console.log('List element:', expenseList);
    console.log('Total display element:', totalDisplay);

    // Load existing expenses
    function loadExpenses() {
        expenses.forEach(expense => {
            addExpenseToList(expense);
        });
        updateTotalDisplay();
    }

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Form submitted');

        const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
        const expenseDescription = document.getElementById('expense-description').value;
        const expenseCategory = document.getElementById('expense-category').value;
        const expenseDate = document.getElementById('expense-date').value;

        console.log('Form values:', {
            amount: expenseAmount,
            description: expenseDescription,
            category: expenseCategory,
            date: expenseDate
        });

        if (isNaN(expenseAmount) || expenseAmount <= 0 || !expenseDescription || !expenseCategory || !expenseDate) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const expense = {
            id: Date.now(),
            amount: expenseAmount,
            description: expenseDescription,
            category: expenseCategory,
            date: expenseDate
        };

        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        addExpenseToList(expense);
        updateTotalDisplay();
        expenseForm.reset();
    });

    function addExpenseToList(expense) {
        const listItem = document.createElement('li');
        listItem.className = 'expense-item';
        listItem.innerHTML = `
            <div class="expense-info">
                <span>${expense.description}</span>
                <span class="category-badge">${expense.category}</span>
                <span>${expense.date}</span>
                <span>₹${expense.amount.toFixed(2)}</span>
                <label class="waste-label">
                    <input type="checkbox" class="waste-checkbox" ${expense.isWaste ? 'checked' : ''}>
                    Unnecessary Expense
                </label>
            </div>
            <button class="delete-btn" data-id="${expense.id}">Delete</button>
        `;

        listItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteExpense(expense.id);
        });

        // Add waste tracking event listener
        const wasteCheckbox = listItem.querySelector('.waste-checkbox');
        wasteCheckbox.addEventListener('change', (e) => {
            expense.isWaste = e.target.checked;
            localStorage.setItem('expenses', JSON.stringify(expenses));
            analyzeMonthlyExpenses();
        });

        expenseList.appendChild(listItem);
        totalExpenses += expense.amount;
    }

    function deleteExpense(id) {
        const expenseIndex = expenses.findIndex(exp => exp.id === id);
        if (expenseIndex > -1) {
            totalExpenses -= expenses[expenseIndex].amount;
            expenses.splice(expenseIndex, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateTotalDisplay();
            expenseList.innerHTML = '';
            loadExpenses();
        }
    }

    function updateTotalDisplay() {
        totalDisplay.textContent = `Total Expenses: $${totalExpenses.toFixed(2)}`;
    }

    loadExpenses();
});

const themeToggle = document.getElementById('theme-toggle');
const icon = themeToggle.querySelector('i');

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    icon.classList.replace('fa-moon', 'fa-sun');
}

// Theme toggle handler
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Add these functions after your existing code before the closing DOMContentLoaded

function analyzeMonthlyExpenses() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter expenses for current month
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
    });

    // Category-wise analysis
    const categoryTotals = {};
    monthlyExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    // Calculate waste (expenses marked as unnecessary)
    const wastedMoney = monthlyExpenses
        .filter(expense => expense.isWaste)
        .reduce((total, expense) => total + expense.amount, 0);

    displayAnalysis(categoryTotals, wastedMoney);
}

function displayAnalysis(categoryTotals, wastedMoney) {
    const analysisDiv = document.getElementById('expense-analysis');
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[new Date().getMonth()];

    let analysisHTML = `
        <div class="analysis-card">
            <h2>${currentMonth} Expense Analysis</h2>
            <div class="category-breakdown">
                <h3>Category Breakdown:</h3>
                <ul>
    `;

    // Add category-wise breakdown
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const percentage = (amount / totalExpenses * 100).toFixed(1);
        analysisHTML += `
            <li>
                <span class="category-name">${category}</span>
                <span class="category-amount">₹${amount.toFixed(2)} (${percentage}%)</span>
            </li>
        `;
    }

    analysisHTML += `
                </ul>
            </div>
            <div class="waste-analysis">
                <h3>Waste Analysis:</h3>
                <p>Total Wasted Money: ₹${wastedMoney.toFixed(2)}</p>
                <p>Percentage of Total: ${((wastedMoney / totalExpenses) * 100).toFixed(1)}%</p>
            </div>
        </div>
    `;

    analysisDiv.innerHTML = analysisHTML;
}

// Add a button to trigger analysis
const analysisButton = document.createElement('button');
analysisButton.innerHTML = '<i class="fas fa-chart-pie"></i> Show Monthly Analysis';
analysisButton.className = 'analysis-btn';
analysisButton.addEventListener('click', analyzeMonthlyExpenses);
document.querySelector('.header').appendChild(analysisButton);

// Add analysis container
const analysisContainer = document.createElement('div');
analysisContainer.id = 'expense-analysis';
document.querySelector('.container').appendChild(analysisContainer);