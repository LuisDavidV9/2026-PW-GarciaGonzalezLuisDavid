import { useEffect, useState } from "react";
import { pedirJSON } from "../lib/api";
import { formatearFecha } from "../lib/formato";
import { validarBoleta } from "../lib/validaciones";
import estilos from "../styles/Talleres.module.css";

// /asistencias — lista de asistencia en tabla, de dos maneras:
//   Por taller:  se elige un taller y se marca si cada alumno vino (Sí / No).
//   Por usuario: se escribe una boleta y se ven sus talleres y si vino a cada uno.
// Usa: GET /api/talleres, GET /api/talleres/:id/asistencias,
//      PATCH /api/asistencias/:id y GET /api/asistencias/boleta/:boleta.
export default function Asistencias() {
  const [vista, setVista] = useState("taller");
  const [error, setError] = useState("");

  // Vista "por taller"
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState("");

  // Vista "por usuario"
  const [boleta, setBoleta] = useState("");
  const [boletaBuscada, setBoletaBuscada] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    cargarTalleres();
  }, []);

  async function cargarTalleres() {
    try {
      setTalleres(await pedirJSON("/talleres"));
    } catch (err) {
      setError(err.message);
    }
  }

  function cambiarVista(nueva) {
    setVista(nueva);
    setError("");
  }

  async function elegirTaller(id) {
    setTallerId(id);
    setAsistencias([]);
    setError("");
    if (!id) return;

    setCargando(true);
    try {
      setAsistencias(await pedirJSON(`/talleres/${id}/asistencias`));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function marcar(asistencia, valor) {
    setError("");
    setGuardando(asistencia.id);
    try {
      const actualizada = await pedirJSON(`/asistencias/${asistencia.id}`, {
        method: "PATCH",
        body: JSON.stringify({ asistio: valor }),
      });
      setAsistencias((lista) =>
        lista.map((a) =>
          a.id === asistencia.id ? { ...a, asistio: actualizada.asistio } : a,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando("");
    }
  }

  async function buscar(e) {
    e.preventDefault();
    setError("");
    setResultado(null);

    const boletaLimpia = boleta.trim();
    if (!boletaLimpia) return setError("Escribe una boleta.");
    if (!validarBoleta(boletaLimpia))
      return setError("La boleta debe tener 10 dígitos.");

    setCargando(true);
    try {
      setResultado(await pedirJSON(`/asistencias/boleta/${boletaLimpia}`));
      setBoletaBuscada(boletaLimpia);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const tallerActual = talleres.find((t) => t.id === tallerId);
  const vinieron = asistencias.filter((a) => a.asistio).length;

  return (
    <main>
      <h1>Asistencias</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => cambiarVista("taller")}
          style={{ fontWeight: vista === "taller" ? 700 : 400 }}
        >
          Por taller
        </button>
        <button
          onClick={() => cambiarVista("usuario")}
          style={{ fontWeight: vista === "usuario" ? 700 : 400 }}
        >
          Por usuario
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {vista === "taller" && (
        <section className={estilos.panel}>
          <h2>Lista de asistencia por taller</h2>
          <select value={tallerId} onChange={(e) => elegirTaller(e.target.value)}>
            <option value="">Elige un taller</option>
            {talleres.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} — {formatearFecha(t.fecha)}
              </option>
            ))}
          </select>

          {!tallerId && <p>Elige un taller para ver a sus alumnos.</p>}
          {cargando && <p>Cargando asistencias…</p>}

          {tallerId && !cargando && asistencias.length === 0 && !error && (
            <p>Este taller todavía no tiene alumnos inscritos.</p>
          )}

          {asistencias.length > 0 && (
            <>
              <p>
                <strong>{tallerActual ? tallerActual.nombre : "Taller"}:</strong>{" "}
                vinieron {vinieron} de {asistencias.length} alumnos.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Boleta</th>
                    <th>¿Vino?</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>{a.nombre_alumno}</td>
                      <td>{a.boleta}</td>
                      <td>
                        <select
                          value={a.asistio ? "si" : "no"}
                          disabled={guardando === a.id}
                          onChange={(e) => marcar(a, e.target.value === "si")}
                        >
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}

      {vista === "usuario" && (
        <section className={estilos.panel}>
          <h2>Asistencias por usuario</h2>
          <form onSubmit={buscar} className="formulario">
            <input
              placeholder="Boleta (10 dígitos)"
              value={boleta}
              onChange={(e) => setBoleta(e.target.value)}
            />
            <button type="submit" disabled={cargando}>
              {cargando ? "Buscando…" : "Buscar"}
            </button>
          </form>

          {resultado && resultado.length === 0 && (
            <p>La boleta {boletaBuscada} no está inscrita en ningún taller.</p>
          )}

          {resultado && resultado.length > 0 && (
            <>
              <p>
                <strong>{resultado[0].nombre_alumno}</strong> — boleta{" "}
                {boletaBuscada}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Taller</th>
                    <th>Fecha</th>
                    <th>¿Vino?</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.taller_nombre}</td>
                      <td>{formatearFecha(r.taller_fecha)}</td>
                      <td>{r.asistio ? "Sí" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}
    </main>
  );
}
