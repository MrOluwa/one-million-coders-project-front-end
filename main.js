var products = [
    { id: '1', name: 'SAMSUNG TV', price: 899 },
    { id: '2', name: 'PIXEL 4A', price: 449 },
    { id: '3', name: 'PS 5', price: 499 },
    { id: '4', name: 'MACBOOK AIR', price: 999 },
    { id: '5', name: 'APPLE WATCH', price: 349 },
    { id: '6', name: 'AIR PODS', price: 199 }
];

var cart = {};

var cartCount = document.querySelector('.cart-count');
var cartIcon = document.querySelector('.cart-box');
var cartModalOverlay = document.getElementById('cartModalOverlay');
var cartItemsBody = document.getElementById('cartItemsBody');
var cartTotal = document.getElementById('cartTotal');
var continueBtn = document.getElementById('continueBtn');
var checkoutBtn = document.getElementById('checkoutBtn');
var closeCartModal = document.getElementById('closeCartModal');

var summaryModalOverlay = document.getElementById('summaryModalOverlay');
var summaryOkBtn = document.getElementById('summaryOkBtn');
var summaryName = document.getElementById('summaryName');
var summaryRows = document.getElementById('summaryRows');
var summaryNote = document.getElementById('summaryNote');

var customerNameInput = document.getElementById('customerName');
var customerEmailInput = document.getElementById('customerEmail');
var customerPhoneInput = document.getElementById('customerPhone');

var paystackPublicKey =
    'pk_test_1e391a796f7c1e19eae9431fe3222a5839fe1e1f';


// FORMAT CURRENCY
function formatCurrency(amount) {

    return '₵' + amount.toLocaleString();

}

// UPDATE CART COUNT
function updateCartCount() {

    // Count only products
    var count = Object.keys(cart).length;

    cartCount.textContent = count;
}

// UPDATE BUTTON STATES
function updateProductButtons() {

    var buttons = document.querySelectorAll('.cart-btn');
    for (var i = 0; i < buttons.length; i++) {

        var button = buttons[i];

        var id = button.getAttribute('data-product-id');
        if (cart[id]) {
            button.textContent = 'REMOVE FROM CART';
            button.classList.add('remove-state');
        } else {

            button.textContent = 'ADD TO CART';
            button.classList.remove('remove-state');
        }
    }
}

// OPEN CART
function openCartModal() {
    cartModalOverlay.classList.remove('hidden');
}

// CLOSE CART
function closeCartModalWindow() {
    cartModalOverlay.classList.add('hidden');
}

// OPEN SUMMARY
function openSummaryModal() {
    summaryModalOverlay.classList.remove('hidden');
}

// CLOSE SUMMARY
function closeSummaryModal() {
    summaryModalOverlay.classList.add('hidden');
}

// RENDER CART
function renderCart() {
    cartItemsBody.innerHTML = '';
    var keys = Object.keys(cart);
    var totalPrice = 0;
    if (keys.length === 0) {
        cartItemsBody.innerHTML =
            '<tr>' +
            '<td colspan="5" style="text-align:center; padding:1.5rem 0; color:#6c6c6c;">' +
            'Your cart is empty' +
            '</td>' +
            '</tr>';

        cartTotal.textContent = formatCurrency(0);
        return;

    }

    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        var item = cart[id];
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + (i + 1) + '</td>' +
            '<td>' + item.name + '</td>' +
            '<td>' + formatCurrency(item.price) + '</td>' +
            '<td>' +
            '<div class="quantity-controls">' +
            '<button data-action="decrease" data-id="' + item.id + '">-</button>' +
            '<span>' + item.quantity + '</span>' +
            '<button data-action="increase" data-id="' + item.id + '">+</button>' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<button class="remove-btn" data-action="remove" data-id="' + item.id + '">' +
            'Remove' +
            '</button>' +
            '</td>';

        cartItemsBody.appendChild(row);

        totalPrice =
            totalPrice + (item.price * item.quantity);
    }

    cartTotal.textContent =
        formatCurrency(totalPrice);
}

// GET TOTAL AMOUNT
function getCartTotalAmount() {
    var keys = Object.keys(cart);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
        var item = cart[keys[i]];
        total =
            total + (item.price * item.quantity);

    }
    return total;
}

