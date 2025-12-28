// Cliente para la página index.html: maneja UI, listados y acciones (fetch al backend)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const chatLink = document.getElementById('chatLink');
let cart = [];

function showUser() {
  const authButtons = document.getElementById('authButtons');
  if (user) {
    userInfoEl.textContent = `Conectado como ${user.username} (${user.role})`;
    logoutBtn.style.display = 'inline-block';
    chatLink.style.display = 'inline';
    if (authButtons) authButtons.style.display = 'none';
    if (user.role === 'admin') document.getElementById('createProduct').style.display = 'block';
  } else {
    userInfoEl.innerHTML = 'No autenticado';
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

async function fetchProducts() {
  try {
    const res = await fetch('/api/products', {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      document.getElementById('products').innerHTML = '<li>Debe iniciar sesión para ver productos</li>';
      return;
    }
    const ul = document.getElementById('products');
    ul.innerHTML = '';
    data.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-gray-800">${p.title}</h3>
          <p class="text-gray-600">${p.description || ''}</p>
          <p class="text-blue-600 font-medium">${parseFloat(p.price).toFixed(2)} €</p>
          <p class="text-gray-700">Stock: ${p.stock}</p>
          </div>
      `;
       let selectedQty = 1;

       const controls = document.createElement('div');
       controls.style.display = 'flex';
       controls.style.alignItems = 'center';
       controls.style.gap = '6px';

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

const buyBtn = document.createElement('button');
buyBtn.textContent = 'Añadir';
buyBtn.onclick = () => addToCart(p, selectedQty);

controls.appendChild(minusBtn);
controls.appendChild(qtySpan);
controls.appendChild(plusBtn);
controls.appendChild(buyBtn);

li.appendChild(controls);


      if (user && user.role === 'admin') {
        const buttons = document.createElement('div');
        buttons.className = "flex gap-2 mt-2";
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = "bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded";
        editBtn.onclick = () => editProduct(p);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.className = "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded";
        delBtn.onclick = () => deleteProduct(p._id);
        buttons.appendChild(editBtn);
        buttons.appendChild(delBtn);
        li.appendChild(buttons);
      }
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar producto?')) return;
  const res = await fetch('/api/products/' + id, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) fetchProducts(); else alert('Error al eliminar');
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
    else res.json().then(r => alert(r.message || 'Error'));
  });
}


document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    title: fd.get('title'),
    price: parseFloat(fd.get('price')),
    stock: parseInt(fd.get('stock')),
    image: fd.get('image'),
    description: fd.get('description')
  };
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    fetchProducts();
    e.target.reset();
  } else {
    const r = await res.json();
    alert(r.message || 'Error creando');
  }
});
async function buyProduct(productId) {
  const query = `
    mutation {
      createOrder(
        items: [{ productId: "${productId}", quantity: 1 }]
      ) {
        id
        total
        status
      }
    }
  `;

  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();

  if (data.errors) {
    alert(data.errors[0].message);
  } else {
    alert('Pedido creado correctamente');
    fetchProducts(); // refresca stock
  }
}

function addToCart(product, quantity = 1) {
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

function removeFromCart(productId) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.productId !== productId);
  }

  renderCart();
}


function calculateTotal() {
  return cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

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
    alert('Pedido realizado correctamente');
    cart = [];
    renderCart();
    fetchProducts(); // refrescar stock
  }
};
function increaseQuantity(productId) {
  const item = cart.find(i => i.productId === productId);
  if (item) {
    item.quantity++;
    renderCart();
  }
}

function decreaseQuantity(productId) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    renderCart();
  }
}
function renderCart() {
  const ul = document.getElementById('cart');
  ul.innerHTML = '';

  let total = 0;

  cart.forEach(item => {
    const li = document.createElement('li');

    const name = document.createElement('span');
    name.textContent = item.title;

    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.onclick = () => decreaseQuantity(item.productId);

    const qty = document.createElement('span');
    qty.textContent = ` ${item.quantity} `;
    qty.style.margin = '0 6px';

    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.onclick = () => increaseQuantity(item.productId);

    const price = document.createElement('span');
    const subtotal = item.price * item.quantity;
    price.textContent = ` = ${subtotal.toFixed(2)} €`;
    price.style.marginLeft = '10px';

    li.appendChild(name);
    li.appendChild(minusBtn);
    li.appendChild(qty);
    li.appendChild(plusBtn);
    li.appendChild(price);

    ul.appendChild(li);

    total += subtotal;
  });

  document.getElementById('cartTotal').textContent =
    `Total: ${total.toFixed(2)} €`;
}






// initial load
fetchProducts();

