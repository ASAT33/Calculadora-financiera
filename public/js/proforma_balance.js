document.addEventListener('DOMContentLoaded', function() {
    async function obtenerDatos() {
        try {
            let activosCorrientes, activosFijos;
            const response1 = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/activos/activosCorrientes.json');
            activosCorrientes = await response1.json();
            const response2 = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/activos/activosFijos.json');
            activosFijos = await response2.json();
            const response3 = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json');
            const data = await response3.json();
            fetchEstadoResultados()
            let totalMonto = 0;
            data.forEach(venta => {
                if (venta['Fecha de cancelación'].includes('2024')) {
                    totalMonto += parseFloat(venta.Cancelación);
                }
            });
    
            const totalMontoFormateado = totalMonto.toFixed(2);
            const activos = mostrarActivos(activosCorrientes, activosFijos, totalMontoFormateado);
            const totalAfijosGlobal = activos.totalAfijos;
            const totalAcorrienGlobal = activos.totalAcorrien;
            return {
                totalAfijosGlobal,
                totalAcorrienGlobal
            };
    
        } catch (error) {
            console.error('Error en obtenerDatos:', error);
            throw error; 
        }
    }
    
    async function obtenerDatosPasivos() {
        try {
            let sumaTotalGlobal, sumacorr;
            const response1 = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras.json');
            const comprasData = await response1.json();
    
            const response2 = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/prestamo.json');
            const prestamoData = await response2.json();

            const resultadoPasivos = mostrarPasivos(comprasData, prestamoData);
            sumaTotalGlobal = resultadoPasivos.sumaTotal;
            sumacorr = resultadoPasivos.corriente;

            return {
                sumaTotalGlobal,
                sumacorr
            };
    
        } catch (error) {
            console.error('Error en obtenerDatosPasivos:', error);
            throw error; 
        }
    }
    

    async function obtenerYProcesarDatos() {
        try {
            const [datosActivos, datosPasivos] = await Promise.all([
                obtenerDatos(),
                obtenerDatosPasivos()
            ]);
            const totalAfijosGlobal = datosActivos.totalAfijosGlobal;
            const totalAcorrienGlobal = datosActivos.totalAcorrienGlobal;
            const sumaTotalGlobal = datosPasivos.sumaTotalGlobal;
            const sumacorr = datosPasivos.sumacorr;
            let totalActivos=totalAfijosGlobal+totalAcorrienGlobal;
  
            let capital = totalActivos - sumaTotalGlobal;
            let pascap = sumaTotalGlobal + capital
            const totalElement = document.getElementById('total');
            totalElement.textContent = `$${pascap.toFixed(2)}`;

            const capitalElement = document.getElementById('capital');
            capitalElement.textContent = `$${capital.toFixed(2)}`;

        } catch (error) {
            console.error('Error en obtenerYProcesarDatos:', error);
        }
    }
    obtenerYProcesarDatos();
        fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/registros/balances/diciembre23.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          mostrarDatos(data);
          document.getElementById('balance-diciembre').style.display = 'block';
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
      
        document.getElementById('balance-actual').style.display = 'block';
        document.getElementById('balance-diciembre').style.display = 'none';
        document.getElementById('btn-actual').addEventListener('click', function() {
            document.getElementById('balance-actual').style.display = 'block';
            document.getElementById('balance-diciembre').style.display = 'none';
        });

        document.getElementById('btn-diciembre').addEventListener('click', function() {
            document.getElementById('balance-actual').style.display = 'none';
            document.getElementById('balance-diciembre').style.display = 'block';
        });
        

});

