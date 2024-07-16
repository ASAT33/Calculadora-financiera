let totalAGlobal = 0;
let totalAfijosGlobal = 0;
let totalAcorrienteGlobal = 0;
let totalPasivoGlobal = 0;
let totalPcorrienteGlobal = 0;
let totalPFijosGlobal = 0;
let totalAcorrienteWIGlobal = 0;
let totalCGlobal = 0;
let totalCAbonoGlobal = 0;
let totalInventarioIGlobal = 0;
let totalInventarioFGlobal = 0;
let totalIngresosXVentasGlobal = 0;
let totalCuentasXCobrarGlobal = 0;
let totalGastosOperativosGlobal = 0;
let totalInteresesGlobal = 0;
document.addEventListener('DOMContentLoaded', async function() {

    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(data => {
            let totalMonto = 0;
            let cuentasPcobrar = 0;
            data.forEach(venta => {
                totalMonto += venta.monto;
                if (venta["Se otorga crédito"] == "sí" && venta["Fecha de cancelación"] > "2023-12-31"){
                    cuentasPcobrar += venta["Cancelación"]
                }
            });
            totalIngresosXVentasGlobal = totalMonto
            totalCuentasXCobrarGlobal = cuentasPcobrar
            const totalMontoElement = document.getElementById('total-monto');
            totalMontoElement.textContent = `${totalMonto}`;
        })
        .catch(error => console.error('Error al obtener datos de ventas anuales:', error));
    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosCorrientes.json')
        .then(response => response.json())
        .then(activosCorrientes => {
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
                .then(response => response.json())
                .then(activosFijos => {
                    var { totalAfijos, totalAcorrien, totalAC_WI, totalA, totalCXCobrar} = mostrarActivos(activosCorrientes, activosFijos);
                    totalAfijosGlobal = totalAfijos;
                    totalAcorrienteGlobal = totalAcorrien;
                    totalAcorrienteWIGlobal = totalAC_WI;
                    totalAGlobal = totalA
                    console.log('Total de activos fijos global:', totalAfijosGlobal);
                    console.log('Total de activos corrientes global:', totalAcorrienteGlobal);
                    console.log('Total de activos corrientes sin inventario global:', totalAcorrienteWIGlobal);
                })
                .catch(error => console.error('Error al obtener datos de activos fijos:', error));
        })
        .catch(error => console.error('Error al obtener datos de activos corrientes:', error));
    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/prestamo.json')
                .then(response => response.json())
                .then(prestamoData => {
                    const {totalP, totalPcorriente, totalPFijos} = mostrarPasivos(comprasData, prestamoData);
                    totalPasivoGlobal = totalP;
                    totalPcorrienteGlobal = totalPcorriente;
                    totalPFijosGlobal = totalPFijos;
                    console.log('Total de pasivos global:', totalPasivoGlobal);
                    console.log('Total de pasivos corrientes global:', totalPcorrienteGlobal);
                    console.log('Total de pasivos fijos global:', totalPFijosGlobal);
                })
                .catch(error => console.error('Error al obtener datos de préstamos:', error));
        })
        .catch(error => console.error('Error al obtener datos de compras:', error));


        await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/registros/balances/diciembre23.json')
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

        await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/inventario/inventario.json')
        .then(response => response.json())
        .then(data => {
            // Suponiendo que 'data' es un array de objetos
            var inventarioI = 0;
            var inventarioF = 0;
            /*var fechaInicio = new Date('2023-01-01');
            var fechaFin = new Date(Date.UTC(2023, 12-1, 31));
            fechaFin = fechaFin.toLocaleString('es-ES', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              });
            console.log(fechaFin)*/
            data.forEach(item =>{
                if(item.Fecha == "2023-01-01"){
                    inventarioI += item["Costo por prod"]
                }
                if(item.Fecha == "2023-12-31"){
                    inventarioF += item["Costo por prod"]
                }
            })
            console.log("Inventario inicial", inventarioI.toFixed(2));
            console.log("Inventario final", inventarioF.toFixed(2));
            totalInventarioIGlobal = inventarioI
            totalInventarioFGlobal = inventarioF

        })
        .catch(error => console.error('Error:', error));

        await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/costos-operativos/costos-operativos.json')
        .then(response => response.json())
        .then(data => {
            for (let gasto in data) {
                totalGastosOperativosGlobal += data[gasto];
            }
            totalGastosOperativosGlobal = totalGastosOperativosGlobal * 12
        })
        .catch(error => console.error('Error:', error));
        
        await mostrarLiquidez()
        await mostrarEndeudamiento()
        await mostrarActividad()
        await mostrarRentabilidad()
});

