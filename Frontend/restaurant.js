const STORAGE_CART = "ht_restaurant_cart";
const STORAGE_SERVICE = "ht_restaurant_service";

const MENU_ITEMS = {
  desayuno_nica: { name: "Desayuno Nica", price: 250 },
  sopa_mariscos: { name: "Sopa de Mariscos", price: 450 },
  pasta_alfredo: { name: "Pasta Alfredo", price: 380 },
  filete_res: { name: "Filete de Res", price: 600 },
  brownie: { name: "Brownie con Helado", price: 180 },
  mojito: { name: "Mojito Cero Alcohol", price: 150 },
};

function formatMoney(value) {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
  }).format(value);
}

function readCart() {
  return JSON.parse(localStorage.getItem(STORAGE_CART)) || [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
}

function addItem(itemId) {
  const item = MENU_ITEMS[itemId];
  if (!item) return;
  const cart = readCart();
  const existing = cart.find(entry => entry.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: itemId, name: item.name, price: item.price, quantity: 1 });
  }
  saveCart(cart);
  renderCart();
}

function updateQuantity(id, delta) {
  let cart = readCart();
  const index = cart.findIndex(entry => entry.id === id);
  if (index !== -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = readCart();
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center">El carrito está vacío.</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div><strong>${item.name}</strong><br>${formatMoney(item.price)}</div>
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-dark" onclick="updateQuantity('${item.id}', -1)">-</button>
          <span class="mx-2">${item.quantity}</span>
          <button class="btn btn-sm btn-outline-dark" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join("");
  }
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = formatMoney(total);
  if (cartCount) cartCount.textContent = `${cart.length} producto(s)`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-item]").forEach(btn => {
    btn.addEventListener("click", () => addItem(btn.dataset.item));
  });

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_CART);
      renderCart();
    });
  }
  renderCart();
});