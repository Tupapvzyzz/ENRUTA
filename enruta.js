const PRICE_PER_KM = 1.10;
const COMMISSION = 0.09;
const MIN_PRICE = 5;
const DOCS = [
  ['fa-regular fa-id-card','DNI','Foto frontal y reverso'],
  ['fa-solid fa-id-card','Licencia','Licencia vigente'],
  ['fa-solid fa-motorcycle','Foto de moto','Moto clara y visible'],
  ['fa-solid fa-shield-halved','SOAT','SOAT vigente'],
  ['fa-regular fa-file-lines','Tarjeta propiedad','Documento de propiedad']
];

let cliente = JSON.parse(localStorage.getItem('clienteEnrutaMVP')) || null;
let repartidor = JSON.parse(localStorage.getItem('repartidorEnrutaMVP')) || null;
let pedidos = JSON.parse(localStorage.getItem('pedidosEnrutaMVP')) || [];
let rolActual = localStorage.getItem('rolEnrutaMVP') || 'cliente';
let pedidoDetalleId = Number(localStorage.getItem('pedidoDetalleEnrutaMVP')) || null;
let ratingValue = 5;
let ultimoClienteMsg = localStorage.getItem('notificacionClienteMVP') || 'Sin notificaciones nuevas';

const $ = id => document.getElementById(id);
const money = n => 'S/ ' + Number(n || 0).toFixed(2);
const now = () => new Date().toLocaleString('es-PE');

function savePedidos(){ localStorage.setItem('pedidosEnrutaMVP', JSON.stringify(pedidos)); }
function saveCliente(){ localStorage.setItem('clienteEnrutaMVP', JSON.stringify(cliente)); }
function saveRepartidor(){ localStorage.setItem('repartidorEnrutaMVP', JSON.stringify(repartidor)); }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2300); }

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const screen = $(id);
  if(screen) screen.classList.add('active');
  renderAll();
}

function previewPhoto(inputId, previewId){
  const file = $(inputId)?.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => { $(previewId).innerHTML = `<img src="${e.target.result}" alt="foto">`; $(previewId).dataset.photo = e.target.result; };
  reader.readAsDataURL(file);
}

function getPhoto(previewId){ return $(previewId)?.dataset?.photo || ''; }

function goClienteVerificacion(){
  const nombre=$('clienteNombre').value.trim();
  const dni=$('clienteDni').value.trim();
  const email=$('clienteEmail').value.trim();
  const celular=$('clienteCelular').value.trim();
  const direccion=$('clienteDireccion').value.trim();
  if(!nombre || !dni || !celular){ toast('Completa nombre, DNI y celular.'); return; }
  cliente = { nombre, dni, email, celular, direccion, foto:getPhoto('clienteFotoPreview'), verificado:false, rating:5, ratings:[] };
  saveCliente();
  showScreen('clienteVerificacion');
}

function clienteListo(){ cliente = cliente || {}; cliente.verificado = true; saveCliente(); showScreen('clienteListo'); }

function goRepartidorDocs(){
  const nombre=$('repNombre').value.trim();
  const dni=$('repDni').value.trim();
  const celular=$('repCelular').value.trim();
  if(!nombre || !dni || !celular){ toast('Completa nombre, DNI y celular.'); return; }
  repartidor = { nombre, dni, email:$('repEmail').value.trim(), celular, direccion:$('repDireccion').value.trim(), moto:$('repMoto').value.trim(), foto:getPhoto('repFotoPreview'), verificado:false, rating:5, ratings:[] };
  saveRepartidor();
  showScreen('repartidorDocs');
}

function repartidorListo(){ repartidor = repartidor || {}; repartidor.verificado = true; saveRepartidor(); showScreen('repartidorListo'); }

