let rolActual = "";
let usuarioActual = null;
let pedidos = JSON.parse(localStorage.getItem("pedidosEnruta")) || [];
let ganancias = Number(localStorage.getItem("gananciasEnruta")) || 0;

const precioPorKm = 1.10;
const comision = 0.09;

function mostrarPantalla(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

function seleccionarRol(rol) {
  rolActual = rol;

  const titulo = document.getElementById("tituloRegistro");
  const camposRepartidor = document.getElementById("camposRepartidor");

  if (rol === "cliente") {
    titulo.textContent = "Registro de cliente";
    camposRepartidor.classList.add("hidden");
  } else {
    titulo.textContent = "Registro de repartidor";
    camposRepartidor.classList.remove("hidden");
  }

  mostrarPantalla("pantallaRegistro");
}

document.getElementById("formRegistro").addEventListener("submit", function(e) {
  e.preventDefault();

  usuarioActual = {
    rol: rolActual,
    nombre: document.getElementById("nombre").value,
    telefono: document.getElementById("telefono").value,
    dni: document.getElementById("dni").value,
    placa: document.getElementById("placa").value,
    soat: document.getElementById("soat").value,
    licencia: document.getElementById("licencia").value
  };

  localStorage.setItem("usuarioEnruta", JSON.stringify(usuarioActual));

  prepararVerificacion();
});

function prepararVerificacion() {
  const texto = document.getElementById("textoVerificacion");
  const uploadMoto = document.getElementById("uploadMoto");

  if (rolActual === "cliente") {
    texto.textContent = "Para proteger la plataforma, necesitamos verificar tu identidad.";
    uploadMoto.classList.add("hidden");
  } else {
    texto.textContent = "Verifica tu identidad, moto, SOAT y licencia para empezar a rutear.";
    uploadMoto.classList.remove("hidden");
  }

  mostrarPantalla("pantallaVerificacion");
}

function finalizarVerificacion() {
  const usuario = JSON.parse(localStorage.getItem("usuarioEnruta"));

  if (!usuario) return;

  usuario.verificado = true;
  localStorage.setItem("usuarioEnruta", JSON.stringify(usuario));
  usuarioActual = usuario;

  const mensaje = document.getElementById("mensajeListo");

  if (usuario.rol === "cliente") {
    mensaje.textContent = "Tu cuenta de cliente está lista. Ya puedes publicar pedidos.";
  } else {
    mensaje.textContent = "Tu cuenta de repartidor está lista. Ya puedes aceptar pedidos.";
  }

  mostrarPantalla("pantallaListo");
}

function entrarPanel() {
  usuarioActual = JSON.parse(localStorage.getItem("usuarioEnruta"));

  if (!usuarioActual) {
    mostrarPantalla("pantallaRol");
    return;
  }

  if (usuarioActual.rol === "cliente") {
    renderPedidosCliente();
    mostrarPantalla("panelCliente");
  } else {
    renderPedidosRepartidor();
    actualizarGanancias();
    mostrarPantalla("panelRepartidor");
  }
}

function calcularPrecio() {
  const distancia = Number(document.getElementById("distancia").value);
  const resultado = document.getElementById("resultadoPrecio");

  if (!distancia || distancia <= 0) {
    alert("Ingresa una distancia válida en km.");
    return;
  }

  const precio = distancia * precioPorKm;
  const gananciaRepartidor = precio * (1 - comision);
  const gananciaApp = precio * comision;

  resultado.innerHTML = `
    <strong>Precio estimado:</strong> S/ ${precio.toFixed(2)}<br>
    <small>Repartidor recibe: S/ ${gananciaRepartidor.toFixed(2)}</small><br>
    <small>Comisión ENRUTA 9%: S/ ${gananciaApp.toFixed(2)}</small>
  `;

  resultado.classList.remove("hidden");
}

function publicarPedido() {
  const origen = document.getElementById("origen").value.trim();
  const destino = document.getElementById("destino").value.trim();
  const distancia = Number(document.getElementById("distancia").value);

  if (!origen || !destino || !distancia) {
    alert("Completa origen, destino y distancia.");
    return;
  }

  const precio = distancia * precioPorKm;

  const pedido = {
    id: Date.now(),
    cliente: usuarioActual.nombre,
    origen,
    destino,
    distancia,
    precio,
    estado: "Disponible",
    repartidor: null
  };

  pedidos.push(pedido);
  guardarPedidos();

  document.getElementById("origen").value = "";
  document.getElementById("destino").value = "";
  document.getElementById("distancia").value = "";
  document.getElementById("resultadoPrecio").classList.add("hidden");

  renderPedidosCliente();

  alert("Pedido publicado correctamente.");
}

function renderPedidosCliente() {
  const lista = document.getElementById("listaPedidosCliente");

  if (!lista) return;

  const misPedidos = pedidos.filter(p => p.cliente === usuarioActual.nombre);

  if (misPedidos.length === 0) {
    lista.innerHTML = "<p>Aún no tienes pedidos.</p>";
    return;
  }

  lista.innerHTML = misPedidos.map(p => `
    <div class="pedido">
      <p><strong>${p.origen}</strong> → ${p.destino}</p>
      <p>${p.distancia} km</p>
      <p>Precio: S/ ${p.precio.toFixed(2)}</p>
      <p>Estado: ${p.estado}</p>
      ${p.repartidor ? `<p>Repartidor: ${p.repartidor}</p>` : ""}
    </div>
  `).join("");
}

function renderPedidosRepartidor() {
  const lista = document.getElementById("listaPedidosRepartidor");

  if (!lista) return;

  const disponibles = pedidos.filter(p => p.estado === "Disponible");

  if (disponibles.length === 0) {
    lista.innerHTML = "<p>No hay pedidos disponibles por ahora.</p>";
    return;
  }

  lista.innerHTML = disponibles.map(p => {
    const gana = p.precio * (1 - comision);

    return `
      <div class="pedido">
        <p><strong>${p.origen}</strong> → ${p.destino}</p>
        <p>Cliente: ${p.cliente}</p>
        <p>Distancia: ${p.distancia} km</p>
        <p>Precio total: S/ ${p.precio.toFixed(2)}</p>
        <p>Tu ganancia: S/ ${gana.toFixed(2)}</p>
        <button onclick="aceptarPedido(${p.id})">Aceptar pedido</button>
      </div>
    `;
  }).join("");
}

function aceptarPedido(id) {
  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) return;

  pedido.estado = "Aceptado";
  pedido.repartidor = usuarioActual.nombre;

  const ganancia = pedido.precio * (1 - comision);
  ganancias += ganancia;

  localStorage.setItem("gananciasEnruta", ganancias);
  guardarPedidos();

  renderPedidosRepartidor();
  actualizarGanancias();

  alert("Pedido aceptado. Ruta asignada.");
}

function actualizarGanancias() {
  const box = document.getElementById("ganancias");

  if (box) {
    box.textContent = `S/ ${ganancias.toFixed(2)}`;
  }
}

function guardarPedidos() {
  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));
}

function cerrarSesion() {
  localStorage.removeItem("usuarioEnruta");
  usuarioActual = null;
  rolActual = "";
  mostrarPantalla("pantallaInicio");
}

window.addEventListener("load", () => {
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioEnruta"));

  if (usuarioGuardado && usuarioGuardado.verificado) {
    usuarioActual = usuarioGuardado;
    rolActual = usuarioGuardado.rol;
  }
});
