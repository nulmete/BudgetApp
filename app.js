// Module that handles budget data
var budgetController = (function() {

    // Data structure of Expenses and Incomes
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // Store data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    }

    // 'Public' Object assigned to budgetController
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            // Create new ID (last item's ID + 1)
            ID = data.allItems[type].length ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Add new item to data structure
            data.allItems[type].push(newItem);

            // Return the new item (Expense / Income instance)
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // Get a new array with all the IDs of each element
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            // Get index of the element with a certain ID
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            } 

        },

        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();

// Module that updates the UI
var UIController = (function() {

    // Store the classnames of the DOM elements that are selected with querySelector
    // If the HTML changes, just change the names here, instead of changing it in the entire code
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    // 'Public' Object assigned to UIController
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        // obj = newItem created (Expense / Income instance)
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text
            if (type === 'inc') { 
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // NodeList to Array
            fieldsArray = Array.prototype.slice.call(fields);

            // Clear input fields
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            // Set focus back to the description field
            fieldsArray[0].focus();
        },

        // obj = budget object returned from budgetCtrl.getBudget()
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {   
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    }

})();

// Module that connects the budgetController and the UIController
var controller = (function(budgetCtrl, UICtrl) {

    // Previously, the event listeners were not inside a function, so they were set when the IIFE was executed
    // Now, this function has to be called so that they are set
    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // The keypress event happens on the page, not on a specific element
        document.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') ctrlAddItem();
        });

        // Event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate the budget
            // 6. Display the budget on the UI
            // These go together in the updateBudget function
            updateBudget();
        }
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // itemID = type-id (from the data.allItems structure)
        // with the type we can access the 'inc' and 'exp' arrays, and then delete the corresponding item based on its 'id'
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete item from UI


            // Update and display new budget
        }
    }

    // 'Public' Object assigned to controller
    return {
        init: function() {
            console.log('Application has started');

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();