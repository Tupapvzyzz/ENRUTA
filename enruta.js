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
