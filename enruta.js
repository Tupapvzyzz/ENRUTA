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
