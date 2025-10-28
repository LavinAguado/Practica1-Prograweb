// Cliente para la página index.html: maneja UI, listados y acciones (fetch al backend)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const chatLink = document.getElementById('chatLink');

function showUser() {
  if (user) {
    userInfoEl.textContent = `Conectado como ${user.username} (${user.role})`;
    logoutBtn.style.display = 'inline-block';
    chatLink.style.display = 'inline';
    if (user.role === 'admin') document.getElementById('createProduct').style.display = 'block';
  } else {
    userInfoEl.innerHTML = 'No autenticado';
    logoutBtn.style.display = 'none';
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
      li.innerHTML = `<strong>${p.title}</strong> — ${p.price} €<br>${p.description || ''}`;
      if (user && user.role === 'admin') {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.onclick = () => editProduct(p);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.onclick = () => deleteProduct(p._id);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
      }
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteProduct(id) {
  if (!confirm('Eliminar producto?')) return;
  const res = await fetch('/api/products/' + id, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) fetchProducts(); else alert('Error al eliminar');
}

function editProduct(p) {
  const title = prompt('Título', p.title);
  if (title === null) return;
  const price = prompt('Precio', p.price);
  const description = prompt('Descripción', p.description || '');
  fetch('/api/products/' + p._id, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, price, description })
  }).then(res => {
    if (res.ok) fetchProducts(); else res.json().then(r=> alert(r.message||'Error'));
  });
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    title: fd.get('title'),
    price: Number(fd.get('price')),
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