function loginCliente(){
  cliente = JSON.parse(localStorage.getItem('clienteEnrutaMVP')) || {nombre:'Anthony',dni:'-',email:'-',celular:'999999999',direccion:'Lima',foto:'',verificado:true,rating:5,ratings:[]};
  saveCliente(); rolActual='cliente'; localStorage.setItem('rolEnrutaMVP',rolActual); showScreen('homeCliente');
}
function loginRepartidor(){
  repartidor = JSON.parse(localStorage.getItem('repartidorEnrutaMVP')) || {nombre:'Repartidor Demo',dni:'-',email:'-',celular:'999999999',direccion:'Lima',moto:'Moto demo',foto:'',verificado:true,rating:5,ratings:[]};
  saveRepartidor(); rolActual='repartidor'; localStorage.setItem('rolEnrutaMVP',rolActual); showScreen('homeRepartidor');
}
function demoReset(){ if(confirm('¿Borrar datos demo y empezar limpio?')){ localStorage.removeItem('pedidosEnrutaMVP'); localStorage.removeItem('clienteEnrutaMVP'); localStorage.removeItem('repartidorEnrutaMVP'); localStorage.removeItem('notificacionClienteMVP'); location.reload(); }}

function calcularRutaDemo(){
  const km = Number($('kmPedido')?.value || 0);
  const precio = km > 0 ? Math.max(MIN_PRICE, km * PRICE_PER_KM) : 0;
  if($('distanciaReal')) $('distanciaReal').textContent = km > 0 ? km.toFixed(2) + ' km' : '0.00 km';
  if($('tiempoReal')) $('tiempoReal').textContent = km > 0 ? 'Tiempo estimado: ' + Math.max(8, Math.round(km * 4)) + ' min' : 'Tiempo estimado: --';
  if($('precioPedido')) $('precioPedido').textContent = money(precio);
}

function publicarPedido(){
  loginClienteSilencioso();
  const origen=$('origenPedido').value.trim();
  const destino=$('destinoPedido').value.trim();
  const tipo=$('tipoPaquete').value.trim();
  const nota=$('notaPedido').value.trim();
  const km=Number($('kmPedido').value || 0);
  if(!origen || !destino || !tipo || km<=0){ toast('Completa origen, destino, paquete y distancia.'); return; }
  const precio=Math.max(MIN_PRICE, km*PRICE_PER_KM);
  const comision=precio*COMMISSION;
  const ganancia=precio-comision;
  const pedido={
    id:Date.now(), cliente:cliente.nombre, clienteTelefono:cliente.celular, clienteFoto:cliente.foto,
    repartidor:'', repartidorTelefono:'', repartidorFoto:'', origen,destino,tipo,nota,
    km:Number(km).toFixed(2), tiempo:Math.max(8,Math.round(km*4)), precio:precio.toFixed(2), comision:comision.toFixed(2), ganancia:ganancia.toFixed(2),
    estado:'Disponible', creado:now(), chat:[], ratings:{cliente:null,repartidor:null},
    timeline:[{estado:'Disponible',fecha:now()}]
  };
  pedidos.unshift(pedido); savePedidos();
  ['origenPedido','destinoPedido','tipoPaquete','notaPedido','kmPedido'].forEach(id=>$(id).value=''); calcularRutaDemo();
  notifyCliente('Pedido publicado. Esperando repartidor.'); toast('Pedido publicado.'); renderAll();
}
function loginClienteSilencioso(){ if(!cliente) cliente=JSON.parse(localStorage.getItem('clienteEnrutaMVP')) || {nombre:'Anthony',celular:'999999999',foto:'',rating:5,ratings:[]}; }
function loginRepSilencioso(){ if(!repartidor) repartidor=JSON.parse(localStorage.getItem('repartidorEnrutaMVP')) || {nombre:'Repartidor Demo',celular:'999999999',foto:'',rating:5,ratings:[]}; }
function notifyCliente(msg){ ultimoClienteMsg=msg; localStorage.setItem('notificacionClienteMVP',msg); if($('notificacionCliente')) $('notificacionCliente').textContent=msg; }

