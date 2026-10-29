// Reglas de validación de los datos de un usuario. Son las mismas que valida el backend y las que
// Pruebas de Software prueba con Jest: el front valida para avisar rápido a quien llena el
// formulario; el backend valida para que nadie se las salte mandando la petición con Postman.

export function validarCorreo(correo) {
  if (typeof correo !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function validarBoleta(boleta) {
  if (typeof boleta !== "string") return false;
  return /^\d{10}$/.test(boleta.trim());
}

export function validarContrasena(contrasena) {
  if (typeof contrasena !== "string") return false;
  return contrasena.length >= 8;
}
// Solo letras (con acentos y ñ) y espacios, de 3 a 100 caracteres.
// Es la misma regla que valida el backend.
export function validarNombre(nombre) {
  if (typeof nombre !== "string") return false;
  const limpio = nombre.trim();
  if (limpio.length < 3 || limpio.length > 100) return false;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(limpio);
}
