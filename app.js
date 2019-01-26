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
        }
    }

    // Object assigned to budgetController
    // addItem() is accessible from other controllers
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
        expensesContainer: '.expenses__list'
    }

    // Public object (its methods can be accessed from other controllers)
    // The returned object is assigned to UIController
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: document.querySelector(DOMStrings.inputValue).value
            }
        },

        // obj = newItem created (Expense / Income instance)
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text

            if (type === 'inc') { 
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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

    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get input data
        input = UICtrl.getInput();

        // 2. Add item to the budgetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add item to UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Calculate the budget

        // 5. Display the budget on the UI

    }

    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();