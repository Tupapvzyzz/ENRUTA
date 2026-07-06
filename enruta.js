let pedidos=JSON.parse(localStorage.getItem('pedidosEnruta'))||[];

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const screen=document.getElementById(id);
  if(!screen){alert('ERROR: no existe la pantalla: '+id);return;}
  screen.classList.add('active');
  if(id==='homeCliente')renderClientePedidos();
  if(id==='homeRepartidor')renderRepartidorPedidos();
}

function requireFields(ids){
  for(const id of ids){
    const el=document.getElementById(id);
    if(!el||!el.value.trim()){alert('Completa todos los campos.');return false;}
  }
  return true;
}

function goClienteVerificacion(){
  if(!requireFields(['clienteNombre','clienteDni','clienteEmail','clienteCelular','clienteDireccion']))return;
  localStorage.setItem('clienteNombre',document.getElementById('clienteNombre').value.trim());
  showScreen('clienteVerificacion');
}

function goRepartidorDocs(){
  if(!requireFields(['repNombre','repDni','repEmail','repCelular','repDireccion']))return;
  showScreen('repartidorDocs');
}

function calcularPrecio(){
  const km=parseFloat(document.getElementById('kmPedido').value)||0;
  const precio=km*1.10;
  document.getElementById('precioPedido').textContent='S/ '+precio.toFixed(2);
}

function publicarPedido(){
  const origen=document.getElementById('origenPedido').value.trim();
  const destino=document.getElementById('destinoPedido').value.trim();
  const tipo=document.getElementById('tipoPaquete').value.trim();
  const km=parseFloat(document.getElementById('kmPedido').value)||0;
  if(!origen||!destino||!tipo||km<=0){alert('Completa todos los datos del pedido.');return;}
  const precio=km*1.10, comision=precio*0.09, ganancia=precio-comision;
  const pedido={id:Date.now(),origen,destino,tipo,km:km.toFixed(2),precio:precio.toFixed(2),comision:comision.toFixed(2),ganancia:ganancia.toFixed(2),estado:'Publicado'};
  pedidos.unshift(pedido);
  localStorage.setItem('pedidosEnruta',JSON.stringify(pedidos));
  document.getElementById('origenPedido').value='';
  document.getElementById('destinoPedido').value='';
  document.getElementById('tipoPaquete').value='';
  document.getElementById('kmPedido').value='';
  document.getElementById('precioPedido').textContent='S/ 0.00';
  alert('Pedido publicado correctamente.');
  renderClientePedidos();
}

function renderClientePedidos(){
  const box=document.getElementById('clientePedidos'); if(!box)return;
  if(pedidos.length===0){box.innerHTML='<div class="empty">Aún no tienes pedidos publicados.</div>';return;}
  box.innerHTML=pedidos.map(p=>`<div class="order-card"><h3>${p.tipo}</h3><p><strong>Recojo:</strong> ${p.origen}</p><p><strong>Entrega:</strong> ${p.destino}</p><p><strong>Distancia:</strong> ${p.km} km</p><p><strong>Estado:</strong> ${p.estado}</p><div class="money">S/ ${p.precio}</div></div>`).join('');
}

function renderRepartidorPedidos(){
  const box=document.getElementById('repartidorPedidos'); if(!box)return;
  const disponibles=pedidos.filter(p=>p.estado==='Publicado');
  if(disponibles.length===0){box.innerHTML='<div class="empty">No hay pedidos disponibles.</div>';return;}
  box.innerHTML=disponibles.map(p=>`<div class="order-card"><h3>${p.tipo}</h3><p><strong>Recojo:</strong> ${p.origen}</p><p><strong>Entrega:</strong> ${p.destino}</p><p><strong>Distancia:</strong> ${p.km} km</p><p><strong>Comisión ENRUTA:</strong> S/ ${p.comision}</p><p><strong>Ganancia repartidor:</strong> S/ ${p.ganancia}</p><div class="money">S/ ${p.precio}</div><button class="small-btn" onclick="tomarPedido(${p.id})">Tomar pedido</button></div>`).join('');
}

function tomarPedido(id){
  pedidos=pedidos.map(p=>p.id===id?{...p,estado:'Tomado por repartidor'}:p);
  localStorage.setItem('pedidosEnruta',JSON.stringify(pedidos));
  alert('Pedido tomado correctamente.');
  renderRepartidorPedidos();
}
let map;
let directionsService;
let directionsRenderer;
let autocompleteOrigen;
let autocompleteDestino;
let distanciaKm = 0;

function initMap() {
  map = new google.maps.Map(document.getElementById("mapaCliente"), {
    center: { lat: -12.0464, lng: -77.0428 },
    zoom: 12,
    disableDefaultUI: true
  });

  directionsService = new google.maps.DirectionsService();

  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false
  });

  autocompleteOrigen = new google.maps.places.Autocomplete(
    document.getElementById("origenPedido"),
    {
      componentRestrictions: { country: "pe" },
      fields: ["formatted_address", "geometry", "name"]
    }
  );

  autocompleteDestino = new google.maps.places.Autocomplete(
    document.getElementById("destinoPedido"),
    {
      componentRestrictions: { country: "pe" },
      fields: ["formatted_address", "geometry", "name"]
    }
  );

  autocompleteOrigen.addListener("place_changed", calcularRutaReal);
  autocompleteDestino.addListener("place_changed", calcularRutaReal);
}

