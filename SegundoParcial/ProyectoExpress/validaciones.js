function validarCorreo(correo) {
    if (typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarBoleta(boleta) {
    return /^\d{10}$/.test(String(boleta));
}

function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = { validarBoleta, validarContrasena, validarCorreo };
