import pool from '../config/db.js';

export const registrarEntrada = async (datos, usuario_id) => {
    try {
        const { nombre, identificacion, usuario_visitado_id, motivo, observaciones } = datos;
        
        // CORRECCIÓN: Cambiamos 'conserjeId' por 'usuario_id' que es lo que recibe la función
        const res = await pool.query(
            `INSERT INTO registros_acceso (nombre_visitante, identificacion_visitante, usuario_visitado_id, motivo, conserje_id, observaciones) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, identificacion, usuario_visitado_id, motivo, usuario_id, observaciones]
        );
        
        return res.rows[0];
    } catch (error) {
        // Esto hará que ahora sí veas el error en la consola del backend
        console.error("Error en AccesoService.registrarEntrada:", error.message);
        throw error; 
    }
};






export const registrarSalida = async (registroId) => {
    const res = await pool.query(
        "UPDATE registros_acceso SET fecha_salida = CURRENT_TIMESTAMP WHERE id = $1 AND fecha_salida IS NULL RETURNING *",
        [registroId]
    );
    return res.rows[0];
};

export const listarMovimientos = async () => {
    const res = await pool.query(`
        SELECT r.*, u.nombre_completo as visitado_nombre, g.nombre_completo as conserje_nombre
        FROM registros_acceso r
        LEFT JOIN usuarios u ON r.usuario_visitado_id = u.id
        LEFT JOIN usuarios g ON r.conserje_id = g.id
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};

// Para el resumen de la pantalla de INICIO (Personas que no han salido)
export const obtenerPresentes = async () => {
    const res = await pool.query(`
        SELECT r.id, r.nombre_visitante, r.identificacion_visitante, 
               u.casa_apto, r.fecha_entrada, r.motivo
        FROM registros_acceso r
        JOIN usuarios u ON r.usuario_visitado_id = u.id
        WHERE r.fecha_salida IS NULL
        ORDER BY r.fecha_entrada DESC
    `);
    return res.rows;
};

// Para la pantalla de VISITANTES (Historial reciente para marcar salidas)
export const listarVisitantesActivos = async () => {
    const res = await pool.query(`
        SELECT r.*, u.nombre_completo as visitado_nombre, u.casa_apto
        FROM registros_acceso r
        JOIN usuarios u ON r.usuario_visitado_id = u.id
        WHERE r.fecha_salida IS NULL 
           OR r.fecha_entrada >= CURRENT_DATE
        ORDER BY r.fecha_salida IS NULL DESC, r.fecha_entrada DESC
    `);
    return res.rows;
};