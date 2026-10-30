import Link from "next/link";
import { useState } from "react";
import { pedirJSON } from "../lib/api";
import {
  validarNombre,
  validarCorreo,
  validarBoleta,
  validarContrasena,
} from "../lib/validaciones";
import estilos from "../styles/Talleres.module.css";

// /registro — formulario para crear un usuario (POST /api/usuarios).
export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [boleta, setBoleta] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function registrar(e) {
    e.preventDefault();
    setError("");
    setExito("");

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim();
    const boletaLimpia = boleta.trim();

    if (!nombreLimpio) return setError("Escribe tu nombre.");
    if (!validarNombre(nombreLimpio))
      return setError(
        "El nombre solo puede tener letras y espacios (de 3 a 100 caracteres).",
      );
    if (!validarCorreo(correoLimpio))
      return setError("El correo no tiene un formato válido.");
    if (!validarBoleta(boletaLimpia))
      return setError("La boleta debe tener 10 dígitos.");
    if (!validarContrasena(contrasena))
      return setError("La contraseña debe tener al menos 8 caracteres.");

    setEnviando(true);
    try {
      const usuario = await pedirJSON("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          boleta: boletaLimpia,
          contrasena,
        }),
      });
      setExito(`¡Listo! ${usuario.nombre} quedó registrado(a).`);
      setNombre("");
      setCorreo("");
      setBoleta("");
      setContrasena("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <h1>Registro de usuario</h1>

      <section className={estilos.panel}>
        <form onSubmit={registrar} className="formulario">
          <input
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            placeholder="Boleta (10 dígitos)"
            value={boleta}
            onChange={(e) => setBoleta(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          <button type="submit" disabled={enviando}>
            {enviando ? "Registrando…" : "Registrarme"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {exito && (
          <p className={estilos.exito}>
            {exito} Ya puedes ver tu <Link href="/perfil">perfil</Link>.
          </p>
        )}
      </section>
    </main>
  );
}
