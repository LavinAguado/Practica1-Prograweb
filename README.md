# Práctica 1 - Portal de Productos con Autenticación y Chat

## Resumen
Aplicación de ejemplo que implementa:
- Registro/login con JWT.
- Roles: `user` y `admin`.
- CRUD de productos (admin).
- Chat en tiempo real con Socket.IO (usuarios autenticados).
- Persistencia en MongoDB.

## Tecnologías
- Node.js, Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- Socket.IO
- Frontend: HTML/CSS/Vanilla JS

## Requisitos
- Node >= 16
- MongoDB corriendo localmente o conexión a Mongo Atlas

## Instalación
1. Clona el repositorio.
2. `npm install`
3. Copia `.env.example` a `.env` y configura `MONGO_URI` y `JWT_SECRET`.
4. `npm run dev` (o `npm start`)

## Endpoints principales
- `POST /api/auth/register` body: `{ username, email, password, role }`
- `POST /api/auth/login` body: `{ email, password }`
- `GET /api/products` (autenticado)
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

## Chat
- Accede a `/chat.html` tras iniciar sesión.
- Cliente Socket.IO envía token en handshake: `{ auth: { token } }`.

## Notas y decisiones
- Se ha mantenido el almacenamiento del chat en memoria (no persistente) para la versión básica — ampliación opcional: persistir mensajes en MongoDB.
- Se permite asignar `admin` en registro (para pruebas). En un contexto real, la creación de admins debe estar controlada.
- Interfaz minimalista: se puede mejorar con frameworks o subida de imágenes.

## Evaluación
- Autenticación JWT: implementada.
- Roles: implementados y comprobados en rutas.
- CRUD: operativo, usa Mongoose.
- Chat: funcional con Socket.IO y token de autenticación.
