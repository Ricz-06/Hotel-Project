const STORAGE_CART = "ht_restaurant_cart";
const STORAGE_SERVICE = "ht_restaurant_service";

const MENU_ITEMS = {
  desayuno_nica: {
    name: "Desayuno Nica",
    price: 8,
    description: "Gallo pinto, huevo, plátano y café.",
  },
  sopa_mariscos: {
    name: "Sopa de Mariscos",
    price: 14,
    description: "Caldo cremoso con mariscos frescos y especias.",
  },
  pasta_alfredo: {
    name: "Pasta Alfredo",
    price: 12,
    description: "Pasta con salsa cremosa, pollo y queso.",
  },
  filete_res: {
    name: "Filete de Res",
    price: 18,
    description: "Cocción a punto con guarnición premium.",
  },
  brownie: {
    name: "Brownie con Helado",
    price: 6,
    description: "Postre caliente con helado artesanal.",
  },
  mojito: {
    name: "Mojito Cero Alcohol",
    price: 5,
    description: "Refrescante bebida de menta y limón.",
  },
};

const SERVICE_LABELS = {
  mesa: "Mesa",
  llevar: "Para llevar",
  habitacion: "Servicio a habitación",
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CART)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
}

function getServiceMode() {
  return localStorage.getItem(STORAGE_SERVICE) || "mesa";
}

function setServiceMode(mode) {
  localStorage.setItem(STORAGE_SERVICE, mode);
}

function getItemSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getServiceRate(mode) {
  if (mode === "llevar") return 0.05;
  if (mode === "habitacion") return 0.12;
  return 0;
}

function addItem(itemId) {
  const item = MENU_ITEMS[itemId];
  if (!item) return;

  const cart = readCart();
  const existing = cart.find((entry) => entry.id === itemId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: itemId,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  }

  saveCart(cart);
  renderCart();
}

function updateQuantity(itemId, delta) {
  const cart = readCart();
  const index = cart.findIndex((entry) => entry.id === itemId);

  if (index === -1) return;

  cart[index].quantity += delta;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem(STORAGE_CART);
  renderCart();
}

