import React from 'react';

const Avatar = ({ src, nombre, size = '40px', fontSize = '1rem' }) => {
    const [error, setError] = React.useState(false);

    // Lógica de iniciales
    const getIniciales = (n) => {
        if (!n) return "?";
        return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    };

    const estiloContenedor = {
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34495e',
        color: 'white',
        fontWeight: 'bold',
        fontSize: fontSize,
        flexShrink: 0
    };

    // Si no hay foto o hubo error al cargarla, mostramos iniciales
    if (!src || error) {
        return (
            <div style={estiloContenedor} title={nombre}>
                {getIniciales(nombre)}
            </div>
        );
    }

    return (
        <div style={estiloContenedor}>
            <img 
                src={src.startsWith('http') ? src : `http://localhost:4000${src}`} 
                alt={nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setError(true)}
            />
        </div>
    );
};

export default Avatar;