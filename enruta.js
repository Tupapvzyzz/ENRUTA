/* ===================================================
   ENRUTA v1.0
   ================================================ */

const screens = document.querySelectorAll(".screen");

/* =======================================
   CAMBIO DE PANTALLAS
======================================= */

function showScreen(id) {

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

/* =======================================
   VARIABLES
======================================= */

const PRECIO_KM = 1.10;
const COMISION = 0.09;

/* =======================================
   CALCULAR PEDIDO
======================================= */

function calcularPedido(){

    const km =
    parseFloat(document.getElementById("distancia").value) || 0;

    const precio =
    parseFloat(document.getElementById("precioCliente").value) || 0;

    const minimo = km * PRECIO_KM;

    const comision = precio * COMISION;

    const repartidor = precio - comision;

    document.getElementById("minimoPermitido").innerHTML =
    "S/ " + minimo.toFixed(2);

    document.getElementById("comisionApp").innerHTML =
    "S/ " + comision.toFixed(2);

    document.getElementById("recibeRepartidor").innerHTML =
    "S/ " + repartidor.toFixed(2);

    document.getElementById("totalCliente").innerHTML =
    "S/ " + precio.toFixed(2);

}

/* =======================================
   PUBLICAR PEDIDO
======================================= */

function publicarPedido(){

    const km =
    parseFloat(document.getElementById("distancia").value);

    const precio =
    parseFloat(document.getElementById("precioCliente").value);

    const minimo = km * PRECIO_KM;

    if(precio < minimo){

        alert(
            "El precio mínimo permitido es S/ "
            + minimo.toFixed(2)
            + "\n\nPrecio por kilómetro: S/1.10"
        );

        return;

    }

    alert(

`Pedido publicado correctamente.

Cliente pagará:
S/ ${precio.toFixed(2)}

Comisión ENRUTA (9%)
S/ ${(precio*COMISION).toFixed(2)}

Repartidor recibirá
S/ ${(precio-(precio*COMISION)).toFixed(2)}

Esperando que un repartidor acepte el pedido...`

    );

    showScreen("screenListaPedidos");

}

/* =======================================
   FORMATO MONEDA
======================================= */

function moneda(valor){

    return "S/ " + valor.toFixed(2);

}

/* =======================================
   PEDIDO ACEPTADO
======================================= */

function aceptarPedido(){

    alert("Has aceptado el pedido.");

    showScreen("screenPedidoAceptado");

}

/* =======================================
   ENTREGA
======================================= */

function iniciarEntrega(){

    alert("Ruta iniciada.");

    showScreen("screenEnEntrega");

}

function finalizarEntrega(){

    alert("Entrega completada.");

    showScreen("screenHistorial");

}

/* =======================================
   HISTORIAL
======================================= */

const historial = [];

function agregarHistorial(origen,destino,monto){

    historial.push({

        origen,
        destino,
        monto

    });

}

/* =======================================
   CARGA
======================================= */

window.onload = ()=>{

    calcularPedido();

};

/* =======================================
   FUTURAS FUNCIONES
======================================= */

/*

LOGIN

REGISTRO

MAPAS

GPS

FIREBASE

SUPABASE

NOTIFICACIONES

PANEL ADMIN

CHAT

PAGOS

CALIFICACIONES

*/
