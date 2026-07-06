function ocultar() {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
}

function volverInicio() {
  ocultar();
  document.getElementById("inicio").classList.add("active");
}

function abrirCliente() {
  ocultar();
  document.getElementById("clienteDatos").classList.add("active");
}

function abrirClienteVerificacion() {
  ocultar();
  document.getElementById("clienteVerificacion").classList.add("active");
}

function abrirClienteListo() {
  ocultar();
  document.getElementById("clienteListo").classList.add("active");
}

function abrirRepartidorDatos() {
  ocultar();
  document.getElementById("repartidorDatos").classList.add("active");
}

function abrirRepartidorDocs() {
  ocultar();
  document.getElementById("repartidorDocs").classList.add("active");
}

function abrirRepartidorListo() {
  ocultar();
  document.getElementById("repartidorListo").classList.add("active");
}
let pedidos = JSON.parse(localStorage.getItem("pedidosEnruta")) || [];

function abrirHomeCliente() {
  ocultar();
  document.getElementById("homeCliente").classList.add("active");
}

function calcularPrecio() {
  const km = parseFloat(document.getElementById("kmPedido").value) || 0;
  const precio = km * 1.10;

  document.getElementById("precioPedido").textContent =
    "S/ " + precio.toFixed(2);
}

function publicarPedido() {
  const origen = document.getElementById("origenPedido").value.trim();
  const destino = document.getElementById("destinoPedido").value.trim();
  const tipo = document.getElementById("tipoPaquete").value.trim();
  const km = parseFloat(document.getElementById("kmPedido").value) || 0;
  const precio = km * 1.10;

  if (!origen || !destino || !tipo || km <= 0) {
    alert("Completa todos los datos del pedido.");
    return;
  }

  const pedido = {
    id: Date.now(),
    origen,
    destino,
    tipo,
    km,
    precio: precio.toFixed(2),
    comision: (precio * 0.09).toFixed(2),
    repartidorRecibe: (precio * 0.91).toFixed(2),
    estado: "publicado"
  };

  pedidos.unshift(pedido);
  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));

  document.getElementById("pedidoPublicado").classList.remove("hidden");

  alert("Pedido publicado correctamente.");
}
