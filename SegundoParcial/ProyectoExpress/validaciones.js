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

function validarNombreTaller(nombre) {
    if (typeof nombre !== 'string') return false;
    const limpio = nombre.trim();
    return limpio.length >= 3 && limpio.length <= 100;
}

function validarInstructor(instructor) {
    if (typeof instructor !== 'string') return false;
    const limpio = instructor.trim();
    if (limpio.length < 3 || limpio.length > 100) return false;
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]+)*$/.test(limpio);
}

function validarFecha(fecha) {
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const d = new Date(anio, mes - 1, dia);
    return d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia;
}

function validarCupo(cupo) {
    if (typeof cupo === 'string' && !/^\d+$/.test(cupo.trim())) return false;
    if (typeof cupo !== 'string' && typeof cupo !== 'number') return false;
    const n = Number(cupo);
    return Number.isInteger(n) && n >= 1 && n <= 500;
}
// id con formato de UUID (letras, números y guiones, 36 caracteres)
function validarId(id) {
    return typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id);
}

module.exports = { validarBoleta, validarContrasena, validarCorreo, validarNombre, validarNombreTaller, validarInstructor, validarFecha, validarCupo, validarId };