function statusClass(s){ return String(s).replaceAll(' ','_'); }
function progress(p){ const pasos=['Disponible','Aceptado','En camino','Recogido','Entregado']; let idx=pasos.indexOf(p.estado); if(idx<0) idx=0; return `<div class="progress">${pasos.slice(1).map((_,i)=>`<span class="${i<idx?'on':''}"></span>`).join('')}</div>`; }
function nextAction(p){
  if(p.estado==='Disponible') return `<button class="small-btn" onclick="tomarPedido(${p.id})">Aceptar pedido</button>`;
  if(p.estado==='Aceptado') return `<button class="small-btn" onclick="cambiarEstado(${p.id}, 'En camino')">Iniciar ruta</button>`;
  if(p.estado==='En camino') return `<button class="small-btn" onclick="cambiarEstado(${p.id}, 'Recogido')">Pedido recogido</button>`;
  if(p.estado==='Recogido') return `<button class="small-btn" onclick="cambiarEstado(${p.id}, 'Entregado')">Finalizar entrega</button>`;
  return '';
}
function orderCard(p, mode){
  const worker = mode==='repartidor' || mode==='curso';
  const action = worker ? nextAction(p) : '';
  const canRate = p.estado==='Entregado' ? `<button class="small-btn dark" onclick="abrirCalificar(${p.id})">Calificar</button>` : '';
  return `<div class="order-card"><span class="status ${statusClass(p.estado)}">${p.estado}</span>${progress(p)}<h3>${p.tipo}</h3><div class="fake-map mini"><div class="street s1"></div><div class="street s2"></div><div class="pin pin-a"><i class="fa-solid fa-location-dot"></i></div><div class="route-line"></div><div class="moto-dot"><i class="fa-solid fa-motorcycle"></i></div><div class="pin pin-b"><i class="fa-solid fa-flag-checkered"></i></div></div><p><strong>Recojo:</strong> ${p.origen}</p><p><strong>Entrega:</strong> ${p.destino}</p><p><strong>Distancia:</strong> ${p.km} km · ${p.tiempo || '--'} min</p>${p.repartidor?`<p><strong>Repartidor:</strong> ${p.repartidor}</p>`:''}<div class="money">${money(p.precio)}</div><div class="actions"><button class="small-btn dark" onclick="abrirDetallePedido(${p.id})">Detalle</button>${action}${p.estado!=='Disponible'?`<button class="small-btn dark" onclick="abrirChat(${p.id})">Chat</button>`:''}${canRate}</div></div>`;
}

function tomarPedido(id){
  loginRepSilencioso();
  pedidos = pedidos.map(p => p.id===id ? {...p, estado:'Aceptado', repartidor:repartidor.nombre, repartidorTelefono:repartidor.celular, repartidorFoto:repartidor.foto, timeline:[...(p.timeline||[]),{estado:'Aceptado',fecha:now()}], chat:[...(p.chat||[]),{rol:'sistema',texto:'Pedido aceptado por '+repartidor.nombre,fecha:now()}]} : p);
  pedidoDetalleId=id; localStorage.setItem('pedidoDetalleEnrutaMVP', String(id)); savePedidos(); notifyCliente('Tu pedido fue aceptado por '+repartidor.nombre+'.'); toast('Pedido aceptado.'); abrirDetallePedido(id);
}
function cambiarEstado(id, estado){
  pedidos = pedidos.map(p => p.id===id ? {...p, estado, timeline:[...(p.timeline||[]),{estado,fecha:now()}], chat:[...(p.chat||[]),{rol:'sistema',texto:'Estado actualizado: '+estado,fecha:now()}]} : p);
  savePedidos();
  const msg = estado==='En camino'?'Tu repartidor ya va al punto de recojo.':estado==='Recogido'?'Tu paquete fue recogido.':estado==='Entregado'?'Pedido entregado. Ya puedes calificar.':'Estado actualizado.';
  notifyCliente(msg); toast(msg); abrirDetallePedido(id);
}

