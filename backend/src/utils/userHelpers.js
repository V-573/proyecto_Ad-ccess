// util/userHelpers.js
export const limpiarDatosUsuario = (datos, rol) => {
    return {
        ...datos,
        casa_apto: (rol === 'propietario' && datos.casa_apto?.trim()) ? datos.casa_apto : null
    };
};