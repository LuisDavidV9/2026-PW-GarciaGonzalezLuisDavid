// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).
const $ = (id) => document.getElementById(id);

// Esta función existe para no repetir fetch(...) con sus try/catch en cada botón.
// Si cada botón hiciera su propio fetch, cualquier cambio (por ejemplo agregar un header)
// lo tendría que copiar y pegar en 10 lugares distintos, y tarde o temprano se me iba a olvidar
// hacerlo en alguno. Aquí lo hago una sola vez y ya.
async function llamar(metodo, url, cuerpo) {
  const opciones = { method: metodo };
  if (cuerpo !== undefined) {
    // Solo mando headers y body cuando SÍ hay cuerpo (como en el login).
    // En un GET no tiene caso mandar Content-Type, así que lo dejo condicionado.
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(url, opciones);

  // Pongo el .json() en try/catch porque no todas las respuestas del servidor
  // traen JSON (por ejemplo, si algo truena feo y regresa HTML de error).
  // Si no hiciera esto, un error raro del servidor tiraría también mi JavaScript.
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (error) {
    datos = null;
  }

  return { status: respuesta.status, datos };
}

// Esta función pinta una línea en la "bitácora" (la lista donde se ve el historial de peticiones).
// La hice aparte de llamar() porque llamar() solo pide datos; anotar() es puro "dibujar en pantalla",
// y me gusta no mezclar "pedir cosas" con "pintar cosas" en la misma función.
function anotar(metodo, url, status, datos) {
  const li = document.createElement("li");

  // Esto es nada más para que el 200 se vea verde, el 401 rojo, etc.
  // Así de un vistazo sé si la petición salió bien o mal, sin tener que leer el número.
  let clase = "error";
  if (status >= 200 && status < 300) clase = "ok";
  else if (status === 401) clase = "e401";
  else if (status === 403) clase = "e403";

  const codigo = document.createElement("span");
  codigo.className = `codigo ${clase}`;
  codigo.textContent = status; // uso textContent y no innerHTML porque este dato (el status)
  // en teoría yo lo controlo, pero de todos modos es buena costumbre: textContent nunca
  // interpreta lo que le pongo como si fuera HTML, así que aunque algún día cambiara
  // de dónde sale este valor, no corro el riesgo de meter un <script> sin querer.

  const linea = document.createElement("span");
  linea.textContent = ` ${metodo} ${url}`;

  const pre = document.createElement("pre");
  // Aquí es TODAVÍA más importante usar textContent, porque "datos" viene directo
  // de lo que contestó el servidor. Si alguien pudiera meter algo como
  // "<img src=x onerror=...>" en su nombre de usuario y yo lo pintara con innerHTML,
  // ese código se ejecutaría en mi página. Con textContent, eso se muestra como puro texto,
  // nunca se ejecuta. Esa es básicamente la regla que vimos de XSS.
  pre.textContent = JSON.stringify(datos, null, 2);

  li.append(codigo, linea, pre);
  $("bitacora").prepend(li); // prepend y no append, para que lo más nuevo salga arriba
  // y no tenga que estar haciendo scroll hasta abajo cada vez que pruebo algo.
}

// Esta función le pregunta al servidor "¿quién soy ahorita?" y actualiza la tarjeta de estado.
// La separé de refrescarTodo() porque a veces solo quiero actualizar el estado
// (por ejemplo cada vez que pasa un rato) sin necesidad de también repintar la tabla completa.
async function pintarEstado() {
  const { status, datos } = await llamar("GET", "/api/sesion");
  const estado = $("estado");

  if (status === 200) {
    // Si el servidor dice 200 es porque sí me reconoció una sesión válida,
    // así que aquí sí tengo datos.usuario y puedo armar el mensaje bonito.
    estado.textContent = `${datos.usuario.nombre} (${datos.usuario.rol}) · sesión ${datos.sesion} · vence en ${datos.expiraEnSegundos} s`;
    estado.className = "estado con-sesion";
  } else {
    // Si no es 200 (normalmente 401), ni siquiera intento leer datos.usuario,
    // porque ahí ni siquiera existe: solo aviso que no hay sesión.
    estado.textContent = "Sin sesión (el servidor responde 401)";
    estado.className = "estado sin-sesion";
  }

  // Esto es justo lo que se compara en la prueba P-09: cuando httpOnly está en true,
  // document.cookie me va a salir vacío aunque SÍ haya una cookie guardada,
  // porque el navegador no deja que JavaScript la lea. Lo pinto aquí para verlo con mis ojos.
  $("cookie-js").textContent = document.cookie || "(vacío)";
}

// Esta función dibuja la tabla de "lo que guarda el servidor" (la tarjeta 4).
// La hice aparte de pintarEstado() porque son dos preguntas distintas:
// pintarEstado() responde "¿quién soy yo?" y pintarTabla() responde
// "¿qué sesiones existen en todo el servidor ahorita?" (ahí se nota lo de P-11, por ejemplo,
// cuando aparece una sola fila compartida entre la víctima y el atacante).
async function pintarTabla() {
  const { status, datos } = await llamar("GET", "/api/diagnostico/sesiones");
  const cuerpo = $("tabla-sesiones");
  cuerpo.replaceChildren(); // borro lo que había antes de volver a pintar,
  // si no, cada clic en "Actualizar tabla" iría apilando filas viejas encima de las nuevas.

  if (status !== 200 || !datos) {
    $("donde").textContent = "No se pudo leer la tabla del servidor";
    return; // si no hay datos válidos, prefiero cortar aquí a que truene más abajo
    // intentando leer datos.sesiones de algo que ni siquiera existe.
  }

  // Este texto es justo lo que se ve en P-15: avisa si las sesiones viven en MySQL
  // (sobreviven a que apague y prenda el servidor) o solo en memoria (se pierden).
  $("donde").textContent =
    datos.almacen === "mysql"
      ? "En MySQL, tabla sessions (sobreviven a un reinicio del servidor)"
      : "En la memoria del servidor (se pierden al reiniciar)";

  if (datos.sesiones.length === 0) {
    // Si no hay ninguna sesión activa, en vez de dejar la tabla vacía y que se vea
    // como que algo se rompió, prefiero poner un mensaje que diga claramente "no hay nada".
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 4;
    celda.textContent = "(sin sesiones)";
    fila.append(celda);
    cuerpo.append(fila);
    return;
  }

  for (const s of datos.sesiones) {
    const fila = document.createElement("tr");
    // Esto es para resaltar en amarillo cuál fila es "la mía" entre todas las que existen,
    // porque si no, con varias sesiones abiertas (como en P-11) es difícil saber cuál es cuál.
    if (s.esLaTuya) fila.className = "tuya";
    const textos = [
      s.esLaTuya ? `${s.sesion} (la tuya)` : s.sesion,
      s.usuario,
      s.visitas,
      // Convierto la fecha a algo legible en vez de dejar el formato crudo que manda el servidor,
      // porque igual la idea de esta tarjeta es que yo (humano) la pueda leer rápido.
      s.expira ? new Date(s.expira).toLocaleString() : "—",
    ];
    for (const texto of textos) {
      const celda = document.createElement("td");
      // Otra vez textContent y no innerHTML: el nombre de usuario que viene aquí
      // es un dato que puso alguien más (o yo mismo) en el login, así que lo trato
      // como texto sin confiar en que venga "limpio".
      celda.textContent = texto;
      fila.append(celda);
    }
    cuerpo.append(fila);
  }
}

// Junté pintarEstado() y pintarTabla() en una sola función porque casi siempre
// que necesito refrescar una, también quiero refrescar la otra (por ejemplo después
// de cualquier petición). Así no se me olvida actualizar una de las dos partes.
async function refrescarTodo() {
  await pintarEstado();
  await pintarTabla();
}

// Esta es la función que realmente usan los botones. Hace tres cosas en orden:
// pide el dato, lo anota en la bitácora, y refresca todo. La hice para no repetir
// ese mismo combo de 3 líneas en cada event listener de abajo.
async function ejecutar(metodo, url, cuerpo) {
  const { status, datos } = await llamar(metodo, url, cuerpo);
  anotar(metodo, url, status, datos);
  await refrescarTodo();
}

// Cuando mando el formulario de login, evito que la página se recargue sola (preventDefault)
// porque si se recarga, perdería toda la bitácora y tendría que volver a armar todo el estado
// desde cero; prefiero que la petición la maneje mi JavaScript.
$("form-login").addEventListener("submit", (evento) => {
  evento.preventDefault();
  ejecutar("POST", "/api/login", {
    usuario: $("usuario").value,
    contrasena: $("contrasena").value,
  });
});

// Esto es solo para que al cambiar de usuario en el select, me autocomplete
// la contraseña de prueba (ana12345, luis12345, etc.) y no tenga que escribirla
// cada vez a mano mientras estoy probando.
$("usuario").addEventListener("change", () => {
  $("contrasena").value = `${$("usuario").value}12345`;
});

// En vez de poner un addEventListener distinto para cada botón de la tarjeta 3,
// les puse a todos un atributo data-url y data-metodo en el HTML, y aquí los recorro
// a todos de un jalón. Si algún día agrego un botón nuevo, no tengo que tocar este archivo,
// solo el HTML.
document.querySelectorAll("[data-url]").forEach((boton) => {
  boton.addEventListener("click", () => {
    ejecutar(boton.dataset.metodo, boton.dataset.url);
  });
});

// Estos dos botones no pasan por ejecutar() porque no quiero que aparezcan
// en la bitácora como si fueran una "petición a la API" más: son botones
// que solo sirven para refrescar lo que ya se ve en pantalla.
$("btn-refrescar").addEventListener("click", refrescarTodo);
$("btn-sesiones").addEventListener("click", pintarTabla);

// Esta función corre una sola vez, apenas se carga la página, para que
// desde el principio se vea la configuración actual del servidor (tarjeta 5)
// y el estado real de la sesión, sin que yo tenga que hacer clic en nada primero.
async function iniciar() {
  const { datos } = await llamar("GET", "/api/config");
  $("config").textContent = JSON.stringify(datos, null, 2);
  await refrescarTodo();
}

iniciar();