function abrirDetallePedido(id){ pedidoDetalleId=id; localStorage.setItem('pedidoDetalleEnrutaMVP', String(id)); renderDetalle(); showScreen('detallePedido'); }
function volverDesdeDetalle(){ showScreen(rolActual==='repartidor'?'pedidosRepartidor':'pedidosCliente'); }
function renderDetalle(){
  const p=pedidos.find(x=>x.id===pedidoDetalleId); if(!$('detallePedidoBox')) return;
  if(!p){ $('detallePedidoBox').innerHTML='<div class="empty">No se encontró el pedido.</div>'; return; }
  $('detalleNav').className = 'bottom-nav ' + (rolActual==='repartidor'?'rep-nav':'cliente-nav');
  $('detallePedidoBox').innerHTML = `<div class="order-card"><span class="status ${statusClass(p.estado)}">${p.estado}</span>${progress(p)}<h3>Pedido #${p.id}</h3><div class="fake-map"><div class="street s1"></div><div class="street s2"></div><div class="street s3"></div><div class="pin pin-a"><i class="fa-solid fa-location-dot"></i></div><div class="route-line"></div><div class="moto-dot"><i class="fa-solid fa-motorcycle"></i></div><div class="pin pin-b"><i class="fa-solid fa-flag-checkered"></i></div></div><div class="detail-grid"><div class="detail-item"><span>Cliente</span><b>${p.cliente}</b> · ${p.clienteTelefono||'-'}</div><div class="detail-item"><span>Repartidor</span><b>${p.repartidor||'Aún sin asignar'}</b> ${p.repartidorTelefono? '· '+p.repartidorTelefono:''}</div><div class="detail-item"><span>Recojo</span>${p.origen}</div><div class="detail-item"><span>Entrega</span>${p.destino}</div><div class="detail-item"><span>Paquete</span>${p.tipo}</div><div class="detail-item"><span>Indicaciones</span>${p.nota||'Sin indicaciones'}</div><div class="detail-item"><span>Distancia y tiempo</span>${p.km} km · ${p.tiempo||'--'} min</div><div class="detail-item"><span>Precio</span><b>${money(p.precio)}</b></div><div class="detail-item"><span>Comisión ENRUTA 9%</span>${money(p.comision)}</div><div class="detail-item"><span>Ganancia repartidor</span>${money(p.ganancia)}</div></div><div class="timeline">${(p.timeline||[]).map(t=>`<div><b>${t.estado}</b><br><small>${t.fecha}</small></div>`).join('')}</div><div class="actions"><button class="small-btn dark" onclick="abrirChat(${p.id})">Chat</button>${rolActual==='repartidor'?nextAction(p):''}${p.estado==='Entregado'?`<button class="small-btn" onclick="abrirCalificar(${p.id})">Calificar</button>`:''}</div></div>`;
}

function abrirChat(id){ pedidoDetalleId=id; renderChat(); showScreen('chatPedido'); }
function renderChat(){
  const p=pedidos.find(x=>x.id===pedidoDetalleId); if(!p) return;
  $('chatHeader').innerHTML = `<strong>${p.tipo}</strong><p>${p.origen} → ${p.destino}</p>`;
  const msgs = p.chat || [];
  $('chatMensajes').innerHTML = msgs.length ? msgs.map(m=>`<div class="msg ${m.rol===rolActual?'me':''}"><b>${m.rol==='sistema'?'ENRUTA':m.rol}</b><br>${m.texto}<small>${m.fecha}</small></div>`).join('') : '<div class="empty">Aún no hay mensajes.</div>';
  setTimeout(()=>{ $('chatMensajes').scrollTop = $('chatMensajes').scrollHeight; },50);
}
function enviarChat(){
  const txt=$('chatTexto').value.trim(); if(!txt) return;
  pedidos = pedidos.map(p => p.id===pedidoDetalleId ? {...p, chat:[...(p.chat||[]),{rol:rolActual,texto:txt,fecha:now()}]} : p);
  savePedidos(); $('chatTexto').value=''; renderChat();
}

