document.addEventListener('DOMContentLoaded', function() {
    let sumaTotalGlobal = 0;
    let totalAfijosGlobal = 0;
    let totalAcorrienGlobal = 0;
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
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosCorrientes.json')
        .then(response => response.json())
        .then(activosCorrientes => {
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
                .then(response => response.json())
                .then(activosFijos => {
                    const { totalAfijos, totalAcorrien } = mostrarActivos(activosCorrientes, activosFijos);
                    totalAfijosGlobal = totalAfijos;
                    totalAcorrienGlobal = totalAcorrien;
                    console.log('Total de activos fijos global:', totalAfijosGlobal);
                    console.log('Total de activos corrientes global:', totalAcorrienGlobal);
                })
                .catch(error => console.error('Error al obtener datos de activos fijos:', error));
        })
        .catch(error => console.error('Error al obtener datos de activos corrientes:', error));
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/prestamo.json')
                .then(response => response.json())
                .then(prestamoData => {
                    const resultadoPasivos = mostrarPasivos(comprasData, prestamoData);
                    sumaTotalGlobal = resultadoPasivos.sumaTotal;
                    console.log('Total de pasivos:', sumaTotalGlobal);
                })
                .catch(error => console.error('Error al obtener datos de préstamos:', error));
        })
        .catch(error => console.error('Error al obtener datos de compras:', error));
});

//mostrar activos
function mostrarActivos(activosCorrientes, activosFijos) {
    if (!activosCorrientes || !activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return;
    }
    const activosCorrientesElement = document.getElementById('activos-corrientes');
    const activosFijosElement = document.getElementById('activos-fijos');
    const activosTotaleElement = document.getElementById('total-activos');

    const totalAcorrien = activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario;
    let activosCorrientesHTML = `
        <li>Caja (efectivo): $${activosCorrientes.caja.toFixed(2)}</li>
        <li>Cuentas por Cobrar: $${activosCorrientes.cuentasPorCobrar.toFixed(2)}</li>
        <li>Inventario: $${activosCorrientes.inventario.toFixed(2)}</li>
        <li>Total: $${(totalAcorrien).toFixed(2)}</li>
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

    const totalAfijos = totalNeto - depreciacionAcumuladaTotal;
    let activosFijosHTML = `
        <li>Mobiliario: $${totalMobiliario.toFixed(2)}</li>
        <li>Equipo de oficina: $${totalEquipoOficina.toFixed(2)}</li>
        <li>Vehículos: $${totalVehiculos.toFixed(2)}</li>
        <li>Total Neto (sin depreciación): $${totalNeto.toFixed(2)}</li>
        <li>Depreciación acumulada total: $${depreciacionAcumuladaTotal.toFixed(2)}</li>
        <li>Total (con depreciación): $${(totalAfijos).toFixed(2)}</li>
    `;

    let totalActivos = activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario + (totalNeto - depreciacionAcumuladaTotal);
    let totalActivosHTML = `
        <li>Total: $${totalActivos.toFixed(2)}</li>
    `;

    activosCorrientesElement.innerHTML = activosCorrientesHTML;
    activosFijosElement.innerHTML = activosFijosHTML;
    activosTotaleElement.innerHTML = totalActivosHTML;

    return {
        totalAfijos: totalAfijos,
        totalAcorrien: totalAcorrien
    };
}

//mostrar pasivos
function mostrarPasivos(comprasData, prestamoData) {
    // cxp
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

    // prestamo
    function procesarPrestamos(prestamoData) {
        prestamoData = prestamoData[1];
        let años = prestamoData.años;
        let principal = prestamoData.principal;
        let tasaAnual = prestamoData.tasaAnual / 100;
        let fechaInicialStr = prestamoData.fechaInicio; 
        let anioInicial = parseInt(fechaInicialStr.substring(0, 4)); 
        let añoActual = new Date().getFullYear();
        let diferenciaAños = añoActual - anioInicial;

        let tasaMensual = tasaAnual / 12;
        let numPagosMensuales = años * 12;
        let pagoMensual = principal * (tasaMensual * Math.pow(1 + tasaMensual, numPagosMensuales)) / (Math.pow(1 + tasaMensual, numPagosMensuales) - 1);
        pagoMensual = parseFloat(pagoMensual.toFixed(2));

        let pagoAnual = pagoMensual * 12;

        let pagosRealizados = diferenciaAños * 12;

        let cantidadRestante = principal * (Math.pow(1 + tasaMensual, numPagosMensuales) - Math.pow(1 + tasaMensual, pagosRealizados)) / (Math.pow(1 + tasaMensual, numPagosMensuales) - 1);
        cantidadRestante = parseFloat(cantidadRestante.toFixed(2));

        const prestamoElement = document.getElementById('prestamo-anual');
        if (prestamoElement) {
            prestamoElement.innerHTML = `<li>Total del préstamo con intereses: $${pagoAnual}</li>
            <li>Cantidad restante: $${cantidadRestante}</li>`;
        } else {
            console.error('Elemento con ID "prestamo-anual" no encontrado.');
        }

        return {
            pagoAnual: pagoAnual,
            cantidadRestante: cantidadRestante
        };
    }
    const pasivoTotal = calcularPasivoTotal(comprasData);
    const pasivoTotalElement = document.getElementById('cxp');
    if (pasivoTotalElement) {
        pasivoTotalElement.innerHTML = `<li>CXP $${pasivoTotal}</li>`;
    } else {
        console.error('Elemento con ID "cxp" no encontrado.');
    }

    const { pagoAnual, cantidadRestante } = procesarPrestamos(prestamoData);

    const sumaTotal = pasivoTotal + pagoAnual + cantidadRestante;

    const sumaTotalElement = document.getElementById('suma-total');
    if (sumaTotalElement) {
        sumaTotalElement.textContent = `Suma Total: $${sumaTotal}`;
    } else {
        console.error('Elemento con ID "suma-total" no encontrado.');
    }

    return {
        sumaTotal: sumaTotal
    };
}

function calcularAñosEnOperacion(fechaInicial) {
    const fechaActual = new Date();
    const tiempoEnMilisegundos = fechaActual - fechaInicial.getTime();
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}
