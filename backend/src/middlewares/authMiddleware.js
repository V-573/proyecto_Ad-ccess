import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Obtener el token del encabezado de la petición
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }

    try {
        // 2. Verificar el token y extraer la info (id y rol que guardamos en el login)
        const verificado = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos los datos del usuario en la petición
        
        next(); // ¡Todo bien! Pasa a la siguiente función (el controlador)
    } catch (error) {
        res.status(400).json({ error: "Token no válido" });
    }
};


export const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // Verificamos que exista el usuario y el rol en el req (puesto por verificarToken)
        if (!req.usuario || !req.usuario.rol) {
            return res.status(403).json({ error: "No se encontró rol en el token" });
        }

        // Convertimos a minúsculas para comparar sin errores
        const rolUsuario = req.usuario.rol.toLowerCase();
        const tienePermiso = rolesPermitidos.some(rol => rol.toLowerCase() === rolUsuario);

        if (!tienePermiso) {
            return res.status(403).json({ 
                error: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}` 
            });
        }
        
        next();
    };
};