function abrirCalificar(id){ pedidoDetalleId=id; ratingValue=5; $('ratingTitulo').textContent = rolActual==='cliente' ? 'Califica al repartidor' : 'Califica al cliente'; renderStars(); showScreen('calificarPedido'); }
function renderStars(){ $('ratingStars').innerHTML = [1,2,3,4,5].map(n=>`<button class="${n<=ratingValue?'on':''}" onclick="ratingValue=${n};renderStars()">★</button>`).join(''); }
function guardarCalificacion(){
  const comentario=$('ratingComentario').value.trim();
  pedidos = pedidos.map(p => p.id===pedidoDetalleId ? {...p, ratings:{...(p.ratings||{}), [rolActual]:{stars:ratingValue, comentario, fecha:now()}}} : p);
  const p = pedidos.find(x=>x.id===pedidoDetalleId);
  if(rolActual==='cliente' && repartidor && p?.repartidor===repartidor.nombre){ repartidor.ratings=[...(repartidor.ratings||[]), ratingValue]; repartidor.rating=avg(repartidor.ratings); saveRepartidor(); }
  if(rolActual==='repartidor' && cliente && p?.cliente===cliente.nombre){ cliente.ratings=[...(cliente.ratings||[]), ratingValue]; cliente.rating=avg(cliente.ratings); saveCliente(); }
  savePedidos(); $('ratingComentario').value=''; toast('Calificación guardada.'); abrirDetallePedido(pedidoDetalleId);
}
function avg(arr){ if(!arr||!arr.length) return 5; return Number((arr.reduce((a,b)=>a+Number(b),0)/arr.length).toFixed(1)); }

function renderClienteHome(){ loginClienteSilencioso(); if($('saludoCliente')) $('saludoCliente').textContent='Hola, '+(cliente.nombre||'Cliente')+' 👋'; if($('notificacionCliente')) $('notificacionCliente').textContent=ultimoClienteMsg; const lista=pedidos.filter(p=>p.cliente===cliente.nombre).slice(0,3); if($('clientePedidos')) $('clientePedidos').innerHTML=lista.length?lista.map(p=>orderCard(p,'cliente')).join(''):'<div class="empty">Aún no tienes pedidos publicados.</div>'; }
function renderRepartidorHome(){ const disponibles=pedidos.filter(p=>p.estado==='Disponible'); if($('repartidorPedidos')) $('repartidorPedidos').innerHTML=disponibles.length?disponibles.map(p=>orderCard(p,'repartidor')).join(''):'<div class="empty">No hay pedidos disponibles.</div>'; updateStats(); }
function renderPedidosCliente(){ loginClienteSilencioso(); const lista=pedidos.filter(p=>p.cliente===cliente.nombre && p.estado!=='Entregado'); if($('pedidosClienteLista')) $('pedidosClienteLista').innerHTML=lista.length?lista.map(p=>orderCard(p,'cliente')).join(''):'<div class="empty">No tienes pedidos activos.</div>'; }
function renderPedidosRepartidor(){ loginRepSilencioso(); const lista=pedidos.filter(p=>p.repartidor===repartidor.nombre && p.estado!=='Entregado'); if($('pedidosRepartidorLista')) $('pedidosRepartidorLista').innerHTML=lista.length?lista.map(p=>orderCard(p,'curso')).join(''):'<div class="empty">No tienes rutas activas.</div>'; }
function abrirHistorialCliente(){ rolActual='cliente'; localStorage.setItem('rolEnrutaMVP',rolActual); showScreen('historialCliente'); }
function abrirHistorialRepartidor(){ rolActual='repartidor'; localStorage.setItem('rolEnrutaMVP',rolActual); showScreen('historialRepartidor'); }
function renderHistorialCliente(){ loginClienteSilencioso(); const lista=pedidos.filter(p=>p.cliente===cliente.nombre); if($('historialClienteLista')) $('historialClienteLista').innerHTML=lista.length?lista.map(p=>orderCard(p,'cliente')).join(''):'<div class="empty">Historial vacío.</div>'; }
function renderHistorialRepartidor(){ loginRepSilencioso(); const lista=pedidos.filter(p=>p.repartidor===repartidor.nombre); if($('historialRepartidorLista')) $('historialRepartidorLista').innerHTML=lista.length?lista.map(p=>orderCard(p,'cliente')).join(''):'<div class="empty">Historial vacío.</div>'; }
function updateStats(){ loginRepSilencioso(); const lista=pedidos.filter(p=>p.repartidor===repartidor.nombre); const entregados=lista.filter(p=>p.estado==='Entregado'); const ganancias=entregados.reduce((s,p)=>s+Number(p.ganancia||0),0); if($('gananciasRep')) $('gananciasRep').textContent=money(ganancias); if($('totalEntregasRep')) $('totalEntregasRep').textContent=entregados.length; if($('ratingRepHome')) $('ratingRepHome').textContent='★ '+Number(repartidor.rating||5).toFixed(1); }
function renderPerfilCliente(){ loginClienteSilencioso(); const total=pedidos.filter(p=>p.cliente===cliente.nombre).length; const foto=cliente.foto?`<img src="${cliente.foto}">`:'<i class="fa-solid fa-user"></i>'; if($('perfilClienteBox')) $('perfilClienteBox').innerHTML=`<div class="avatar">${foto}</div><h3>${cliente.nombre||'Cliente'}</h3><p>★ ${Number(cliente.rating||5).toFixed(1)}</p><p><strong>DNI:</strong> ${cliente.dni||'-'}</p><p><strong>Correo:</strong> ${cliente.email||'-'}</p><p><strong>Celular:</strong> ${cliente.celular||'-'}</p><p><strong>Dirección:</strong> ${cliente.direccion||'-'}</p><div class="profile-stat"><span>Pedidos creados</span><b>${total}</b></div>`; }
function renderPerfilRepartidor(){ loginRepSilencioso(); const lista=pedidos.filter(p=>p.repartidor===repartidor.nombre); const entregados=lista.filter(p=>p.estado==='Entregado'); const ganancias=entregados.reduce((s,p)=>s+Number(p.ganancia||0),0); const foto=repartidor.foto?`<img src="${repartidor.foto}">`:'<i class="fa-solid fa-motorcycle"></i>'; if($('perfilRepartidorBox')) $('perfilRepartidorBox').innerHTML=`<div class="avatar">${foto}</div><h3>${repartidor.nombre||'Repartidor'}</h3><p>★ ${Number(repartidor.rating||5).toFixed(1)}</p><p><strong>DNI:</strong> ${repartidor.dni||'-'}</p><p><strong>Correo:</strong> ${repartidor.email||'-'}</p><p><strong>Celular:</strong> ${repartidor.celular||'-'}</p><p><strong>Dirección:</strong> ${repartidor.direccion||'-'}</p><p><strong>Moto:</strong> ${repartidor.moto||'-'}</p><div class="profile-stat"><span>Entregas</span><b>${entregados.length}</b></div><div class="profile-stat"><span>Ganancias</span><b>${money(ganancias)}</b></div>`; }

