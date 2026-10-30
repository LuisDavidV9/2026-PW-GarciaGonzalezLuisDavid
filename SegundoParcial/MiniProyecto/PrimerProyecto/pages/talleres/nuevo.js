import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { pedirJSON } from "../../lib/api";
import {
  validarNombreTaller,
  validarInstructor,
  validarFecha,
  validarCupo,
} from "../../lib/validaciones";
import estilos from "../../styles/Talleres.module.css";

// /talleres/nuevo — formulario para crear un taller (POST /api/talleres).
export default function NuevoTaller() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [instructor, setInstructor] = useState("");
  const [fecha, setFecha] = useState("");
  const [cupo, setCupo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function crear(e) {
    e.preventDefault();
    setError("");

    const nombreLimpio = nombre.trim();
    const instructorLimpio = instructor.trim();
    const cupoLimpio = cupo.trim();

    if (!nombreLimpio) return setError("Escribe el nombre del taller.");
    if (!validarNombreTaller(nombreLimpio))
      return setError("El nombre del taller debe tener de 3 a 100 caracteres.");
    if (instructorLimpio && !validarInstructor(instructorLimpio))
      return setError(
        "El instructor solo puede tener letras, espacios y puntos (de 3 a 100 caracteres).",
      );
    if (!fecha) return setError("Elige la fecha del taller.");
    if (!validarFecha(fecha)) return setError("La fecha no es válida.");
    if (!cupoLimpio) return setError("Escribe el cupo del taller.");
    if (!validarCupo(cupoLimpio))
      return setError("El cupo debe ser un número entero entre 1 y 500.");

    setEnviando(true);
    try {
      const taller = await pedirJSON("/talleres", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombreLimpio,
          instructor: instructorLimpio || null,
          fecha,
          cupo: Number(cupoLimpio),
        }),
      });
      // Al crearse, se abre el detalle del taller nuevo.
      router.push(`/talleres/${taller.id}`);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main>
      <Link className={estilos.volver} href="/talleres">
        ← Volver a talleres
      </Link>
      <h1>Nuevo taller</h1>

      <section className={estilos.panel}>
        <form onSubmit={crear} className="formulario">
          <input
            placeholder="Nombre del taller"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Instructor (opcional)"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <input
            placeholder="Cupo (lugares disponibles)"
            value={cupo}
            onChange={(e) => setCupo(e.target.value)}
          />
          <button type="submit" disabled={enviando}>
            {enviando ? "Creando…" : "Crear taller"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
