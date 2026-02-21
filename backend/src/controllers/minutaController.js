import pool from '../config/db.js';

export const obtenerMinuta = async (req, res) => {
    try {
        const query = `
            SELECT m.id, m.descripcion, m.fecha, m.categoria, m.importancia, u.nombre_completo as nombre_conserje 
            FROM public.minuta m
            JOIN public.usuarios u ON m.conserje_id = u.id
            ORDER BY m.fecha DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener minuta:", error);
        res.status(500).json({ error: "Error al obtener la minuta" });
    }
};

export const crearRegistroMinuta = async (req, res) => {
    const { descripcion, categoria = 'General', importancia = 'NORMAL' } = req.body;
    
    // Tu middleware guarda la info en req.usuario
    const conserje_id = req.usuario.id; 

    if (!descripcion) {
        return res.status(400).json({ error: "La descripción es obligatoria" });
    }

    try {
        const query = `
            INSERT INTO public.minuta (descripcion, conserje_id, categoria, importancia) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        
        const values = [descripcion, conserje_id, categoria, importancia];
        const { rows } = await pool.query(query, values);
        
        res.status(201).json({ mensaje: "Registro guardado", registro: rows[0] });
    } catch (error) {
        console.error("Error al insertar en minuta:", error);
        res.status(500).json({ error: "Error al guardar el registro" });
    }
};