function navHTML(type){
  if(type==='cliente') return `<button onclick="showScreen('homeCliente')"><i class="fa-solid fa-house"></i><span>Inicio</span></button><button onclick="showScreen('pedidosCliente')"><i class="fa-solid fa-box"></i><span>Pedidos</span></button><button onclick="abrirHistorialCliente()"><i class="fa-solid fa-clock-rotate-left"></i><span>Historial</span></button><button onclick="showScreen('perfilCliente')"><i class="fa-solid fa-user"></i><span>Perfil</span></button>`;
  return `<button onclick="showScreen('homeRepartidor')"><i class="fa-solid fa-house"></i><span>Inicio</span></button><button onclick="showScreen('pedidosRepartidor')"><i class="fa-solid fa-box"></i><span>Pedidos</span></button><button onclick="abrirHistorialRepartidor()"><i class="fa-solid fa-clock-rotate-left"></i><span>Historial</span></button><button onclick="showScreen('perfilRepartidor')"><i class="fa-solid fa-user"></i><span>Perfil</span></button>`;
}
function renderNavs(){ document.querySelectorAll('.cliente-nav').forEach(n=>n.innerHTML=navHTML('cliente')); document.querySelectorAll('.rep-nav').forEach(n=>n.innerHTML=navHTML('rep')); }
function renderDocs(){ const d=$('docsList'); if(d) d.innerHTML=DOCS.map(x=>`<div class="doc"><i class="${x[0]}"></i><div><strong>${x[1]}</strong><p>${x[2]}</p></div><label>Subir<input type="file" hidden></label></div>`).join(''); }
function renderAll(){ renderNavs(); renderDocs(); renderClienteHome(); renderRepartidorHome(); renderPedidosCliente(); renderPedidosRepartidor(); renderHistorialCliente(); renderHistorialRepartidor(); renderPerfilCliente(); renderPerfilRepartidor(); renderDetalle(); }

window.addEventListener('load',()=>{ renderAll(); calcularRutaDemo(); });
