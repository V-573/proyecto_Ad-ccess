
import * as AuthService from '../services/authService.js';
import * as UsuarioService from '../services/usuarioService.js';
import pool from '../config/db.js';

// --- LOGIN ---
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await UsuarioService.buscarPorEmail(email);
        if (!usuario) return res.status(400).json({ error: "El correo no existe" });

        const esValido = await AuthService.compararPassword(password, usuario.password);
        if (!esValido) return res.status(400).json({ error: "Contraseña incorrecta" });

        const token = AuthService.generarToken(usuario);
        const unidad = await pool.query("SELECT id FROM unidades_residenciales LIMIT 1");

        res.json({
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol },
            requiereConfiguracion: unidad.rows.length === 0
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// --- OBTENER TODOS LOS USUARIOS ---
export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioService.listarTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};

// --- CONFIGURACIÓN INICIAL ---
export const configurarInicial = async (req, res) => {
    try {
        await UsuarioService.completarConfiguracion(req.body, req.files, req.usuario.id);
        res.json({ mensaje: "Configuración inicial completada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la configuración" });
    }
};

// --- REGISTRAR USUARIO (ADMIN REGISTRA OTROS) ---
export const registrarAdmin = async (req, res) => {
    try {
        await UsuarioService.crearUsuarioCompleto(req.body, req.files);
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        const status = error.message === "CASA_DUPLICADA" ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
};

// --- DETALLE DE USUARIO ---
export const obtenerDetalleUsuario = async (req, res) => {
    try {
        const usuario = await UsuarioService.obtenerPorIdCompleto(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener detalle" });
    }
};

// --- ELIMINAR USUARIO ---
export const eliminarUsuario = async (req, res) => {
    try {
        await UsuarioService.eliminar(req.params.id);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};

// --- ACTUALIZAR USUARIO ---
export const actualizarUsuario = async (req, res) => {
    try {
        await UsuarioService.actualizar(req.params.id, req.body, req.files);
        res.json({ mensaje: "Usuario actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
};