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
// Nombre de taller: de 3 a 100 caracteres (puede llevar números, como "Taller 2").
export function validarNombreTaller(nombre) {
  if (typeof nombre !== "string") return false;
  const limpio = nombre.trim();
  return limpio.length >= 3 && limpio.length <= 100;
}

// Instructor: letras, espacios y puntos (por ejemplo "Ing. Ana Torres"), de 3 a 100 caracteres.
export function validarInstructor(instructor) {
  if (typeof instructor !== "string") return false;
  const limpio = instructor.trim();
  if (limpio.length < 3 || limpio.length > 100) return false;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]+)*$/.test(limpio);
}

// Fecha con formato AAAA-MM-DD y que exista de verdad (no el 31 de febrero).
export function validarFecha(fecha) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia;
}

// Cupo: entero entre 1 y 500.
export function validarCupo(cupo) {
  if (typeof cupo === "string" && !/^\d+$/.test(cupo.trim())) return false;
  if (typeof cupo !== "string" && typeof cupo !== "number") return false;
  const n = Number(cupo);
  return Number.isInteger(n) && n >= 1 && n <= 500;
}