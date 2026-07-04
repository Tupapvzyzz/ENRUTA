let currentRole = "usuario";
let loginRole = "usuario";
let selectedRouteId = null;

let state = JSON.parse(localStorage.getItem("enrutaState")) || {
  users: [],
  drivers: [],
  routes: [
    {id:1, from:"Jesús María", fromDir:"Av. San Felipe 123", to:"San Isidro", toDir:"Av. Arequipa 456", desc:"Paquete pequeño, documentos.", price:12, km:"2.4 km", time:"5 min", size:"Pequeño", offers:[]},
    {id:2, from:"Lince", fromDir:"Av. Salaverry 890", to:"Pueblo Libre", toDir:"Av. Brasil 321", desc:"Paquete mediano.", price:15, km:"3.1 km", time:"8 min", size:"Mediano", offers:[]},
    {id:3, from:"Magdalena", fromDir:"Jr. Javier Prado 111", to:"Miraflores", toDir:"Av. Benavides 765", desc:"Sobre pequeño.", price:11, km:"2.0 km", time:"6 min", size:"Pequeño", offers:[]}
  ],
  session: null
};

setTimeout(()=>go("selectRole"), 1800);

function save(){localStorage.setItem("enrutaState",JSON.stringify(state))}
function go(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="driverHome") renderRoutes();
  if(id==="userHome") renderMyRoutes();
  if(id==="myOffers") renderMyOffers();
  if(id==="profile") renderProfile();
}
function chooseRole(role){ currentRole=role; role==="usuario"?go("registerUser"):go("driver1") }
function setSwitch(btn){document.querySelectorAll(".switch button").forEach(b=>b.classList.remove("active"));btn.classList.add("active")}
function uploaded(input){input.parentElement.querySelector("span").textContent="Subido ✓"}

function saveUser(e){
  e.preventDefault();
  const user={role:"usuario",name:uName.value,email:uEmail.value,phone:uPhone.value,pass:uPass.value};
  state.users.push(user); state.session=user; currentRole="usuario"; save(); go("userHome");
}
function saveDriver(){
  const driver={
    role:"repartidor", name:dName.value||"Carlos Gómez", email:dEmail.value, phone:dPhone.value, pass:dPass.value,
    moto:motoModel.value||"Honda XR190L", plate:motoPlate.value||"ABC-123", verified:false
  };
  state.drivers.push(driver); state.session=driver; currentRole="repartidor"; save(); go("driverHome");
}
function login(){
  currentRole=loginRole;
  const list=loginRole==="usuario"?state.users:state.drivers;
  state.session=list[0] || {role:loginRole,name:loginRole==="usuario"?"Usuario ENRUTA":"Repartidor ENRUTA",email:"demo@enruta.com",moto:"Honda XR190L"};
  save(); go(loginRole==="usuario"?"userHome":"driverHome");
}

function publishRoute(){
  if(!pickup.value || !dropoff.value || !price.value){alert("Completa recojo, entrega y precio.");return}
  const route={id:Date.now(),from:pickup.value,fromDir:"Dirección de recojo",to:dropoff.value,toDir:"Dirección de entrega",desc:packageDesc.value||"Paquete sin descripción",price:Number(price.value),km:"2.4 km",time:"5 min",size:"Pequeño",owner:state.session?.email||"demo",offers:[]};
  state.routes.unshift(route); save(); pickup.value=dropoff.value=packageDesc.value=price.value="";
  renderMyRoutes(); alert("Ruta publicada. Ahora los moteros podrán ofertar.");
}

