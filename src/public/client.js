// ================== AUTH ==================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const chatLink = document.getElementById('chatLink');

let cart = [];

// ================== UI USER ==================
function showUser() {
  const authButtons = document.getElementById('authButtons');

  if (user) {
    userInfoEl.textContent = `Conectado como ${user.username} (${user.role})`;
    logoutBtn.style.display = 'inline-block';
    chatLink.style.display = 'inline';
    if (authButtons) authButtons.style.display = 'none';

    if (user.role === 'admin') {
      document.getElementById('createProduct').style.display = 'block';
    }
  } else {
    userInfoEl.textContent = 'No autenticado';
    logoutBtn.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
  }
}

showUser();

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location = '/';
});

// ================== PRODUCTS ==================
async function fetchProducts() {
  try {
    const res = await fetch('/api/products', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });

    const data = await res.json();
    if (!res.ok) {
      document.getElementById('products').innerHTML =
        '<li>Debe iniciar sesión para ver productos</li>';
      return;
    }

    const ul = document.getElementById('products');
    ul.innerHTML = '';

    data.forEach(p => {
      const li = document.createElement('li');

      li.innerHTML = `
        <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          <p>${p.price.toFixed(2)} €</p>
          <p>Stock: ${p.stock}</p>
        </div>
      `;

      // ===== Quantity selector =====
      let selectedQty = 1;

      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.gap = '6px';
      controls.style.alignItems = 'center';

      const minusBtn = document.createElement('button');
      minusBtn.textContent = '−';
      minusBtn.onclick = () => {
        if (selectedQty > 1) {
          selectedQty--;
          qtySpan.textContent = selectedQty;
        }
      };

      const qtySpan = document.createElement('span');
      qtySpan.textContent = selectedQty;

      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';
      plusBtn.onclick = () => {
        if (selectedQty < p.stock) {
          selectedQty++;
          qtySpan.textContent = selectedQty;
        }
      };

      const addBtn = document.createElement('button');
      addBtn.textContent = 'Añadir';
      addBtn.onclick = () => addToCart(p, selectedQty);

      if (p.stock === 0) {
        addBtn.textContent = 'Sin stock';
        addBtn.disabled = true;
        plusBtn.disabled = true;
        minusBtn.disabled = true;
      }

      controls.append(minusBtn, qtySpan, plusBtn, addBtn);
      li.appendChild(controls);

      // ===== Admin buttons =====
      if (user && user.role === 'admin') {
        const adminBtns = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.onclick = () => editProduct(p);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.onclick = () => deleteProduct(p._id);

        adminBtns.append(editBtn, delBtn);
        li.appendChild(adminBtns);
      }

      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ================== CART ==================
function addToCart(product, quantity) {
  const existing = cart.find(i => i.productId === product._id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity
    });
  }

  renderCart();
}

function renderCart() {
  const ul = document.getElementById('cart');
  const totalEl = document.getElementById('total');

  ul.innerHTML = '';

  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.title} x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} €`;
    ul.appendChild(li);
  });

  totalEl.textContent = calculateTotal().toFixed(2) + ' €';
}

function calculateTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// ================== CHECKOUT ==================
document.getElementById('checkoutBtn').onclick = async () => {
  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const items = cart.map(i => ({
    productId: i.productId,
    quantity: i.quantity
  }));

  const query = `
    mutation {
      createOrder(
        items: ${JSON.stringify(items).replace(/"([^"]+)":/g, '$1:')}
      ) {
        id
        total
        status
      }
    }
  `;

  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await res.json();

  if (data.errors) {
    alert(data.errors[0].message);
  } else {
    alert('✅ Pedido realizado correctamente');
    cart = [];
    renderCart();
    fetchProducts();
  }
};

// ================== ADMIN ==================
async function deleteProduct(id) {
  if (!confirm('¿Eliminar producto?')) return;

  const res = await fetch('/api/products/' + id, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) fetchProducts();
}

function editProduct(p) {
  const title = prompt('Título', p.title);
  if (title === null) return;

  const price = parseFloat(prompt('Precio', p.price));
  const description = prompt('Descripción', p.description || '');
  const stock = parseInt(prompt('Stock', p.stock));

  fetch('/api/products/' + p._id, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, price, description, stock })
  }).then(res => {
    if (res.ok) fetchProducts();
  });
}

// ================== INIT ==================
fetchProducts();