//mostrar activos
function mostrarActivos(activosCorrientes, activosFijos) {
    if (!activosCorrientes || !activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return;
    }
    /*const activosCorrientesElement = document.getElementById('activos-corrientes');
    const activosFijosElement = document.getElementById('activos-fijos');
    const activosTotaleElement = document.getElementById('total-activos');*/

    var totalAcorrien = activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario;
    var liquidezC = (totalAcorrien)
    var totalAC_WI = (activosCorrientes.caja + activosCorrientes.cuentasPorCobrar)
    var razonR = (totalAC_WI)
    /*let activosCorrientesHTML = `
        <li>Liquidez corriente: $${liquidezC.toFixed(2)}</li>
        <li>Razón rápida: $${razonR.toFixed(2)}</li>
    `;*/
    
    let totalMobiliario = 0;
    let totalEquipoOficina = 0;
    let totalVehiculos = 0;
    let totalNeto = 0;
    let depreciacionAcumuladaTotal = 0;

    activosFijos.forEach(activo => {
        if (activo) { // Verificar si el activo existe y no es null
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

    /*activosCorrientesElement.innerHTML = activosCorrientesHTML;
    activosFijosElement.innerHTML = activosFijosHTML;
    activosTotaleElement.innerHTML = totalActivosHTML;*/

    return {
        totalAfijos: totalAfijos,
        totalAcorrien: totalAcorrien,
        totalAC_WI: totalAC_WI,
        totalA: totalActivos,
        totalCXCobrar: activosCorrientes.cuentasPorCobrar
    };
}

// cxp
function calcularPT_Compras(comprasData) {
    let pasivoT = 0;
    let comprasT = 0;
    let comprasTAbono = 0;
    const fechaBalanceGeneral = new Date("2023-12-31"); 
    if (Array.isArray(comprasData) && comprasData.length > 0) {
        comprasData.forEach(compra => {
            const fechaCancelacion = new Date(compra["Fecha de cancelación"]);
            comprasTAbono = (Number(comprasT) || 0) + Number(compra["Abono"]);
            comprasT = (Number(comprasT) || 0) + Number(compra["Total"]);
            if (fechaCancelacion > fechaBalanceGeneral || isNaN(fechaCancelacion)) {
                pasivoT += (compra["Total"] - compra["Cancelación"]);
            }
        });
    } else {
        console.error("comprasData no está definido o está vacío");
    }
    return{
        pasivoTotal: pasivoT,
        comprasTAbono : comprasTAbono,
        comprasT: comprasT
    }
}

//mostrar pasivos
function mostrarPasivos(comprasData, prestamoData) {
    
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
        console.log(añoActual)
        let numPagosMensuales = años * 12;
        let pagoMensual = principal * (tasaMensual * Math.pow(1 + tasaMensual, numPagosMensuales)) / (Math.pow(1 + tasaMensual, numPagosMensuales) - 1);
        pagoMensual = parseFloat(pagoMensual.toFixed(2));
        let pagoAnual = pagoMensual * 12;
        let pagosRealizados = diferenciaAños * 12;
        console.log("TM",tasaMensual)
        console.log("PM", pagoMensual)
        console.log("PA", pagoAnual)
        console.log("PR",pagosRealizados)
        let cantidadRestante = principal * (Math.pow(1 + tasaMensual, numPagosMensuales) - Math.pow(1 + tasaMensual, pagosRealizados)) / (Math.pow(1 + tasaMensual, numPagosMensuales) - 1);
        cantidadRestante = parseFloat(cantidadRestante.toFixed(2));

        calcularInteresesAnoActual(pagosRealizados)

        return {
            pagoAnual: pagoAnual,
            cantidadRestante: cantidadRestante
        };
    }
    const {pasivoTotal, comprasTAbono, comprasT} = calcularPT_Compras(comprasData);
    totalCAbonoGlobal = comprasTAbono
    totalCGlobal = comprasT
    /*const pasivoTotalElement = document.getElementById('cxp');
    if (pasivoTotalElement) {
        pasivoTotalElement.innerHTML = `<li>CXP $${pasivoTotal}</li>`;
    } else {
        console.error('Elemento con ID "cxp" no encontrado.');
    }*/

    const { pagoAnual, cantidadRestante } = procesarPrestamos(prestamoData);

    const totalSumaPasivos = pasivoTotal + pagoAnual + cantidadRestante;
    const totalPFijos = pagoAnual + cantidadRestante;

    /*const sumaTotalElement = document.getElementById('suma-total');
    if (sumaTotalElement) {
        sumaTotalElement.textContent = `Suma Total: $${totalSumaPasivos}`;
    } else {
        console.error('Elemento con ID "suma-total" no encontrado.');
    }*/
   
    return {
        totalP: totalSumaPasivos,
        totalPcorriente: pasivoTotal,
        totalPFijos : totalPFijos
    };
}

function calcularAñosEnOperacion(fechaInicial) {
    const fechaActual = new Date();
    const tiempoEnMilisegundos = fechaActual - fechaInicial.getTime();
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}

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
      <li> Préstamos a Corto Plazo: $${balanceData.prestamos_corto_plazo.toFixed(2)}</li>
    `;
    document.getElementById('diciembre-cxp').innerHTML = pasivosCorrientesHTML;
  
    const pasivosFijosHTML = `
      <li>Prestamos a corto plazo: $${balanceData.prestamos_corto_plazo.toFixed(2)}</li>
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

async function calcularInteresesAnoActual(pagosRealizados){
    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/cuotas.json')
        .then(response => response.json())
        .then(cuotas => {
            for (let cuota in cuotas) {
                if ((pagosRealizados - 11) <= cuotas[cuota]["numero_cuota"] && pagosRealizados >= cuotas[cuota]["numero_cuota"]){
                    console.log(cuotas[cuota]["numero_cuota"])
                    totalInteresesGlobal += (Number(cuotas[cuota]["interes"]) || 0);
                }
            }
        })
        .catch(error => console.error('Error:', error));
}
  
async function mostrarLiquidez() {
    const liquidezElement = document.getElementById('liquidez');

    let liquidezC = totalAcorrienteGlobal/totalPcorrienteGlobal
    let razonR = totalAcorrienteWIGlobal/totalPcorrienteGlobal
    let liquidez = `
        <li>Liquidez corriente: ${liquidezC.toFixed(2)}</li>
        <li>Razón rápida: ${razonR.toFixed(2)}</li>
    `;

    liquidezElement.innerHTML = liquidez
}

async function mostrarEndeudamiento(){
    const enduadamientoElement = document.getElementById('endeudamiento');
    //Nivel de endeudamiento
    let nivelE = totalPasivoGlobal/totalAGlobal
    //Concentración del endeudamiento en el corto plazo
    let concentracionDEndeudamiento = totalPcorrienteGlobal/totalPasivoGlobal

    let totalCOGS = (totalInventarioIGlobal + totalCAbonoGlobal) - totalInventarioFGlobal
    let gananciaBruta = (totalIngresosXVentasGlobal - totalCOGS);
    let UAII = (gananciaBruta - totalGastosOperativosGlobal)
    let coberturaDInteres = UAII/totalInteresesGlobal
    console.log("totalCAbonoGlobal", totalCAbonoGlobal)
    console.log("INGRESOSPORVENTA",totalIngresosXVentasGlobal)
    console.log("totalCOGS",totalCOGS)
    console.log("UAII",UAII)
    console.log("INTERESES",totalInteresesGlobal)
    let endeudamiento = `
        <li>Nivel de endeudamiento: ${nivelE.toFixed(2)}</li>
        <li>Concentración del endeudamiento en el corto plazo: ${concentracionDEndeudamiento.toFixed(2)}</li>
        <li>Cobertura de intereses: ${coberturaDInteres.toFixed(2)}</li>
    `;
    //<li>Cobertura de Interés: ${coberturaDInteres.toFixed(2)}</li>
    enduadamientoElement.innerHTML = endeudamiento
}

async function mostrarActividad(){
    const actividadElement = document.getElementById("actividad")
    //Rotación de inventario
    let inventarioPromedio = (totalInventarioIGlobal + totalInventarioFGlobal)/2
    let totalCOGS = (totalInventarioIGlobal + totalCAbonoGlobal) - totalInventarioFGlobal
    let rotacionInventario = totalCOGS/inventarioPromedio
    //Periodo Promedio de cobro
    let ventasDiariasPromedio = totalIngresosXVentasGlobal/365
    let periodoPromedioDCobro = totalCuentasXCobrarGlobal/ventasDiariasPromedio
    //Periodo Promedio de pago
    let comprasDiariasPromedio = totalCGlobal/365
    let periodoPromedioDPago = totalPcorrienteGlobal/comprasDiariasPromedio
    let actividad = `
        <li>Rotación de inventario: ${rotacionInventario.toFixed(2)}</li>
        <li>Periodo Promedio de cobro: ${periodoPromedioDCobro.toFixed(2)}</li>
        <li>Periodo Promedio de pago: ${periodoPromedioDPago.toFixed(2)}</li>
    `;

    actividadElement.innerHTML = actividad
}

async function mostrarRentabilidad(){
    const actividadElement = document.getElementById("rentabilidad")
    //Margen bruto (de utilidad)
    let totalCOGS = (totalInventarioIGlobal + totalCAbonoGlobal) - totalInventarioFGlobal
    let utilidadBruta = totalIngresosXVentasGlobal - totalCOGS
    let margenBruto = (utilidadBruta/totalIngresosXVentasGlobal)
    //Margen de utilidad operativa
    console.log("totalCXP",totalPcorrienteGlobal)
    console.log("totalCXC",totalCuentasXCobrarGlobal)
    let utilidadOperativa = utilidadBruta - totalGastosOperativosGlobal
    let margenUtilidadOperativa = utilidadOperativa/totalIngresosXVentasGlobal
    let rentabilidad = `
        <li>Margen bruto (de utilidad): ${margenBruto.toFixed(2)} centavos</li>
        <li>Margen de utilidad operativa: ${margenUtilidadOperativa.toFixed(2)}</li>
    `;

    actividadElement.innerHTML = rentabilidad
}