function renderRoutes(){
  routesList.innerHTML=state.routes.map(r=>`
    <div class="route-card">
      <div class="route-line">
        <div>
          <p><span class="green">●</span> ${r.from}</p><p class="mini">${r.fromDir}</p>
          <p><span class="red">●</span> ${r.to}</p><p class="mini">${r.toDir}</p>
          <span class="tag">${r.size}</span>
        </div>
        <div><div class="price">S/ ${r.price.toFixed(2)}</div><p class="mini">${r.km}<br>${r.time}</p></div>
      </div>
      <button class="outline" onclick="openDetail(${r.id})">Ver detalles</button>
    </div>`).join("");
}
function openDetail(id){
  selectedRouteId=id;
  const r=state.routes.find(x=>x.id===id);
  routeDetailContent.innerHTML=`
    <div class="card center"><h3>${r.from} → ${r.to}</h3><div class="price">S/ ${r.price.toFixed(2)}</div></div>
    <div class="card"><p><span class="green">●</span> ${r.from}</p><p class="mini">${r.fromDir}</p><br><p><span class="red">●</span> ${r.to}</p><p class="mini">${r.toDir}</p></div>
    <div class="card"><p>Distancia: <b>${r.km}</b></p><p>Tiempo: <b>${r.time}</b></p><p>Paquete: <b>${r.size}</b></p><br><p>${r.desc}</p></div>
    <button class="btn" onclick="prepareOffer()">Hacer oferta</button>`;
  go("routeDetail");
}
function prepareOffer(){
  const r=state.routes.find(x=>x.id===selectedRouteId);
  suggestedPrice.textContent="S/ "+r.price.toFixed(2);
  offerPrice.value=r.price;
  go("makeOffer");
}
function sendOffer(){
  const r=state.routes.find(x=>x.id===selectedRouteId);
  const driver=state.session || {name:"Carlos Gómez",moto:"Honda XR190L"};
  r.offers.push({driver:driver.name, moto:driver.moto||"Honda XR190L", price:Number(offerPrice.value), msg:offerMsg.value||"Puedo recogerlo rápido.", status:"Pendiente"});
  save(); alert("Oferta enviada al usuario."); go("driverHome");
}
function renderMyRoutes(){
  const my=state.routes.filter(r=>!r.owner || r.owner===state.session?.email);
  myRoutes.innerHTML=my.map(r=>`
    <div class="route-card">
      <div class="route-line"><div><b>${r.from} → ${r.to}</b><p class="mini">${r.desc}</p><p class="mini">${r.offers.length} ofertas recibidas</p></div><div class="price">S/ ${r.price.toFixed(2)}</div></div>
      <button class="outline" onclick="viewOffers(${r.id})">Ver ofertas</button>
    </div>`).join("");
}
function viewOffers(id){
  selectedRouteId=id;
  const r=state.routes.find(x=>x.id===id);
  if(r.offers.length===0){
    r.offers=[
      {driver:"Carlos Gómez",moto:"Honda XR190L",price:r.price-0.5,msg:"Llego en 5 minutos.",status:"Pendiente"},
      {driver:"Luis Fernández",moto:"Yamaha FZ 2.0",price:r.price,msg:"Estoy cerca.",status:"Pendiente"},
      {driver:"Pedro Ruiz",moto:"Bajaj Pulsar 150",price:r.price+0.5,msg:"Disponible ahora.",status:"Pendiente"}
    ]; save();
  }
  offersList.innerHTML=r.offers.map((o,i)=>`
    <div class="card">
      <div class="offer-row">
        <div><h3>${o.driver} ⭐ 4.9</h3><p class="mini">${o.moto}<br>${o.msg}</p></div>
        <div><div class="price">S/ ${o.price.toFixed(2)}</div><button class="btn" onclick="acceptOffer(${i})">Elegir</button></div>
      </div>
    </div>`).join("")+`<button class="danger" onclick="go('userHome')">Cancelar ruta</button>`;
  go("offers");
}
function acceptOffer(i){
  const r=state.routes.find(x=>x.id===selectedRouteId);
  currentDriver.textContent=r.offers[i].driver+" ⭐ 4.9";
  alert("Elegiste al motero. Ruta en curso.");
  go("currentRoute");
}
function renderMyOffers(){
  const offers=[];
  state.routes.forEach(r=>r.offers.forEach(o=>{if(o.driver===state.session?.name)offers.push({route:r,o})}));
  myOffersList.innerHTML=offers.length?offers.map(x=>`<div class="card"><b>${x.route.from} → ${x.route.to}</b><p class="price">S/ ${x.o.price.toFixed(2)}</p><p class="mini">${x.o.status}</p></div>`).join(""):"<p class='sub'>Aún no enviaste ofertas.</p>";
}
function renderProfile(){
  const s=state.session || {};
  profileName.textContent=s.name||"ENRUTA";
  profileInfo.textContent=(s.email||"demo@enruta.com")+" · "+(s.role||currentRole);
}
function cancelRoute(){alert("Ruta cancelada.");go(currentRole==="usuario"?"userHome":"driverHome")}
