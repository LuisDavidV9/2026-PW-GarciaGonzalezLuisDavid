const asistenciaModelo = require("../Modelo/asistencia_modelo");
const { validarBoleta, validarNombre } = require("../validaciones");

function esDuplicado(error) {
  return error.code === "ER_DUP_ENTRY" || error.code === "23505";
}

// POST /api/asistencias
async function registrarAsistencia(req, res) {
  const { taller_id, nombre_alumno, boleta } = req.body || {};

  if (!taller_id || !nombre_alumno || !boleta) {
    return res
      .status(400)
      .json({ error: "taller_id, nombre_alumno y boleta son obligatorios" });
  }
  if (typeof taller_id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(taller_id)) {
    return res.status(400).json({ error: "taller_id no es válido" });
  }
  if (!validarNombre(nombre_alumno)) {
    return res
      .status(400)
      .json({
        error:
          "El nombre solo puede tener letras y espacios (de 3 a 100 caracteres)",
      });
  }
  if (!validarBoleta(boleta)) {
    return res
      .status(400)
      .json({ error: "La boleta debe tener exactamente 10 dígitos" });
  }

  try {
    const asistencia = await asistenciaModelo.registrarAsistencia({
      taller_id,
      nombre_alumno: nombre_alumno.trim(),
      boleta: String(boleta),
    });
    res.status(201).json(asistencia);
  } catch (error) {
    if (esDuplicado(error)) {
      return res
        .status(409)
        .json({ error: "El alumno ya esta registrado en este taller" });
    }
    // Si el taller no existe, la llave foranea falla
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ error: "Taller no encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
}

// GET /api/talleres/:id/asistencias
async function consultarAsistenciaPorTaller(req, res) {
  try {
    const asistencias = await asistenciaModelo.consultarAsistenciaPorTaller(
      req.params.id,
    );
    res.json(asistencias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registrarAsistencia, consultarAsistenciaPorTaller };
