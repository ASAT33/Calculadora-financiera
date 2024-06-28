document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/datos/ventas_anuales.json')
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

    fetch('http://localhost:8080/datos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            const pasivoTotal = calcularPasivoTotal(comprasData);
            const pasivoTotalElement = document.getElementById('pasivo-total');
            pasivoTotalElement.textContent = `CXP ${pasivoTotal}`;
        })
        .catch(error => console.error('Error al obtener datos de compras:', error));

    fetch('http://localhost:8080/datos/activos.json')
        .then(response => response.json())
        .then(activosData => {
            mostrarActivos(activosData);
        })
        .catch(error => console.error('Error al obtener datos de activos:', error));
});



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

function mostrarActivos(activosData) {
    if (!activosData || !activosData.activosCorrientes || !activosData.activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return;
    }

    const activosCorrientesElement = document.getElementById('activos-corrientes');
    const activosFijosElement = document.getElementById('activos-fijos');
    const activosTotaleElement = document.getElementById('total-activos');

    const activosCorrientes = activosData.activosCorrientes;
    const activosFijos = activosData.activosFijos;
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

        //  10%
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

    activosCorrientesElement.innerHTML = activosCorrientesHTML;

    activosFijosElement.innerHTML = `
        <li>Mobiliario: $${totalMobiliario.toFixed(2)}</li>
        <li>Equipo de oficina: $${totalEquipoOficina.toFixed(2)}</li>
        <li>Vehículos: $${totalVehiculos.toFixed(2)}</li>
        <li>Total Neto (sin depreciación): $${totalNeto.toFixed(2)}</li>
        <li>Depreciación acumulada total: $${depreciacionAcumuladaTotal.toFixed(2)}</li>
        <li>Total (con depreciación): $${(totalNeto - depreciacionAcumuladaTotal).toFixed(2)}</li>
        
    `;

activosTotaleElement.innerHTML = `

<li>Total: $${(activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario+(totalNeto-depreciacionAcumuladaTotal)).toFixed(2)}</li>


`;

}
function calcularAñosEnOperacion(fechaInicial) {
    const fechaActual = new Date();
    const tiempoEnMilisegundos = fechaActual - fechaInicial.getTime();
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}
