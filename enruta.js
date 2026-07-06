function ocultar(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'))}
function mostrar(id){ocultar();document.getElementById(id).classList.add('active')}
function valor(id,def){const el=document.getElementById(id);return el&&el.value.trim()?el.value.trim():def}
function volverInicio(){mostrar('inicio')}function abrirLogin(){mostrar('login')}function abrirTipoLogin(){mostrar('tipoLogin')}
function abrirCliente(){mostrar('registroCliente')}function abrirClienteVerificacion(){mostrar('registroClienteVerificacion')}function abrirClienteListo(){mostrar('registroClienteListo')}
function abrirRepartidor(){mostrar('registroRepartidorDatos')}function abrirDocsRepartidor(){mostrar('registroRepartidorDocs')}function abrirRepartidorListo(){mostrar('registroRepartidorListo')}
function abrirHomeCliente(){mostrar('homeCliente')}function abrirHomeRepartidor(){mostrar('homeRepartidor')}
function abrirPublicarPedido(){mostrar('publicarPedido')}
function confirmarPedido(){
  document.getElementById('rRecojo').textContent=valor('recojo','Jesús María');
  document.getElementById('rEntrega').textContent=valor('entrega','Lince');
  document.getElementById('rPaquete').textContent=valor('paquete','Paquete pequeño');
  document.getElementById('rPeso').textContent=valor('peso','Mediano');
  document.getElementById('rPrecio').textContent=valor('precio','S/ 9.00');
  document.getElementById('rObs').textContent=valor('obs','Sin observaciones');
  mostrar('confirmarPedido')
}
function abrirBuscando(){mostrar('buscando')}function abrirOfertas(){mostrar('ofertas')}
let lastDriver={name:'Carlos R.',placa:'ABC-123',precio:'S/ 8.50'};
function abrirAsignado(name,placa,precio){
  if(name){lastDriver={name,placa,precio}}
  document.getElementById('driverName').textContent=lastDriver.name;
  document.getElementById('driverPlaca').textContent=lastDriver.placa;
  document.getElementById('driverPrecio').textContent=lastDriver.precio;
  mostrar('asignado')
}
function abrirSeguimiento(){mostrar('seguimiento')}function abrirEntregado(){mostrar('entregado')}
function abrirDetallePedido(){mostrar('detallePedido')}function abrirEnviarOferta(){mostrar('enviarOferta')}function abrirOfertaEnviada(){mostrar('ofertaEnviada')}
function abrirPedidoAceptado(){mostrar('pedidoAceptado')}function abrirRecojoConfirmado(){mostrar('recojoConfirmado')}function abrirEntregaFinalizada(){mostrar('entregaFinalizada')}
function calcularPrecioPorKm(km) {
  const precio = km * 1.10;
  return precio.toFixed(2);
}

function abrirConfirmarPedido() {
  const recojo = document.getElementById("recojoPedido").value || "Av. Brasil 1450";
  const entrega = document.getElementById("entregaPedido").value || "Av. Arequipa 850";
  const descripcion = document.getElementById("descripcionPedido").value || "Paquete pequeño";
  const peso = document.getElementById("pesoPedido").value || "2 kg";

  const distanciaKm = 4.35;
  const precio = calcularPrecioPorKm(distanciaKm);

  document.getElementById("resumenRecojo").textContent = recojo;
  document.getElementById("resumenEntrega").textContent = entrega;
  document.getElementById("resumenDescripcion").textContent = descripcion;
  document.getElementById("resumenPeso").textContent = peso;
  document.getElementById("resumenDistancia").textContent = distanciaKm + " km";
  document.getElementById("resumenPrecio").textContent = "S/ " + precio;
  function abrirVerificacionCliente(){

    ocultar();

    document
        .getElementById("registroClienteVerificacion")
        .classList.add("active");

}

function abrirClienteListo(){

    ocultar();

    document
        .getElementById("registroClienteListo")
        .classList.add("active");

}

  mostrar("confirmarPedido");
}
