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
var customerNameInput = document.getElementById('customerName');
var customerEmailInput = document.getElementById('customerEmail');
var customerPhoneInput = document.getElementById('customerPhone');
var summaryNote = document.getElementById('summaryNote');

var paystackPublicKey = 'pk_test_1e391a796f7c1e19eae9431fe3222a5839fe1e1f';

// convert number to text with the Ghana cedi symbol
function formatCurrency(amount) {
    return '₵' + amount.toLocaleString();
}

// update the number that shows how many items are in the cart
function updateCartCount() {
    var count = 0;
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        count = count + cart[id].quantity;
    }
    cartCount.textContent = count;
}

// change all product buttons to show add or remove
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

// show the cart popup
function openCartModal() {
    cartModalOverlay.classList.remove('hidden');
}

// hide the cart popup
function closeCartModalWindow() {
    cartModalOverlay.classList.add('hidden');
}

// show the order summary popup
function openSummaryModal() {
    summaryModalOverlay.classList.remove('hidden');
}

// hide the order summary popup
function closeSummaryModal() {
    summaryModalOverlay.classList.add('hidden');
}

// draw the cart rows inside the cart table
function renderCart() {
    cartItemsBody.innerHTML = '';
    var keys = Object.keys(cart);
    var totalPrice = 0;

    if (keys.length === 0) {
        cartItemsBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem 0; color:#6c6c6c;">Your cart is empty</td></tr>';
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
            '<td><button class="remove-btn" data-action="remove" data-id="' + item.id + '">Remove</button></td>';
        cartItemsBody.appendChild(row);
        totalPrice = totalPrice + item.price * item.quantity;
    }

    cartTotal.textContent = formatCurrency(totalPrice);
}

// calculate the cart total amount in ghana cedis
function getCartTotalAmount() {
    var keys = Object.keys(cart);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
        var item = cart[keys[i]];
        total = total + item.price * item.quantity;
    }
    return total;
}

// start Paystack payment popup and handle success
function startPaystackPayment() {
    var customerName = customerNameInput.value.trim();
    var customerEmail = customerEmailInput.value.trim();
    var totalAmount = getCartTotalAmount();

    if (customerName === '') {
        alert('Please enter your name before payment.');
        return;
    }
    if (customerEmail === '') {
        alert('Please enter your email before payment.');
        return;
    }
    if (totalAmount === 0) {
        alert('Your cart is empty. Add items before payment.');
        return;
    }
    if (typeof PaystackPop === 'undefined') {
        alert('Paystack is not loaded. Refresh the page and try again.');
        return;
    }

    var handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: customerEmail,
        amount: totalAmount * 100,
        currency: 'GHS',
        ref: 'EMS' + Math.floor((Math.random() * 1000000000) + 1),
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
                    value: customerPhoneInput.value.trim()
                }
            ]
        },
        callback: function (response) {
            summaryNote.textContent = 'Payment successful! Transaction ref: ' + response.reference;
            renderSummary();
            closeCartModalWindow();
            openSummaryModal();
        },
        onClose: function () {
            alert('Payment window was closed. You can try again when ready.');
        }
    });
    handler.openIframe();
}

// add item to cart or remove it if it is already there
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

// change quantity for one cart item
function changeQuantity(productId, change) {
    if (!cart[productId]) {
        return;
    }
    var newQuantity = cart[productId].quantity + change;
    if (newQuantity < 1) {
        newQuantity = 1;
    }
    cart[productId].quantity = newQuantity;
    renderCart();
    updateCartCount();
}

// remove one item from the cart completely
function removeProduct(productId) {
    if (!cart[productId]) {
        return;
    }
    delete cart[productId];
    updateCartCount();
    updateProductButtons();
    renderCart();
}

// show the customer name and items in the summary popup
function renderSummary() {
    summaryRows.innerHTML = '';
    var customerName = customerNameInput.value.trim();
    if (customerName === '') {
        customerName = 'Customer';
    }
    summaryName.textContent = customerName;

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

// empty the cart after checkout
function clearCart() {
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
        delete cart[keys[i]];
    }
    updateCartCount();
    renderCart();
    updateProductButtons();
}

function init() {
    var buttons = document.querySelectorAll('.cart-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            var id = this.getAttribute('data-product-id');
            toggleProductInCart(id);
        });
    }

    cartIcon.addEventListener('click', function () {
        renderCart();
        openCartModal();
    });

    closeCartModal.addEventListener('click', closeCartModalWindow);
    continueBtn.addEventListener('click', closeCartModalWindow);

    checkoutBtn.addEventListener('click', function () {
        startPaystackPayment();
    });

    summaryOkBtn.addEventListener('click', function () {
        closeSummaryModal();
        clearCart();
    });

    cartItemsBody.addEventListener('click', function (event) {
        var action = event.target.getAttribute('data-action');
        var id = event.target.getAttribute('data-id');
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

    cartModalOverlay.addEventListener('click', function (event) {
        if (event.target === cartModalOverlay) {
            closeCartModalWindow();
        }
    });

    summaryModalOverlay.addEventListener('click', function (event) {
        if (event.target === summaryModalOverlay) {
            closeSummaryModal();
        }
    });

    updateCartCount();
    updateProductButtons();
}

init();
