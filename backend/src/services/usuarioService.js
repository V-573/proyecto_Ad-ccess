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
        // Si hay una foto nueva en el array de archivos de Multer
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