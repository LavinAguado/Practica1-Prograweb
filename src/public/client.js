// Cliente para la página index.html: maneja UI, listados y acciones (fetch al backend)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const chatLink = document.getElementById('chatLink');

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
        </div>
      `;
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
  fetch('/api/products/' + p._id, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, price, description })
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

// initial load
fetchProducts();

