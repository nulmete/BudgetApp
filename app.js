// Data Module
const budgetController = (function() {
    class Element {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    class Income extends Element {
        constructor(id, description, value) {
            super(id, description, value);
        }
    }

    class Expense extends Element {
        constructor(id, description, value, percentage) {
            super(id, description, value);
            this.percentage = percentage;
        }

        calculatePercentage(totalIncome) {
            this.percentage = totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
        }

        getPercentage() {
            return this.percentage;
        }
    }

    const data = {
        allItems: {
            income: [],
            expense: []
        },

        totals: {
            income: 0,
            expense: 0
        },

        budget: 0,
        percentage: -1
    }

    const calculateTotals = function(type) {
        data.totals[type] = data.allItems[type].reduce((acum, current) => acum + current.value, 0);
    }

    // Public methods
    return {
        addItem(type, description, value) {
            // Last item's id + 1
            const itemId = data.allItems[type].length ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;

            // Create new instance of Income/Expense
            if (type === "income") {
                newItem = new Income(itemId, description, value);
            } else if (type === "expense") {
                newItem = new Expense(itemId, description, value);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget() {
            calculateTotals('income');
            calculateTotals('expense');

            data.budget = data.totals.income - data.totals.expense;

            // Calculate % of income spent
            data.percentage = data.totals.income > 0 ? Math.round((data.totals.expense / data.totals.income) * 100) : -1;
        },

        getBudget() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpenses: data.totals.expense,
                percentage: data.percentage
            }
        },

        calculatePercentages() {
            data.allItems.expense.forEach(current => current.calculatePercentage(data.totals.income));
        },

        getPercentages() {
            return percentages = data.allItems.expense.map(current => current.getPercentage());
        },
        

        deleteItem(type, id) {
            const index = data.allItems[type].findIndex(element => element.id === id);

            // if the id of the element is found, delete it
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        test() {
            console.log(data);
        }
    }

})();

// UI Module
const UIController = (function() {
    
    const DOMStrings = {
        inputType: '.input__type',
        inputDescription: '.input__description',
        inputValue: '.input__value',
        inputAdd: '.input__add',
        inputAddBtn: '.input__add-btn',
        incomeList: '.income .item-list',
        expensesList: '.expenses .item-list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income-value',
        expensesLabel: '.budget__expenses-value',
        percentageLabel: '.budget__expenses-percentage',
        expensePercentageLabel: '.item__percentage',
        removeBtn: '.item__remove-btn',
        container: '.container',
        budgetTitle: '.budget__title--date'
    }

    // Format like this: 2000 -> 2,000.00
    const formatNumber = function(num, type) {
        num = Math.abs(num); // prevent double '-' in the budget label
        num = num.toFixed(2);
        num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return (type === 'income' ? '+ ' : '- ') + num;
    };

    // Public methods
    return {
        getDOMStrings() {
            return DOMStrings;
        },

        getInput() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // "income" or "expense" (html)
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addItem(newItemObj, type) {
            let html, element;

            if (type === "income") {
                element = DOMStrings.incomeList;

                html = `
                    <li class="item" id="${type}-${newItemObj.id}">
                        <div class="item__description">${newItemObj.description}</div>
                        <div class="item__value">${formatNumber(newItemObj.value, type)}</div>
                        <button class="item__remove">
                            <svg class="item__remove-btn">
                                <use xlink:href="img/symbol-defs.svg#icon-delete-outline"></use>
                            </svg>
                        </button>
                    </li>
                `;
            } else if (type === "expense") {
                element = DOMStrings.expensesList;

                html = `
                    <li class="item" id="${type}-${newItemObj.id}">
                        <div class="item__description">${newItemObj.description}</div>
                        <div class="item__value">${formatNumber(newItemObj.value, type)}</div>
                        <div class="item__percentage">10%</div>

                        <button class="item__remove">
                            <svg class="item__remove-btn">
                                <use xlink:href="img/symbol-defs.svg#icon-delete-outline"></use>
                            </svg>
                        </button>
                    </li>
                `;
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        clearInputFields() {
            const fields = Array.from(document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`)); // NodeList to Array

            fields.forEach(current => current.value = '');

            fields[0].focus(); // Set focus back on the description input
        },

        displayBudget(budgetObj) {
            const type = budgetObj.budget > 0 ? 'income' : 'expense';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(budgetObj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(budgetObj.totalIncome, 'income');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(budgetObj.totalExpenses, 'expense');

            document.querySelector(DOMStrings.percentageLabel).textContent = budgetObj.percentage > 0
                ? budgetObj.percentage + '%'
                : '---';
        },

        displayPercentages(percentages) {
            const expenseItems = Array.from(document.querySelectorAll(DOMStrings.expensePercentageLabel)); // NodeList to Array
            
            expenseItems.forEach((current, index) => current.textContent = percentages[index] > 0 ? percentages[index] + '%' : '---');
        },

        deleteItem(id) {
            const li = document.getElementById(id);

            li.parentNode.removeChild(li);
        },

        displayDate() {
            const year = new Date().getFullYear();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const month = months[new Date().getMonth()];
            
            document.querySelector(DOMStrings.budgetTitle).textContent = `${month}, ${year}`;
        },

        changeType() {
            const fields = Array.from(document.querySelectorAll(`
                ${DOMStrings.inputType},
                ${DOMStrings.inputDescription},
                ${DOMStrings.inputValue}
            `)); // NodeList to Array
    
            fields.forEach(current => current.classList.toggle('red-focus'));
    
            document.querySelector(DOMStrings.inputAddBtn).classList.toggle('red');
        }
    }
})();

// Global App Module (link between Data and UI Modules)
const appController = (function(budgetCtrl, UICtrl) {

    const setEventListeners = function() {
        const DOM = UICtrl.getDOMStrings();

        // Add item when user clicks on the input button
        document.querySelector(DOM.inputAdd).addEventListener('click', addItem);

        // Add item when user presses Enter
        document.addEventListener('keypress', event => {
            if (event.key === 'Enter') addItem();
        });

        // Delete item when user clicks on the remove button
        // Event delegation - set the event listener on the container for income and expenses, since the li (every single expense or income item)
        // is not on the DOM from the beginning
        document.querySelector(DOM.container).addEventListener('click', deleteItem);

        // Change outline of input fields according to the type of item that user wants to add (income or expense)
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    const updateBudget = function() {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Get budget
        const budget = budgetCtrl.getBudget();

        // 3. Display budget
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = function() {
        // 1. Calculate percentages for each expense item
        budgetCtrl.calculatePercentages();

        // 2. Get percentages
        const percentages = budgetCtrl.getPercentages();

        // 3. Display percentages
        UICtrl.displayPercentages(percentages);
    }

    const addItem = function() {
        // 1. Get input values
        const input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to data structure
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // 3. Add item to UI
            UICtrl.addItem(newItem, input.type);
    
            // 4. Clear input fields
            UICtrl.clearInputFields();
    
            // 5. Calculate and display budget
            updateBudget();

            // 6. Update percentages
            updatePercentages();
        }
    }

    const deleteItem = function(event) {
        // The only element that has an id in the DOM is the <li> element
        const itemId = event.target.parentNode.parentNode.id;

        if (itemId) {
            const splitItemId = itemId.split('-');
            const [type, id] = [splitItemId[0], parseInt(splitItemId[1])];
            
            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, id);

            // 2. Delete item from UI
            UICtrl.deleteItem(itemId);

            // 3. Update budget
            updateBudget();

            // 4. Update percentages (when an income item is deleted)
            updatePercentages();
        }
    }

    // Public methods
    return {
        init() {
            console.log('Application has started!');

            UICtrl.displayDate();

            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });

            setEventListeners();
        }
    }

})(budgetController, UIController);

// Start application
appController.init();