import express from 'express';
import { registrarAdmin, obtenerUsuarios, configurarInicial, login, obtenerDetalleUsuario, eliminarUsuario, actualizarUsuario } from '../controllers/authController.js';
import { verificarToken, esAdmin } from '../middlewares/authMiddleware.js'; // Importa los vigilantes
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuración de dónde y cómo se guardan las fotos
const storage = multer.diskStorage({
    destination: 'uploads/', 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único: timestamp + extensión
    }
});


// 2. Configuración de Multer con VALIDACIONES DE SEGURIDAD (Punto 2)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/; // Extensiones permitidas
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
    }
});


// Ruta: POST /api/auth/registro-admin
// REGISTRO: Aquí unimos todo en una sola línea (Vigilantes + Carga de Foto + Controlador)
// IMPORTANTE: upload.single('foto') debe ir DESPUÉS de verificarToken si quieres validar el usuario antes de procesar la imagen
// router.post('/registro-admin', verificarToken, esAdmin, upload.single('foto'), registrarAdmin);// Ahora esta puerta está cerrada con doble llave:verificarToken, esAdmin


router.post(
    '/registro-admin', 
    verificarToken, 
    esAdmin, 
    upload.fields([
        { name: 'foto', maxCount: 1 }, 
        { name: 'fotosFamiliares', maxCount: 10 }
    ]), 
    registrarAdmin
);



// ... (después de la ruta de registro)
router.post('/login', login);// Abierta al público


// Ruta para obtener todos los usuarios (Protegida)
router.get('/usuarios', verificarToken, esAdmin, obtenerUsuarios);

//ruta para configuracion inicial
router.post('/configuracion-inicial', verificarToken, esAdmin, configurarInicial);

//ruta para ver detalles de usuario
router.get('/usuario/:id', verificarToken, obtenerDetalleUsuario); 

//ruta para eliminar usuario
router.delete('/usuario/:id', verificarToken, eliminarUsuario);

//ruta para actualizar datos del usuario
router.put('/usuario/:id', verificarToken, actualizarUsuario);
export default router;