function renderCart() {
  const cart = readCart();
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");
  const goBillingBtn = document.getElementById("goBillingBtn");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Tu pedido aún está vacío.</p>
        <span>Agrega platos para generar tu factura.</span>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item">
            <div>
              <h5>${item.name}</h5>
              <p>${formatMoney(item.price)} c/u</p>
            </div>
            <div class="cart-controls">
              <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
          </div>
        `
      )
      .join("");
  }

  const subtotal = getItemSubtotal(cart);
  if (cartTotal) cartTotal.textContent = formatMoney(subtotal);
  if (cartCount) cartCount.textContent = `${cart.length} producto${cart.length === 1 ? "" : "s"}`;

  if (goBillingBtn) {
    goBillingBtn.classList.toggle("disabled", cart.length === 0);
    goBillingBtn.setAttribute("aria-disabled", cart.length === 0 ? "true" : "false");
    goBillingBtn.href = cart.length === 0 ? "#" : "facturacion.html";
  }
}

function initServiceSelect() {
  const serviceSelect = document.getElementById("serviceMode");
  if (!serviceSelect) return;

  serviceSelect.value = getServiceMode();
  serviceSelect.addEventListener("change", () => {
    setServiceMode(serviceSelect.value);
    if (document.getElementById("invoiceTotal")) {
      renderInvoice();
    }
  });
}

function initMenuButtons() {
  document.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => addItem(button.dataset.item));
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action][data-id]");
    if (!target) return;

    const { action, id } = target.dataset;

    if (action === "increase") {
      updateQuantity(id, 1);
    }

    if (action === "decrease") {
      updateQuantity(id, -1);
    }
  });

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCart);
  }
}

function initRestaurantPage() {
  initMenuButtons();
  initServiceSelect();
  renderCart();
}

document.addEventListener("DOMContentLoaded", initRestaurantPage);

/* ============================
   FACTURACIÓN
============================ */

function getCurrentInvoiceTotals(cart, serviceMode) {
  const subtotal = getItemSubtotal(cart);
  const serviceRate = getServiceRate(serviceMode);
  const serviceCharge = subtotal * serviceRate;
  const iva = subtotal * 0.15;
  const total = subtotal + serviceCharge + iva;

  return {
    subtotal,
    serviceCharge,
    iva,
    total,
  };
}

function renderInvoice() {
  const cart = readCart();
  const invoiceItems = document.getElementById("invoiceItems");
  const invoiceSubtotal = document.getElementById("invoiceSubtotal");
  const invoiceService = document.getElementById("invoiceService");
  const invoiceIva = document.getElementById("invoiceIva");
  const invoiceTotal = document.getElementById("invoiceTotal");
  const invoiceState = document.getElementById("invoiceState");
  const serviceSelect = document.getElementById("invoiceServiceMode");

  if (!invoiceItems || !serviceSelect) return;

  const serviceMode = serviceSelect.value;
  const { subtotal, serviceCharge, iva, total } = getCurrentInvoiceTotals(cart, serviceMode);

  if (cart.length === 0) {
    invoiceItems.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4">No hay productos en el carrito.</td>
      </tr>
    `;
    if (invoiceState) {
      invoiceState.textContent = "Agrega productos desde el restaurante para emitir una factura.";
    }
  } else {
    invoiceItems.innerHTML = cart
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatMoney(item.price)}</td>
            <td>${formatMoney(item.price * item.quantity)}</td>
          </tr>
        `
      )
      .join("");
    if (invoiceState) {
      invoiceState.textContent = `Factura preparada con servicio "${SERVICE_LABELS[serviceMode]}".`;
    }
  }

  if (invoiceSubtotal) invoiceSubtotal.textContent = formatMoney(subtotal);
  if (invoiceService) invoiceService.textContent = formatMoney(serviceCharge);
  if (invoiceIva) invoiceIva.textContent = formatMoney(iva);
  if (invoiceTotal) invoiceTotal.textContent = formatMoney(total);
}

function saveInvoiceHistory(invoice) {
  const historyKey = "ht_restaurant_invoices";
  const current = JSON.parse(localStorage.getItem(historyKey) || "[]");
  current.unshift(invoice);
  localStorage.setItem(historyKey, JSON.stringify(current.slice(0, 25)));
}

function generateInvoiceNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `HT-${stamp}`;
}

function initInvoicePage() {
  const serviceSelect = document.getElementById("invoiceServiceMode");
  const form = document.getElementById("invoiceForm");
  const printBtn = document.getElementById("printInvoiceBtn");
  const clearInvoiceBtn = document.getElementById("clearInvoiceBtn");

  if (!serviceSelect || !form) return;

  serviceSelect.value = getServiceMode();

  serviceSelect.addEventListener("change", () => {
    setServiceMode(serviceSelect.value);
    renderInvoice();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cart = readCart();
    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const customer = {
      nombre: document.getElementById("customerName").value.trim(),
      correo: document.getElementById("customerEmail").value.trim(),
      telefono: document.getElementById("customerPhone").value.trim(),
    };

    if (!customer.nombre || !customer.correo || !customer.telefono) {
      alert("Completa los datos del cliente.");
      return;
    }

    const serviceMode = serviceSelect.value;
    const totals = getCurrentInvoiceTotals(cart, serviceMode);
    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      customer,
      serviceMode,
      items: cart,
      totals,
    };

    saveInvoiceHistory(invoice);

    const invoiceNumber = document.getElementById("invoiceNumber");
    const invoiceDate = document.getElementById("invoiceDate");

    if (invoiceNumber) invoiceNumber.textContent = invoice.invoiceNumber;
    if (invoiceDate) invoiceDate.textContent = new Date().toLocaleString("es-NI");

    renderInvoice();
    alert("Factura generada y guardada localmente.");
  });

  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  if (clearInvoiceBtn) {
    clearInvoiceBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_CART);
      document.getElementById("invoiceForm").reset();
      serviceSelect.value = "mesa";
      setServiceMode("mesa");
      renderInvoice();
      alert("Pedido limpiado.");
    });
  }

  const invoiceNumber = document.getElementById("invoiceNumber");
  const invoiceDate = document.getElementById("invoiceDate");
  if (invoiceNumber) invoiceNumber.textContent = generateInvoiceNumber();
  if (invoiceDate) invoiceDate.textContent = new Date().toLocaleString("es-NI");

  renderInvoice();
}

document.addEventListener("DOMContentLoaded", initInvoicePage);