//mostrar activos
function mostrarActivos(activosCorrientes, activosFijos, totalMontoFormateado) {
    if (!activosCorrientes || !activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return null; 
    }

    const cuentasPorCobrar = parseFloat(totalMontoFormateado);

    const activosCorrientesElement = document.getElementById('activos-corrientes');
    const activosFijosElement = document.getElementById('activos-fijos');
    const activosTotaleElement = document.getElementById('total-activos');

    let totalAcorrien = 0;

    // Calcular total de activos corrientes
    if (activosCorrientes.caja !== undefined && activosCorrientes.inventario !== undefined) {
        totalAcorrien = activosCorrientes.caja + cuentasPorCobrar + activosCorrientes.inventario;
    }

    let totalMobiliario = 0;
    let totalEquipoOficina = 0;
    let totalVehiculos = 0;
    let totalNeto = 0;
    let depreciacionAcumuladaTotal = 0;

    // Calcular activos fijos
    activosFijos.forEach(activo => {
        if (activo) {
            const { nombre, categoria, precioCompra, fechaAdquisicion } = activo;

            const fechaInicial = new Date(fechaAdquisicion);
            const añosEnOperacion = calcularAñosEnOperacion(fechaInicial);

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
        }
    });

    const totalAfijos = totalNeto - depreciacionAcumuladaTotal;

    // Construir HTML para activos corrientes
    let activosCorrientesHTML = `
        <li>Caja (efectivo): $${activosCorrientes.caja.toFixed(2)}</li>
        <li>Cuentas por Cobrar: $${cuentasPorCobrar.toFixed(2)}</li>
        <li>Inventario: $${activosCorrientes.inventario.toFixed(2)}</li>
        <li>Total: $${totalAcorrien.toFixed(2)}</li>
    `;

    // Construir HTML para activos fijos
    let activosFijosHTML = `
        <li>Mobiliario: $${totalMobiliario.toFixed(2)}</li>
        <li>Equipo de oficina: $${totalEquipoOficina.toFixed(2)}</li>
        <li>Vehículos: $${totalVehiculos.toFixed(2)}</li>
        <li>Total Neto (sin depreciación): $${totalNeto.toFixed(2)}</li>
        <li>Depreciación acumulada total: $${depreciacionAcumuladaTotal.toFixed(2)}</li>
        <li>Total (con depreciación): $${totalAfijos.toFixed(2)}</li>
    `;

    // Construir HTML para total de activos
    let totalActivosHTML = `
        <li>Total: $${(totalAcorrien + totalAfijos).toFixed(2)}</li>
    `;

    // Actualizar elementos en la página
    activosCorrientesElement.innerHTML = activosCorrientesHTML;
    activosFijosElement.innerHTML = activosFijosHTML;
    activosTotaleElement.innerHTML = totalActivosHTML;

    // Devolver un objeto con todos los valores relevantes
    return {
        totalAfijos: totalAfijos,
        totalAcorrien: totalAcorrien,
        totalNeto: totalNeto,
        depreciacionAcumuladaTotal: depreciacionAcumuladaTotal,
        totalActivos: totalAcorrien + totalAfijos
    };
}