// START PAYMENT
function startPaystackPayment() {
    var customerName =
        customerNameInput.value.trim();
    var customerEmail =
        customerEmailInput.value.trim();
    var customerPhone =
        customerPhoneInput.value.trim();
    var totalAmount =
        getCartTotalAmount();

    // NAME VALIDATION
    if (customerName === '') {

        alert('Please enter your name before payment.');
        return;
    }

    // EMAIL VALIDATION
    if (customerEmail === '') {
        alert('Please enter your email before payment.');
        return;
    }

    // PHONE EMPTY
    if (customerPhone === '') {
        alert('Please enter your number before payment.');
        return;
    }

    // PHONE STARTS WITH 233
    if (!customerPhone.startsWith('233')) {
        alert('Phone number must start with 233');
        return;
    }

    // PHONE LENGTH
    if (customerPhone.length !== 12) {
        alert('Phone number must be exactly 12 digits');
        return;
    }

    // ONLY NUMBERS
    if (isNaN(customerPhone)) {
        alert('Phone number must contain only numbers');
        return;
    }

    // EMPTY CART
    if (totalAmount === 0) {
        alert('Your cart is empty. Add items before payment.');
        return;

    }

    // PAYSTACK CHECK
    if (typeof PaystackPop === 'undefined') {
        alert('Paystack is not loaded. Refresh the page and try again.');
        return;
    }

    // START PAYSTACK
    var handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: customerEmail,
        amount: totalAmount * 100,
        currency: 'GHS',
        ref:
            'EMS' +
            Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: 'Customer Name',
                    variable_name: 'customer_name',
                    value: customerName
                },

                {
                    display_name: 'Phone Number',
                    variable_name: 'customer_phone',
                    value: customerPhone
                }
            ]
        },

        callback: function (response) {

            // PAYMENT SUCCESS
            summaryNote.textContent =
                'Payment successful! Transaction ref: ' +
                response.reference;

            // SHOW SUMMARY
            renderSummary();

            // CLOSE CART
            closeCartModalWindow();

            // OPEN SUMMARY
            openSummaryModal();
        },

        onClose: function () {
            alert(
                'Payment window was closed. You can try again when ready.'
            );
        }
    });

    handler.openIframe();
}

// ADD OR REMOVE PRODUCT
function toggleProductInCart(productId) {
    var found = null;

    for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            found = products[i];
            break;
        }
    }

    if (!found) {
        return;
    }

    if (cart[productId]) {
        delete cart[productId];
    } else {

        cart[productId] = {
            id: found.id,
            name: found.name,
            price: found.price,
            quantity: 1
        };
    }

    updateCartCount();
    updateProductButtons();
    renderCart();
}

// CHANGE QUANTITY
function changeQuantity(productId, change) {
    if (!cart[productId]) {
        return;
    }

    var newQuantity =
        cart[productId].quantity + change;

    if (newQuantity < 1) {
        newQuantity = 1;
    }

    cart[productId].quantity =
        newQuantity;
    renderCart();
    updateCartCount();
}

// REMOVE PRODUCT
function removeProduct(productId) {
    if (!cart[productId]) {
        return;
    }

    delete cart[productId];
    updateCartCount();
    updateProductButtons();
    renderCart();
}

// RENDER SUMMARY
function renderSummary() {
    summaryRows.innerHTML = '';
    var customerName =
        customerNameInput.value.trim();
    if (customerName === '') {
        customerName = 'Customer';
    }

    summaryName.textContent =
        customerName;

    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        var item = cart[id];
        var row = document.createElement('div');
        row.className = 'summary-row';
        row.innerHTML =
            '<span>' + (i + 1) + '</span>' +
            '<span>' + item.name + '</span>' +
            '<span>' + item.quantity + '</span>';
        summaryRows.appendChild(row);
    }
}

// CLEAR CART
function clearCart() {
    cart = {};
    updateCartCount();
    renderCart();
    updateProductButtons();
}

// INITIALIZE
function init() {
    var buttons =
        document.querySelectorAll('.cart-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener(
            'click',
            function () {
                var id =
                    this.getAttribute('data-product-id');
                toggleProductInCart(id);
            }
        );
    }

    // OPEN CART
    cartIcon.addEventListener('click', function () {
        renderCart();
        openCartModal();
    });


    // CLOSE CART
    closeCartModal.addEventListener(
        'click',
        closeCartModalWindow
    );
    continueBtn.addEventListener(
        'click',
        closeCartModalWindow
    );

    // CHECKOUT
    checkoutBtn.addEventListener('click', function () {
        startPaystackPayment();
    });

    // SUMMARY OK BUTTON
    summaryOkBtn.addEventListener('click', function () {
        // CLOSE SUMMARY
        closeSummaryModal();
        // CLEAR CART
        clearCart();
        // REFRESH WEBSITE
        location.reload();
    });

    // CART ACTIONS
    cartItemsBody.addEventListener('click', function (event) {
        var action =
            event.target.getAttribute('data-action');
        var id =
            event.target.getAttribute('data-id');
        if (!action || !id) {
            return;
        }

        if (action === 'increase') {
            changeQuantity(id, 1);
        }

        if (action === 'decrease') {
            changeQuantity(id, -1);
        }

        if (action === 'remove') {
            removeProduct(id);
        }
    });

    // CLOSE CART OVERLAY
    cartModalOverlay.addEventListener('click', function (event) {
        if (event.target === cartModalOverlay) {
            closeCartModalWindow();
        }
    });

    // CLOSE SUMMARY OVERLAY
    summaryModalOverlay.addEventListener('click', function (event) {
        if (event.target === summaryModalOverlay) {
            closeSummaryModal();
        }
    });

    // INITIAL UPDATE
    updateCartCount();
    updateProductButtons();
}

// START APP
init();