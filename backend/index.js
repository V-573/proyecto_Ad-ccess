import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './src/config/db.js'; // IMPORTANTE: En Node con ES Modules DEBES poner la extensión .js
import authRoutes from './src/routes/authRoutes.js';
import accesoRoutes from './src/routes/accesoRoutes.js';
import fs from 'fs';
import path from 'path';
import minutaRoutes from './src/routes/minutaRoutes.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// 1. Crear la carpeta 'uploads' si no existe
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Hacer la carpeta accesible desde la URL (Ej: http://localhost:4000/uploads/foto.jpg)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));



// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error en DB:', err);
    } else {
        console.log('✅ PostgreSQL conectado:', res.rows[0].now);
    }
});



// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/acceso', accesoRoutes);
app.use('/api/minuta', minutaRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));



// ¡Exacto! Has captado el flujo perfectamente. Es una estructura clásica y robusta de MVC (Modelo-Vista-Controlador) donde cada archivo tiene una responsabilidad única.