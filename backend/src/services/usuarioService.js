import pool from '../config/db.js';
import * as AuthService from './authService.js';

// --- FUNCIONES PRINCIPALES ---

export const buscarPorEmail = async (email) => {
    const res = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.trim()]);
    return res.rows[0];
};

export const listarTodos = async () => {
    const res = await pool.query("SELECT id, nombre_completo, email, rol, foto, fecha_creacion FROM usuarios ORDER BY id ASC");
    return res.rows;
};

export const eliminar = async (id) => {
    const res = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
    if (res.rowCount === 0) throw new Error("USUARIO_NO_ENCONTRADO");
    return res.rows[0];
};

export const obtenerPorIdCompleto = async (id) => {
    const userRes = await pool.query(
        "SELECT id, nombre_completo, identificacion, email, rol, foto, casa_apto, fecha_creacion FROM usuarios WHERE id = $1",
        [id]
    );
    if (userRes.rows.length === 0) return null;

    const usuario = userRes.rows[0];
    let familiares = [];
    let vehiculos = [];

    if (usuario.rol === 'propietario') {
        const famRes = await pool.query("SELECT * FROM familiares WHERE usuario_id = $1", [id]);
        const vehRes = await pool.query("SELECT * FROM vehiculos WHERE usuario_id = $1", [id]);
        familiares = famRes.rows;
        vehiculos = vehRes.rows;
    }
    return { ...usuario, familiares, vehiculos };
};

