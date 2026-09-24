const talleres = [
  {
    nombre: "Introducción a Python",
    instructor: "Ing. María López",
    cupo: 25,
    inscritos: 25,
  },
  {
    nombre: "Fundamentos de Redes",
    instructor: "Ing. Carlos Ramírez",
    cupo: 30,
    inscritos: 18,
  },
  {
    nombre: "Diseño de Bases de Datos",
    instructor: "Ing. Ana Torres",
    cupo: 20,
    inscritos: 20,
  },
  {
    nombre: "Desarrollo Web con JS",
    instructor: "Ing. María López",
    cupo: 25,
    inscritos: 10,
  },
];

function pintarTabla() {
  const cuerpoTabla = document.querySelector("#tabla-talleres tbody");
  cuerpoTabla.innerHTML = "";

  talleres.forEach(function (taller) {
    const fila = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = taller.nombre;
    fila.appendChild(tdNombre);

    const tdInstructor = document.createElement("td");
    tdInstructor.textContent = taller.instructor;
    fila.appendChild(tdInstructor);

    const tdCupo = document.createElement("td");
    tdCupo.textContent = taller.cupo;
    fila.appendChild(tdCupo);

    const tdInscritos = document.createElement("td");
    tdInscritos.textContent = taller.inscritos;
    fila.appendChild(tdInscritos);

    cuerpoTabla.appendChild(fila);
  });
}
pintarTabla();

const formArreglos = document.getElementById("form-arreglos");
const resultadoArreglos = document.getElementById("resultado-arreglo");
const selectOperacionArreglo = document.getElementById("operacion-arreglo");

formArreglos.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const operacion = selectOperacionArreglo.value;

  let resultado;

  switch (operacion) {
    case "forEach": {
      const lineas = [];
      talleres.forEach((t) =>
        lineas.push(`- ${t.nombre} (${t.inscritos}/${t.cupo})`),
      );
      resultado = lineas.join("\n");
      break;
    }

    case "map": {
      const nombres = talleres.map((t) => t.nombre);
      resultado = nombres.map((n) => `- ${n}`).join("\n");
      break;
    }

    case "filter": {
      const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
      resultado = llenos.length
        ? llenos
            .map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`)
            .join("\n")
        : "No hay talleres con el cupo lleno.";
      break;
    }

    case "find": {
      const encontrado = talleres.find(
        (t) => t.instructor === "Ing. María López",
      );
      resultado = encontrado
        ? `Primer taller de ${encontrado.instructor}:\n- ${encontrado.nombre} (${encontrado.inscritos}/${encontrado.cupo})`
        : "No se encontró ningún taller de ese instructor.";
      break;
    }

    case "reduce": {
      const totalInscritos = talleres.reduce(
        (acumulado, t) => acumulado + t.inscritos,
        0,
      );
      resultado = `Total de inscritos en todos los talleres: ${totalInscritos}`;
      break;
    }

    case "filtermap": {
      const conCupo = talleres
        .filter((t) => t.inscritos < t.cupo)
        .map((t) => t.nombre);
      resultado = conCupo.length
        ? conCupo.map((n) => `- ${n}`).join("\n")
        : "No hay talleres con cupo disponible.";
      break;
    }

    default:
      resultado = "Selecciona una operación válida.";
  }

  resultadoArreglos.textContent = resultado;
});
