// Module that handles budget data
var budgetController = (function() {

    

})();

// Module that updates the UI
var UIController = (function() {

    // Store the classnames of the DOM elements that are selected with querySelector
    // If the HTML changes, just change the names here, instead of changing it in the entire code
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
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

        // 1. Get input data
        var input = UICtrl.getInput();
        console.log(input);

        // 2. Add item to the budgetController

        // 3. Add item to UI

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