export const crearUsuarioCompleto = async (datos, archivos) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { nombre_completo, identificacion, email, password, rol, casa_apto, familia, vehiculos } = datos;
        
        const valorCasa = (rol === 'propietario' && casa_apto?.trim()) ? casa_apto : null;
        if (valorCasa) {
            const existe = await client.query("SELECT id FROM usuarios WHERE casa_apto = $1", [valorCasa]);
            if (existe.rows.length > 0) throw new Error("CASA_DUPLICADA");
        }

        const hashedPassword = await AuthService.encriptarPassword(password);
        const fotoPath = archivos?.['foto'] ? `/uploads/${archivos['foto'][0].filename}` : null;

        const userRes = await client.query(
            "INSERT INTO usuarios (nombre_completo, identificacion, email, password, rol, foto, casa_apto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [nombre_completo, identificacion, email, hashedPassword, rol, fotoPath, valorCasa]
        );
        
        const nuevoId = userRes.rows[0].id;
        if (rol === 'propietario') {
            await gestionarFamiliares(client, nuevoId, familia, archivos?.['fotosFamiliares'], false);
            await gestionarVehiculos(client, nuevoId, vehiculos, false);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const completarConfiguracion = async (datos, archivos, adminId) => {
    const { nombre_completo, identificacion, email, unidad_nombre, num_casas, parqueaderos, password } = datos;
    const fotoPath = archivos?.['foto'] ? `/uploads/${archivos['foto'][0].filename}` : null;
    
    const hashedPassword = await AuthService.encriptarPassword(password);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            "UPDATE usuarios SET nombre_completo = $1, identificacion = $2, email = $3, password = $4, foto = $5 WHERE id = $6",
            [nombre_completo, identificacion, email, hashedPassword, fotoPath, adminId]
        );
        await client.query(
            "INSERT INTO unidades_residenciales (nombre, num_casas, parqueaderos_totales, admin_id) VALUES ($1, $2, $3, $4)",
            [unidad_nombre, num_casas, parqueaderos, adminId]
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const actualizar = async (id, datos, archivos) => {
    const { nombre_completo, email, rol, casa_apto, identificacion, familia, vehiculos } = datos;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const valorCasa = (rol === 'propietario' && casa_apto?.trim()) ? casa_apto : null;
        let rutaFoto = datos.foto; // Mantener foto actual si no se sube una nueva
        if (archivos?.['foto']) rutaFoto = `/uploads/${archivos['foto'][0].filename}`;

        await client.query(
            `UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3, casa_apto = $4, identificacion = $5, foto = $6 WHERE id = $7`,
            [nombre_completo, email, rol, valorCasa, identificacion, rutaFoto, id]
        );

        if (rol === 'propietario') {
            await gestionarFamiliares(client, id, familia, archivos?.['fotosFamiliares'], true);
            await gestionarVehiculos(client, id, vehiculos, true);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// --- FUNCIONES DE APOYO (HELPERS) ---

export const gestionarFamiliares = async (client, usuarioId, familiaData, archivosFotos, esEdicion = false) => {
    if (!familiaData) return;
    const miembros = typeof familiaData === 'string' ? JSON.parse(familiaData) : familiaData;
    
    if (esEdicion) {
        const idsQueSeQuedan = miembros.map(f => f.id).filter(id => id !== null);
        if (idsQueSeQuedan.length > 0) {
            await client.query(
                `DELETE FROM familiares WHERE usuario_id = $1 AND id NOT IN (${idsQueSeQuedan.join(',')})`,
                [usuarioId]
            );
        } else {
            await client.query("DELETE FROM familiares WHERE usuario_id = $1", [usuarioId]);
        }
    }

    const fotosFamiliares = archivosFotos || [];
    let fotoIndex = 0;

    for (let f of miembros) {
        let rutaFotoFinal = f.foto || null;
        if (f.tieneNuevaFoto && fotosFamiliares[fotoIndex]) {
            rutaFotoFinal = `/uploads/${fotosFamiliares[fotoIndex].filename}`;
            fotoIndex++;
        }

        if (esEdicion && f.id) {
            await client.query(
                "UPDATE familiares SET nombre = $1, identificacion = $2, relacion = $3, foto = $4 WHERE id = $5 AND usuario_id = $6",
                [f.nombre, f.identificacion, f.relacion, rutaFotoFinal, f.id, usuarioId]
            );
        } else {
            await client.query(
                "INSERT INTO familiares (usuario_id, nombre, identificacion, relacion, foto) VALUES ($1, $2, $3, $4, $5)",
                [usuarioId, f.nombre, f.identificacion, f.relacion, rutaFotoFinal]
            );
        }
    }
};

export const gestionarVehiculos = async (client, usuarioId, vehiculosData, esEdicion = false) => {
    if (!vehiculosData) return;
    const autos = typeof vehiculosData === 'string' ? JSON.parse(vehiculosData) : vehiculosData;
    
    if (esEdicion) {
        const idsVehiculosQueSeQuedan = autos.map(v => v.id).filter(id => id != null);
        if (idsVehiculosQueSeQuedan.length > 0) {
            await client.query(
                `DELETE FROM vehiculos WHERE usuario_id = $1 AND id NOT IN (${idsVehiculosQueSeQuedan.join(',')})`,
                [usuarioId]
            );
        } else {
            await client.query("DELETE FROM vehiculos WHERE usuario_id = $1", [usuarioId]);
        }
    }

    for (let v of autos) {
        if (esEdicion && v.id) {
            await client.query(
                "UPDATE vehiculos SET placa = $1, tipo = $2, color = $3 WHERE id = $4 AND usuario_id = $5",
                [v.placa, v.tipo, v.color, v.id, usuarioId]
            );
        } else {
            await client.query(
                "INSERT INTO vehiculos (usuario_id, placa, tipo, color) VALUES ($1, $2, $3, $4)",
                [usuarioId, v.placa, v.tipo, v.color]
            );
        }
    }
};

export const buscarPropietarioPorFiltro = async (termino) => {
    // Buscamos coincidencias parciales en casa_apto o nombre_completo
    const query = `
        SELECT id, nombre_completo, casa_apto 
        FROM usuarios 
        WHERE (casa_apto ILIKE $1 OR nombre_completo ILIKE $1)
        AND rol = 'propietario'
        LIMIT 10
    `;
    const res = await pool.query(query, [`%${termino}%`]);
    return res.rows;
};