function calcularRutaReal() {
  const origen = document.getElementById("origenPedido").value.trim();
  const destino = document.getElementById("destinoPedido").value.trim();

  if (!origen || !destino) return;

  directionsService.route(
    {
      origin: origen,
      destination: destino,
      travelMode: google.maps.TravelMode.DRIVING
    },
    function (result, status) {
      if (status !== "OK") {
        alert("No se pudo calcular la ruta. Verifica las direcciones.");
        return;
      }

      directionsRenderer.setDirections(result);

      const leg = result.routes[0].legs[0];

      distanciaKm = leg.distance.value / 1000;
      const precio = distanciaKm * 1.10;

      document.getElementById("distanciaReal").textContent =
        distanciaKm.toFixed(2) + " km";

      document.getElementById("tiempoReal").textContent =
        "Tiempo estimado: " + leg.duration.text;

      document.getElementById("precioPedido").textContent =
        "S/ " + precio.toFixed(2);
    }
  );
}

function calcularPrecio() {
  calcularRutaReal();
}

function publicarPedido() {
  const origen = document.getElementById("origenPedido").value.trim();
  const destino = document.getElementById("destinoPedido").value.trim();
  const tipo = document.getElementById("tipoPaquete").value.trim();

  if (!origen || !destino || !tipo || distanciaKm <= 0) {
    alert("Completa origen, destino, tipo de paquete y espera que se calcule la ruta.");
    return;
  }

  const precio = distanciaKm * 1.10;
  const comision = precio * 0.09;
  const ganancia = precio - comision;

  const pedido = {
    id: Date.now(),
    origen,
    destino,
    tipo,
    km: distanciaKm.toFixed(2),
    precio: precio.toFixed(2),
    comision: comision.toFixed(2),
    ganancia: ganancia.toFixed(2),
    estado: "Publicado"
  };

  pedidos.unshift(pedido);
  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));

  alert("Pedido publicado correctamente.");
  renderClientePedidos();
}
let pedidoActualId = null;

function tomarPedido(id) {
  pedidos = pedidos.map(p => {
    if (p.id === id) {
      pedidoActualId = id;
      return { ...p, estado: "Tomado por repartidor" };
    }
    return p;
  });

  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));
  abrirPedidoCurso(id);
}

function abrirPedidoCurso(id) {
  pedidoActualId = id;

  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) {
    alert("Pedido no encontrado.");
    return;
  }

  document.getElementById("cursoEstado").textContent = "Estado: " + pedido.estado;

  document.getElementById("cursoDetalle").innerHTML = `
    <h3>${pedido.tipo}</h3>
    <p><strong>Recojo:</strong> ${pedido.origen}</p>
    <p><strong>Entrega:</strong> ${pedido.destino}</p>
    <p><strong>Distancia:</strong> ${pedido.km} km</p>
    <p><strong>Precio:</strong> S/ ${pedido.precio}</p>
    <p><strong>Comisión ENRUTA:</strong> S/ ${pedido.comision}</p>
    <p><strong>Gana repartidor:</strong> S/ ${pedido.ganancia}</p>
  `;

  showScreen("pedidoCurso");
}

function cambiarEstadoPedido(nuevoEstado) {
  if (!pedidoActualId) return;

  pedidos = pedidos.map(p => {
    if (p.id === pedidoActualId) {
      return { ...p, estado: nuevoEstado };
    }
    return p;
  });

  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));
  abrirPedidoCurso(pedidoActualId);
}

function finalizarPedido() {
  if (!pedidoActualId) return;

  pedidos = pedidos.map(p => {
    if (p.id === pedidoActualId) {
      return { ...p, estado: "Entregado" };
    }
    return p;
  });

  localStorage.setItem("pedidosEnruta", JSON.stringify(pedidos));
  alert("Pedido entregado correctamente.");
  showScreen("homeRepartidor");
}

function abrirHistorialCliente() {
  showScreen("historialCliente");
  const lista = document.getElementById("historialClienteLista");

  const historial = pedidos.filter(p => p.estado === "Entregado");

  if (historial.length === 0) {
    lista.innerHTML = `<div class="empty">Aún no tienes pedidos entregados.</div>`;
    return;
  }

  lista.innerHTML = historial.map(p => `
    <div class="order-card">
      <h3>${p.tipo}</h3>
      <p><strong>Recojo:</strong> ${p.origen}</p>
      <p><strong>Entrega:</strong> ${p.destino}</p>
      <p><strong>Total:</strong> S/ ${p.precio}</p>
      <p><strong>Estado:</strong> ${p.estado}</p>
    </div>
  `).join("");
}

function abrirHistorialRepartidor() {
  showScreen("historialRepartidor");
  const lista = document.getElementById("historialRepartidorLista");

  const historial = pedidos.filter(p => p.estado === "Entregado");

  if (historial.length === 0) {
    lista.innerHTML = `<div class="empty">Aún no tienes entregas finalizadas.</div>`;
    return;
  }

  lista.innerHTML = historial.map(p => `
    <div class="order-card">
      <h3>${p.tipo}</h3>
      <p><strong>Distancia:</strong> ${p.km} km</p>
      <p><strong>Cliente pagó:</strong> S/ ${p.precio}</p>
      <p><strong>Comisión:</strong> S/ ${p.comision}</p>
      <p><strong>Tu ganancia:</strong> S/ ${p.ganancia}</p>
    </div>
  `).join("");
}
