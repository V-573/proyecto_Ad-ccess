import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { gestionarFamiliares, gestionarVehiculos } from '../services/usuarioService.js';

// --- LOGIN ---
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.trim()]);
        
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ error: "El correo no existe" });
        }

        const usuario = userQuery.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ error: "La contraseña es incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const unidad = await pool.query("SELECT * FROM unidades_residenciales LIMIT 1");
        const requiereConfiguracion = unidad.rows.length === 0;

        return res.json({
            mensaje: "Login exitoso",
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol },
            requiereConfiguracion
        });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: "Error en el servidor" });
    }
};

export const obtenerUsuarios = async (req, res) => {
    try {
        // Consultamos todos los usuarios de la tabla
        const usuarios = await pool.query(
            "SELECT id, nombre_completo, email, rol, foto, fecha_creacion FROM usuarios ORDER BY id ASC"
        );

        res.json(usuarios.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};



export const configurarInicial = async (req, res) => {
    const { nombre_completo, identificacion, email, unidad_nombre, num_casas, parqueaderos, password } = req.body;
    const adminId = req.usuario.id; // Obtenido del token por el middleware

    try {
        // 1. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Actualizar el administrador (Ya no es el "semilla")
        await pool.query(
            "UPDATE usuarios SET nombre_completo = $1, identificacion = $2, email = $3, password = $4 WHERE id = $5",
            [nombre_completo, identificacion, email, hashedPassword, adminId]
        );

        // 3. Crear la unidad residencial
        await pool.query(
            "INSERT INTO unidades_residenciales (nombre, num_casas, parqueaderos_totales, admin_id) VALUES ($1, $2, $3, $4)",
            [unidad_nombre, num_casas, parqueaderos, adminId]
        );

        res.json({ mensaje: "Configuración inicial completada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar la configuración inicial" });
    }
};



export const obtenerDetalleUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener datos básicos del usuario
        const userRes = await pool.query(
            "SELECT id, nombre_completo, identificacion, email, rol, foto, casa_apto, fecha_creacion FROM usuarios WHERE id = $1",
            [id]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const usuario = userRes.rows[0];

        // 2. Si es propietario, buscar sus "extras"
        let familiares = [];
        let vehiculos = [];

        if (usuario.rol === 'propietario') {
            const famRes = await pool.query("SELECT * FROM familiares WHERE usuario_id = $1", [id]);
            const vehRes = await pool.query("SELECT * FROM vehiculos WHERE usuario_id = $1", [id]);
            familiares = famRes.rows;
            vehiculos = vehRes.rows;
        }

        res.json({
            ...usuario,
            familiares,
            vehiculos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener detalle" });
    }
};


// --- ELIMINAR USUARIO ---
export const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        // Al eliminar al usuario, si tienes ON DELETE CASCADE en la DB, 
        // se borrarán sus familiares y vehículos automáticamente.
        const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
        
        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
};


// --- REGISTRAR ---
export const registrarAdmin = async (req, res) => {
    const { nombre_completo, identificacion, email, password, rol, casa_apto, familia, vehiculos } = req.body;
    const fotoPath = req.files?.['foto'] ? `/uploads/${req.files['foto'][0].filename}` : null;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Validar casa_apto y convertir a NULL si es necesario
        const valorCasa = (rol === 'propietario' && casa_apto?.trim()) ? casa_apto : null;
        
        if (valorCasa) {
            const existe = await client.query("SELECT id FROM usuarios WHERE casa_apto = $1", [valorCasa]);
            if (existe.rows.length > 0) throw new Error("CASA_DUPLICADA");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRes = await client.query(
            "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto, casa_apto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [nombre_completo, identificacion, email, hashedPassword, rol, fotoPath, valorCasa]
        );
        
        const nuevoId = userRes.rows[0].id;

        if (rol === 'propietario') {
            // Reutilizamos el servicio (esEdicion = false)
            await gestionarFamiliares(client, nuevoId, familia, req.files['fotosFamiliares'], false);
            await gestionarVehiculos(client, nuevoId, vehiculos, false);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        await client.query('ROLLBACK');
        const msg = error.message === "CASA_DUPLICADA" ? "La casa ya está registrada" : "Error en registro";
        res.status(error.message === "CASA_DUPLICADA" ? 400 : 500).json({ error: msg });
    } finally {
        client.release();
    }
};

// --- ACTUALIZAR ---
export const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, rol, casa_apto, identificacion, familia, vehiculos } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const valorCasa = (rol === 'propietario' && casa_apto?.trim()) ? casa_apto : null;
        let rutaFoto = req.body.foto;
        if (req.files?.['foto']) rutaFoto = `/uploads/${req.files['foto'][0].filename}`;

        await client.query(
            `UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3, casa_apto = $4, identificacion = $5, foto = $6 WHERE id = $7`,
            [nombre_completo, email, rol, valorCasa, identificacion, rutaFoto, id]
        );

        if (rol === 'propietario') {
            // Reutilizamos el servicio (esEdicion = true)
            await gestionarFamiliares(client, id, familia, req.files['fotosFamiliares'], true);
            await gestionarVehiculos(client, id, vehiculos, true);
        }

        await client.query('COMMIT');
        res.json({ mensaje: "Usuario actualizado" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al actualizar" });
    } finally {
        client.release();
    }
};