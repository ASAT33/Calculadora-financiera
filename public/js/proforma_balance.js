document.addEventListener('DOMContentLoaded', function() {
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(data => {
            let totalMonto = 0;
            data.forEach(venta => {
                totalMonto += venta.monto;
            });
            const totalMontoElement = document.getElementById('total-monto');
            totalMontoElement.textContent = `${totalMonto}`;
        })
        .catch(error => console.error('Error al obtener datos de ventas anuales:', error));

    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            const pasivoTotal = calcularPasivoTotal(comprasData);
            const pasivoTotalElement = document.getElementById('cxp');
            pasivoTotalElement.innerHTML = `<li>CXP $${pasivoTotal}</li>`;
        })
        .catch(error => console.error('Error al obtener datos de compras:', error));

        fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosCorrientes.json')
        .then(response => response.json())
        .then(activosCorrientes => {

            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
                .then(response => response.json())
                .then(activosFijos => {

                    mostrarActivos(activosCorrientes, activosFijos);
                })
                .catch(error => console.error('Error al obtener datos de activos fijos:', error));
        })
        .catch(error => console.error('Error al obtener datos de activos corrientes:', error));

        fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/prestamo.json')
        .then(response => response.json())
        .then(prestamoData => {
             prestamos(prestamoData)
             
        })
        .catch(error => console.error('Error al obtener datos del préstamo:', error));
});


//calcula la cxp segun la fecha por si ya se pagó o no 
function calcularPasivoTotal(comprasData) {
    let pasivoTotal = 0;
    const fechaBalanceGeneral = new Date("2023-12-31"); 
    if (Array.isArray(comprasData) && comprasData.length > 0) {
        comprasData.forEach(compra => {
            const fechaCancelacion = new Date(compra["Fecha de cancelación"]);
            if (fechaCancelacion > fechaBalanceGeneral || isNaN(fechaCancelacion)) {
                pasivoTotal += (compra["Total"] - compra["Cancelación"]);
            }
        });
    } else {
        console.error("comprasData no está definido o está vacío");
    }

    return pasivoTotal;
}

function prestamos(prestamoData, añosTranscurridos) {
    let años = prestamoData.años;
    let principal = prestamoData.principal;
    let tasaAnual = prestamoData.tasaAnual / 100; 

    let tasaMensual = tasaAnual / 12;
    let numPagosMensuales = años * 12;
    let pagoMensual = principal * (tasaMensual * Math.pow(1 + tasaMensual, numPagosMensuales)) / (Math.pow(1 + tasaMensual, numPagosMensuales) - 1);
    pagoMensual = parseFloat(pagoMensual.toFixed(2));

    // Calculo del pago anual
    let pagoAnual = pagoMensual * 12;

    let totalConIntereses = pagoMensual * numPagosMensuales;

    let pagosRealizados = añosTranscurridos * 12;
    let cantidadRestante = principal * Math.pow(1 + tasaMensual, numPagosMensuales) - (Math.pow(1 + tasaMensual, pagosRealizados) - 1) / (tasaMensual * Math.pow(1 + tasaMensual, pagosRealizados));

    cantidadRestante = parseFloat(cantidadRestante.toFixed(2)); 

    const prestamoElement = document.getElementById('prestamo-anual');
    prestamoElement.innerHTML = `<li>Total del préstamo con intereses: $${totalConIntereses}</li>

    `;
    return {
        pagoAnual: pagoAnual,
        totalConIntereses: totalConIntereses,

    };
}

//esto es para la parte de los activos 
function mostrarActivos(activosCorrientes, activosFijos) {
    if (!activosCorrientes || !activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return;
    }

    const activosCorrientesElement = document.getElementById('activos-corrientes');
    const activosFijosElement = document.getElementById('activos-fijos');
    const activosTotaleElement = document.getElementById('total-activos');

    let activosCorrientesHTML = `
        <li>Caja (efectivo): $${activosCorrientes.caja.toFixed(2)}</li>
        <li>Cuentas por Cobrar: $${activosCorrientes.cuentasPorCobrar.toFixed(2)}</li>
        <li>Inventario: $${activosCorrientes.inventario.toFixed(2)}</li>
        <li>Total: $${(activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario).toFixed(2)}</li>
    `;
    
    let totalMobiliario = 0;
    let totalEquipoOficina = 0;
    let totalVehiculos = 0;
    let totalNeto = 0;
    let depreciacionAcumuladaTotal = 0;

    activosFijos.forEach(activo => {
        const { nombre, categoria, precioCompra, fechaAdquisicion } = activo;

        const fechaInicial = new Date(fechaAdquisicion);
        const añosEnOperacion = calcularAñosEnOperacion(fechaInicial);

        //  10% depreciacion anual
        const depreciacionAnual = 0.10;

        const depreciacionAcumulada = precioCompra * depreciacionAnual * añosEnOperacion;

        totalNeto += precioCompra;
        depreciacionAcumuladaTotal += depreciacionAcumulada;

        switch (categoria) {
            case 'mobiliario':
                totalMobiliario += precioCompra;
                break;
            case 'equipo de oficina':
                totalEquipoOficina += precioCompra;
                break;
            case 'vehículo':
                totalVehiculos += precioCompra;
                break;
            default:
                break;
        }
    });

    let activosFijosHTML = `
        <li>Mobiliario: $${totalMobiliario.toFixed(2)}</li>
        <li>Equipo de oficina: $${totalEquipoOficina.toFixed(2)}</li>
        <li>Vehículos: $${totalVehiculos.toFixed(2)}</li>
        <li>Total Neto (sin depreciación): $${totalNeto.toFixed(2)}</li>
        <li>Depreciación acumulada total: $${depreciacionAcumuladaTotal.toFixed(2)}</li>
        <li>Total (con depreciación): $${(totalNeto - depreciacionAcumuladaTotal).toFixed(2)}</li>
    `;

    let totalActivos = activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario + (totalNeto - depreciacionAcumuladaTotal);
    let totalActivosHTML = `
        <li>Total: $${totalActivos.toFixed(2)}</li>
    `;

    activosCorrientesElement.innerHTML = activosCorrientesHTML;
    activosFijosElement.innerHTML = activosFijosHTML;
    activosTotaleElement.innerHTML = totalActivosHTML;
}


mostrarActivos(); 


function calcularAñosEnOperacion(fechaInicial) {
    const fechaActual = new Date();
    const tiempoEnMilisegundos = fechaActual - fechaInicial.getTime();
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}