//mostrar pasivos
function mostrarPasivos(comprasData, prestamoData) {
    // cxp
    function calcularPasivoTotal(comprasData) {
        let pasivoTotal = 0;
        const fechaBalanceGeneral = new Date("2023-12-26"); 
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
            prestamoElement.innerHTML = `
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
    const { pagoAnual, cantidadRestante } = procesarPrestamos(prestamoData);
    const pasivoTotalElement = document.getElementById('cxp');
    if (pasivoTotalElement) {
        pasivoTotalElement.innerHTML = `<li>CXP $${pasivoTotal}</li>
        <li>Total del préstamo con intereses: $${pagoAnual}</li>
        `;
    } else {
        console.error('Elemento con ID "cxp" no encontrado.');
    }

    
    
    const corriente = pasivoTotal + pagoAnual;
    const sumaTotal = corriente + cantidadRestante;
    const sumaTotalElement = document.getElementById('suma-total');
    if (sumaTotalElement) {
        sumaTotalElement.textContent = `Suma Total: $${sumaTotal}`;
    } else {
        console.error('Elemento con ID "suma-total" no encontrado.');
    }

    return {
        corriente:corriente,
        sumaTotal: sumaTotal
    };
}



function calcularAñosEnOperacion(fechaInicial) {
    const fechaActual = new Date();
    const tiempoEnMilisegundos = fechaActual - fechaInicial.getTime();
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}


//diciembre

function mostrarDatos(balanceData) {
    // Mostrar activos corrientes
    const activosCorrientesHTML = `
      <li>Caja (efectivo): $${balanceData.caja.toFixed(2)}</li>
      <li>Cuentas por Cobrar: $${balanceData.cxc.toFixed(2)}</li>
      <li>Inventario: $${balanceData.inventario.toFixed(2)}</li>
      <li>Total: $${balanceData.total_activos_corrientes.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-activos-corrientes').innerHTML = activosCorrientesHTML;
  
    // Mostrar activos fijos
    const activosFijosHTML = `
      <li>Mobiliario: $${balanceData.mobiliario.toFixed(2)}</li>
      <li>Equipo de oficina: $${balanceData.equipos_oficina.toFixed(2)}</li>
      <li>Vehículos: $${balanceData.vehiculo.toFixed(2)}</li>
      <li>Total(Sin depreciacion): $${balanceData.total_activo_fijo_neto.toFixed(2)}</li>
     <li>Depreciacion: $${balanceData.depreciacion_3_anos.toFixed(2)}</li>
     <li>Total(Con depreciaciación): $${balanceData.total_activos_fijos.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-activos-fijos').innerHTML = activosFijosHTML;
  
    // Mostrar total de activos
    const totalActivosHTML = `
      <li>Total: $${balanceData.total_activo.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-total-activos').innerHTML = totalActivosHTML;
  
    // Mostrar pasivos corrientes y fijos
    const pasivosCorrientesHTML = `
      <li>Cuentas por pagar: $${balanceData.cuentas_por_pagar.toFixed(2)}</li>
      <li>Impuestos(25%): $${balanceData.impuesto.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-cxp').innerHTML = pasivosCorrientesHTML;
  
    const pasivosFijosHTML = `
      <li>Prestamos a largo plazo: $${balanceData.prestamos_largo_plazo.toFixed(2)}</li>
      <li>Total: $${balanceData.total_pasivos.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-prestamo-anual').innerHTML = pasivosFijosHTML;
  
    // Mostrar suma total
    const sumaTotalHTML = `
      <li>Total Pasivo + Capital: $${balanceData.total_pasivo_patrimonio.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-suma-total').innerHTML = sumaTotalHTML;
  
    // Mostrar capital
    const capitalHTML = `
      <li>Capital: $${balanceData.capital.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-capital').innerHTML = capitalHTML;
  }
  
  async function fetchEstadoResultados() {
    const url = "https://admfinan-5fbd1-default-rtdb.firebaseio.com/registros/estadoresltado/diciembre23.json";
    const response = await fetch(url);
    const data = await response.json();
    const tableBody = document.getElementById('estado-resultados-table').getElementsByTagName('tbody')[0];

    // Obtener valores de entrada
    const tasas = {
        ventas: parseFloat(document.getElementById('ventas').value) / 100 || 0,
        compras: parseFloat(document.getElementById('compras').value) / 100 || 0,
        electricidad: parseFloat(document.getElementById('electricidad').value) / 100 || 0,
        internet: parseFloat(document.getElementById('internet').value) / 100 || 0,
        salarios: parseFloat(document.getElementById('salarios').value) / 100 || 0,
        publicidad: parseFloat(document.getElementById('publicidad').value) / 100 || 0,
        transporte: parseFloat(document.getElementById('transporte').value) / 100 || 0,
        agua: parseFloat(document.getElementById('agua').value) / 100 || 0,
    };

    // Proyecciones
    const proyecciones = {
        Ingresos_por_ventas: data.Ingresos_por_ventas * (1 + tasas.ventas),
        Compras: data.Compras * (1 + tasas.compras),
        Electricidad: data.Electricidad * (1 + tasas.electricidad),
        Internet: data.Internet * (1 + tasas.internet),
        Salarios: data.Salarios * (1 + tasas.salarios),
        Renta: data.Renta,
        Publicidad: data.Publicidad * (1 + tasas.publicidad),
        Transporte: data.Transporte * (1 + tasas.transporte),
        Servicio_de_agua: data.Servicio_de_agua * (1 + tasas.agua),
        Intereses_de_prestamos: data.Intereses_de_prestamos,
    };

    // Proyectar Inventario Inicial y Final
    const proyeccionInventarioInicial = data.Inventario_inicial; // El inventario final de este periodo será el inicial del siguiente
    const proyeccionInventarioFinal = data.Inventario_final; // Supongamos un aumento del 2%

    // Calcular el Total COGS proyectado
    const proyeccionTotalCOGS = proyeccionInventarioInicial + proyecciones.Compras - proyeccionInventarioFinal;

    // Calcular Ganancia Bruta proyectada
    const proyeccionGananciaBruta = proyecciones.Ingresos_por_ventas - proyeccionTotalCOGS;

    // Calcular Total de Gastos Operativos proyectado
    const proyeccionTotalGastosOperativos = proyecciones.Servicio_de_agua + proyecciones.Electricidad + proyecciones.Internet + proyecciones.Salarios + proyecciones.Renta + proyecciones.Publicidad + proyecciones.Transporte;

    // Calcular la Utilidad Neta antes de impuestos proyectada
    const proyeccionUtilidadNetaAntesDeImpuestos = proyeccionGananciaBruta - proyeccionTotalGastosOperativos - proyecciones.Intereses_de_prestamos;

    // Calcular los impuestos proyectados (25%)
    const proyeccionImpuestos = proyeccionUtilidadNetaAntesDeImpuestos * 0.25;

    // Calcular la Utilidad Neta proyectada
    const proyeccionUtilidadNeta = proyeccionUtilidadNetaAntesDeImpuestos - proyeccionImpuestos;

    // Limpiar la tabla antes de llenarla
    tableBody.innerHTML = '';

    const rows = [
        { concepto: 'Ingresos por ventas', actual: data.Ingresos_por_ventas, proforma: proyecciones.Ingresos_por_ventas },
        { concepto: 'Costos de bienes vendidos (COGS)' },
        { concepto: '- Inventario Inicial', actual: data.Inventario_inicial, proforma: proyeccionInventarioInicial },
        { concepto: '- Compras', actual: data.Compras, proforma: proyecciones.Compras },
        { concepto: '- Inventario Final', actual: data.Inventario_final, proforma: proyeccionInventarioFinal },
        { concepto: 'Total COGS', actual: data.Total_COGS, proforma: proyeccionTotalCOGS },
        { concepto: 'Ganancia Bruta', actual: data.Ganancia_bruta, proforma: proyeccionGananciaBruta },
        { concepto: 'Gastos Operativos' },
        { concepto: '- Servicio de agua', actual: data.Servicio_de_agua, proforma: proyecciones.Servicio_de_agua },
        { concepto: '- Electricidad', actual: data.Electricidad, proforma: proyecciones.Electricidad },
        { concepto: '- Internet', actual: data.Internet, proforma: proyecciones.Internet },
        { concepto: '- Salarios', actual: data.Salarios, proforma: proyecciones.Salarios },
        { concepto: '- Renta', actual: data.Renta, proforma: proyecciones.Renta },
        { concepto: '- Publicidad', actual: data.Publicidad, proforma: proyecciones.Publicidad },
        { concepto: '- Transporte', actual: data.Transporte, proforma: proyecciones.Transporte },
        { concepto: 'Total Gastos Operativos', actual: data.Total_gastos_operativos, proforma: proyeccionTotalGastosOperativos },
        { concepto: 'Intereses de préstamos (8%)', actual: data.Intereses_de_prestamos, proforma: proyecciones.Intereses_de_prestamos },
        { concepto: 'Utilidad neta antes de impuestos', actual: data.Utilidad_neta_antes_de_impuestos, proforma: proyeccionUtilidadNetaAntesDeImpuestos },
        { concepto: 'Impuestos 25%', actual: data.Impuestos, proforma: proyeccionImpuestos },
        { concepto: 'Total', actual: data.Utilidad_neta, proforma: proyeccionUtilidadNeta }
    ];

    rows.forEach(row => {
        const tr = document.createElement('tr');
        const tdConcepto = document.createElement('td');
        const tdCantidadActual = document.createElement('td');
        const tdCantidadProforma = document.createElement('td');
        tdConcepto.textContent = row.concepto;
        tdCantidadActual.textContent = row.actual !== undefined ? `$${parseFloat(row.actual).toFixed(2)}` : '';
        tdCantidadProforma.textContent = row.proforma !== undefined ? `$${parseFloat(row.proforma).toFixed(2)}` : '';
        tr.appendChild(tdConcepto);
        tr.appendChild(tdCantidadActual);
        tr.appendChild(tdCantidadProforma);
        tableBody.appendChild(tr);
    });
}
