function validarCorreo(correo) {
  if (typeof correo !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarBoleta(boleta) {
  return /^\d{10}$/.test(String(boleta));
}

function validarContrasena(contrasena) {
  if (typeof contrasena !== "string") return false;
  return contrasena.length >= 8;
}

// Solo letras (con acentos y ñ) y espacios, de 3 a 100 caracteres
function validarNombre(nombre) {
  if (typeof nombre !== "string") return false;
  const limpio = nombre.trim();
  if (limpio.length < 3 || limpio.length > 100) return false;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(limpio);
}

module.exports = {
  validarBoleta,
  validarContrasena,
  validarCorreo,
  validarNombre,
};
