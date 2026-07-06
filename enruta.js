function ocultar() {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });
}

function mostrar(id) {
  ocultar();
  const pantalla = document.getElementById(id);

  if (!pantalla) {
    alert("ERROR: No existe la pantalla con id: " + id);
    return;
  }

  pantalla.classList.add("active");
}

function volverInicio() {
  mostrar("inicio");
}

function abrirCliente() {
  mostrar("clienteDatos");
}

function abrirClienteVerificacion() {
  mostrar("clienteVerificacion");
}

function abrirClienteListo() {
  mostrar("clienteListo");
}

function abrirHomeCliente() {
  mostrar("homeCliente");
}

function abrirRepartidorDatos() {
  mostrar("repartidorDatos");
}

function abrirRepartidorDocs() {
  mostrar("repartidorDocs");
}

function abrirRepartidorListo() {
  mostrar("repartidorListo");
}

function calcularPrecio() {
  const km = parseFloat(document.getElementById("kmPedido").value) || 0;
  const precio = km * 1.10;
  document.getElementById("precioPedido").textContent = "S/ " + precio.toFixed(2);
}

function publicarPedido() {
  const origen = document.getElementById("origenPedido").value.trim();
  const destino = document.getElementById("destinoPedido").value.trim();
  const tipo = document.getElementById("tipoPaquete").value.trim();
  const km = parseFloat(document.getElementById("kmPedido").value) || 0;

  if (!origen || !destino || !tipo || km <= 0) {
    alert("Completa todos los datos del pedido.");
    return;
  }

  const precio = km * 1.10;
  alert("Pedido publicado por S/ " + precio.toFixed(2));
}
