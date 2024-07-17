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
let totalInventariosXMes = [];
let totalInventariosInicioFinalXMes = []
let totalVentasXMesA = [];
let totalComprasXMesA = [];
let totalInteresesXMes= []
let aExistentes = []
var rotation = 0
//caja
let comprasGastosXMesA = []
let flujosEfectivoNetoXMesA = [];
let efectivoInicialXMesA = [];
let efectivoFinalXMesA = [];
let efectivoRestante = [];
//depreciación
let totalDepresacionXMesA = []
let fechaMarcada
document.addEventListener('DOMContentLoaded', async function() {

    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(data => {
            let totalMonto = 0;
            let cuentasPcobrar = 0;
            let ventasMeses = []
            let fechaAnterior

            data.forEach(venta => {
                const fechaArray = new Date(venta["fecha"]);
                const fechaActual = new Date(fechaArray.getUTCFullYear(), fechaArray.getUTCMonth() + 1, 0)
                const fechaCancelacion = new Date(venta["Fecha de cancelación"])
                let flag = false
                if (aExistentes.length == 0 || aExistentes.find(a=> a == fechaArray.getUTCFullYear()) != fechaArray.getUTCFullYear() ){
                    aExistentes.push(fechaArray.getUTCFullYear())
                }
                //Suma por cada mes para análisis vertical
                ventasMeses.forEach(item =>{
                    if(item.year == fechaArray.getUTCFullYear() && item.month == fechaArray.getUTCMonth() + 1){
                        item.total += venta["monto"]
                        if ((new Date(fechaCancelacion.getUTCFullYear(), fechaCancelacion.getUTCMonth(), fechaCancelacion.getUTCDate())) > fechaActual || isNaN(fechaCancelacion)) {
                            item["cuentas_cobrar"] += venta["Cancelación"];
                        }
                        flag = true
                    }
                })
                if(fechaAnterior == undefined || flag == false || fechaAnterior.getUTCFullYear() != fechaArray.getUTCFullYear() || fechaAnterior.getUTCMonth() != fechaArray.getUTCMonth()){
                    fechaAnterior = fechaArray
                    let ventas = {}
                    ventas["total"] = venta["monto"]
                    ventas["year"] = fechaArray.getUTCFullYear()
                    ventas["month"] = fechaArray.getUTCMonth() + 1
                    ventas["cuentas_cobrar"] = 0
                    if ((new Date(fechaCancelacion.getUTCFullYear(), fechaCancelacion.getUTCMonth(), fechaCancelacion.getUTCDate())) > fechaActual || isNaN(fechaCancelacion)) {
                        ventas["cuentas_cobrar"] = venta["Cancelación"];
                    }
                    ventasMeses.push(ventas)
                }
                if (venta["Se otorga crédito"] == "sí" && venta["Fecha de cancelación"] > "2023-12-31"){
                    cuentasPcobrar += venta["Cancelación"]
                }
                totalMonto += venta.monto;
            });
            console.log("ventasMeses",ventasMeses)
            console.log("cuentasPcobrar",cuentasPcobrar)
            totalVentasXMesA = ventasMeses
            totalIngresosXVentasGlobal = totalMonto
            totalCuentasXCobrarGlobal = cuentasPcobrar
            //const totalMontoElement = document.getElementById('total-monto');
            //totalMontoElement.textContent = `${totalMonto}`;
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
                    const {totalP, totalPcorriente/*, totalPFijos*/} = mostrarPasivos(comprasData, prestamoData);
                    totalPasivoGlobal = totalP;
                    totalPcorrienteGlobal = totalPcorriente;
                    totalPFijosGlobal //= totalPFijos;
                    console.log('Total de pasivos global:', totalPasivoGlobal);
                    console.log('Total de pasivos corrientes global:', totalPcorrienteGlobal);
                    console.log('Total de pasivos fijos global:', totalPFijosGlobal);
                })
                .catch(error => console.error('Error al obtener datos de préstamos:', error));
        })
        .catch(error => console.error('Error al obtener datos de compras:', error));


        /*await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/registros/balances/diciembre23.json')
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
        });*/



        await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/inventario/inventario.json')
        .then(response => response.json())
        .then(data => {
            var inventarioI = 0;
            var inventarioF = 0;
            let inventarioMeses = []
            let inventariosInicioFinal = []
            let fechaAnterior
            data.forEach(inventario =>{
                const fechaArray = new Date(inventario["Fecha"]);
                let flag = false
                inventarioMeses.forEach(item =>{
                    if(item.year == fechaArray.getUTCFullYear() && item.month == fechaArray.getUTCMonth() + 1){
                        item.total += inventario["Costo por prod"]
                        flag = true
                    }
                })
                if(fechaAnterior == undefined || flag == false || fechaAnterior.getUTCFullYear() != fechaArray.getUTCFullYear() || fechaAnterior.getUTCMonth() != fechaArray.getUTCMonth()){
                    fechaAnterior = fechaArray
                    let inventarios = {}
                    inventarios["total"] = inventario["Costo por prod"]
                    inventarios["year"] = fechaArray.getUTCFullYear()
                    inventarios["month"] = fechaArray.getUTCMonth() + 1
                    inventarioMeses.push(inventarios)
                }
                let firstDay = (new Date(fechaArray.getUTCFullYear(), fechaArray.getUTCMonth(), 1))
                let actualDay = (new Date(fechaArray.getUTCFullYear(), fechaArray.getUTCMonth(), fechaArray.getUTCDate()))
                let lastDay = (new Date(fechaArray.getUTCFullYear(), fechaArray.getUTCMonth() + 1, 0).toString())
                /*if(actualDay.toString() == firstDay.toString()){
                    console.log(actualDay.toString())
                    console.log(firstDay.toString())
                    console.log(inventario["Costo por prod"])
                }*/
                //##################
                flag = false;
                inventariosInicioFinal.forEach(item =>{
                    if ((new Date(item.year,item.month-1,item.day).toString()) == actualDay.toString()){
                        item.total += inventario["Costo por prod"]
                        flag = true
                    }
                })
                if(flag == false && actualDay.toString() == firstDay.toString()){
                    let inventarios = {}
                    inventarios["year"] = actualDay.getUTCFullYear()
                    inventarios["month"] = actualDay.getUTCMonth() + 1
                    inventarios["day"] = actualDay.getUTCDate()
                    inventarios["total"] = inventario["Costo por prod"]
                    inventariosInicioFinal.push(inventarios)
                }
                if(flag == false && actualDay.toString() == lastDay.toString()){
                    let inventarios = {}
                    inventarios["year"] = actualDay.getUTCFullYear()
                    inventarios["month"] = actualDay.getUTCMonth() + 1
                    inventarios["day"] = actualDay.getUTCDate()
                    inventarios["total"] = inventario["Costo por prod"]
                    inventariosInicioFinal.push(inventarios)
                }
            })
            console.log("Inventarios", inventarioMeses)
            console.log("Inventarios", inventariosInicioFinal)
            //console.log("AAAAAAA",new Date(inventariosInicioFinal[0].year,inventariosInicioFinal[0].month - 1,inventariosInicioFinal[0].day))
            totalInventariosXMes = inventarioMeses
            totalInventariosInicioFinalXMes = inventariosInicioFinal
        })
        .catch(error => console.error('Error:', error));

        await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/costos-operativos/costos-operativos.json')
        .then(response => response.json())
        .then(data => {
            for (let gasto in data) {
                totalGastosOperativosGlobal += data[gasto];
            }
        })
        .catch(error => console.error('Error:', error));
        
        /*await mostrarLiquidez()
        await mostrarEndeudamiento()
        await mostrarActividad()
        await mostrarRentabilidad()*/
        await calcularActivosFijos()
        await calcularIntereses()
        await presupuestoCaja()
        console.log(totalDepresacionXMesA)
        await razonXMes()
        await mostrarMesA()
        await drag_drop()

        let sendElement = document.getElementById("arrow")
        sendElement.addEventListener('click', function() {
            let questionElement = document.getElementById("question").textContent
            const sendElement = document.getElementById('arrow')
            const loadingElement = document.getElementById('change')
            sendElement.classList.toggle("change")
            loadingElement.classList.toggle("change")
            question(questionElement)
        });

        let rechargeElement = document.getElementById("recharge")
        rechargeElement.addEventListener('click', function() {
            rotation += 360
            rechargeElement.style.transform = `rotate(${rotation}deg)`;
            document.getElementById("question").innerHTML = "Variables"
            document.getElementById("answer").innerHTML = ""
        });
});

//mostrar activos
function mostrarActivos(activosCorrientes, activosFijos) {
    if (!activosCorrientes || !activosFijos) {
        console.error("Los datos de activos no están definidos o están incompletos");
        return;
    }

    var totalAcorrien = activosCorrientes.caja + activosCorrientes.cuentasPorCobrar + activosCorrientes.inventario;
    var totalAC_WI = (activosCorrientes.caja + activosCorrientes.cuentasPorCobrar)
    
    let totalMobiliario = 0;
    let totalEquipoOficina = 0;
    let totalVehiculos = 0;
    let totalNeto = 0;
    let depreciacionAcumuladaTotal = 0;

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
    let comprasMeses = []
    let fechaAnterior
    const fechaBalanceGeneral = new Date("2023-12-31");
    if (Array.isArray(comprasData) && comprasData.length > 0) {
        comprasData.forEach(compra => {
            const fechaCancelacion = new Date(compra["Fecha de cancelación"]);
            const fechaArray = new Date(compra["Fecha"]);
            const fechaActual = new Date(fechaArray.getUTCFullYear(), fechaArray.getUTCMonth() + 1, 0)
            //console.log("FECHA Cancelación",new Date(fechaCancelacion.getUTCFullYear(), fechaCancelacion.getUTCMonth(), fechaCancelacion.getDate() + 1))
            //console.log("FECHA ACTUAL",fechaActual)
            comprasTAbono = (Number(comprasT) || 0) + Number(compra["Abono"]);
            comprasT = (Number(comprasT) || 0) + Number(compra["Total"]);
            //Suma por cada mes para análisis vertical
            if (aExistentes.length == 0 || aExistentes.find(a=> a == fechaArray.getUTCFullYear()) != fechaArray.getUTCFullYear() ){
                aExistentes.push(fechaArray.getUTCFullYear())
            }
            //CALCULAR CUENTAS POR PAGAR POR MES
            let flag = false
            comprasMeses.forEach(item =>{
                if(item.year == fechaArray.getUTCFullYear() && item.month == fechaArray.getUTCMonth() + 1){
                    item.total += (compra["Total"] - compra["Abono"])
                    item.abono += Number(compra["Abono"])
                    if ((new Date(fechaCancelacion.getUTCFullYear(), fechaCancelacion.getUTCMonth(), fechaCancelacion.getUTCDate() + 1)) > fechaActual || isNaN(fechaCancelacion)) {
                        item["cuentas_pagar"] += (compra["Total"] - compra["Cancelación"]);
                    }
                    flag = true
                }
            })
            if(fechaAnterior == undefined || flag == false || fechaAnterior.getUTCFullYear() != fechaArray.getUTCFullYear() || fechaAnterior.getUTCMonth() != fechaArray.getUTCMonth()){
                fechaAnterior = fechaArray
                let compras = {}
                compras["total"] = (compra["Total"] - compra["Abono"])
                compras["year"] = fechaArray.getUTCFullYear()
                compras["month"] = fechaArray.getUTCMonth() + 1
                compras["cuentas_pagar"] = 0
                compras["abono"] = Number(compra["Abono"])
                if ((new Date(fechaCancelacion.getUTCFullYear(), fechaCancelacion.getUTCMonth(), fechaCancelacion.getUTCDate() + 1)) > fechaActual || isNaN(fechaCancelacion)) {
                    compras["cuentas_pagar"] = (compra["Total"] - compra["Cancelación"]);
                }
                comprasMeses.push(compras)
            }
            /*if (fechaCancelacion > fechaBalanceGeneral || isNaN(fechaCancelacion)) {
                pasivoT += (compra["Total"] - compra["Cancelación"]);
            }*/
        });
    } else {
        console.error("comprasData no está definido o está vacío");
    }
    console.log("comprasMeses",comprasMeses)
    totalComprasXMesA = comprasMeses
    console.log("comprasT",comprasT)
    return{
        pasivoTotal: pasivoT,
        comprasTAbono : comprasTAbono,
        comprasT: comprasT
    }
}

//mostrar pasivos
function mostrarPasivos(comprasData, prestamoData) {
    
    const {pasivoTotal, comprasTAbono, comprasT} = calcularPT_Compras(comprasData);
    totalCAbonoGlobal = comprasTAbono
    totalCGlobal = comprasT

    const totalSumaPasivos = pasivoTotal //+ pagoAnual + cantidadRestante;
    //const totalPFijos = pagoAnual + cantidadRestante;
    
    return {
        totalP: totalSumaPasivos,
        totalPcorriente: pasivoTotal,
        //totalPFijos : totalPFijos
    };
}

function calcularAñosEnOperacion(fechaActual,fechaInicial) {
    const tiempoEnMilisegundos = fechaActual - fechaInicial;
    const añosEnMilisegundos = 1000 * 60 * 60 * 24 * 365; // en milisegundos
    return Math.floor(tiempoEnMilisegundos / añosEnMilisegundos);
}

async function calcularIntereses(){
    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/cuotas.json')
        .then(response => response.json())
        .then(cuotas => {
            let interesMeses = []
            cuotas.forEach(cuota =>{
                let flag = false
                /*interesMeses.forEach(item =>{
                    if(item.year == cuota["year"] && item.month == cuota["month"]){
                        item.total += cuota["interes"]
                        flag = true
                    }
                })*/
                aExistentes.forEach(year=>{
                    if(Number(year) == Number(cuota["year"])){
                        flag = true
                    }
                })
                if(flag == true){
                    let cuotas = {}
                    cuotas["vivo"] = cuota["capital_vivo"]
                    cuotas["interes"] = cuota["interes"]
                    cuotas["pago"] = cuota["pago_mensual"]
                    cuotas["year"] = cuota["year"]
                    cuotas["month"] = cuota["month"]
                    interesMeses.push(cuotas)
                }
            })
            console.log("interesMeses",interesMeses)
            totalInteresesXMes = interesMeses;
        })
        .catch(error => console.error('Error:', error));
}
  
async function mostrarLiquidez(totalAcorriente,totalPcorriente,inventario) {
    const liquidezElement = document.getElementById('liquidez');
    let totalAcorrienteWI = totalAcorriente-inventario
    let liquidezC = totalAcorriente/totalPcorriente
    let razonR = totalAcorrienteWI/totalPcorriente
    let liquidez = `
        <div draggable="true" class="box">Liquidez corriente: ${liquidezC.toFixed(2)}</div>
        <div draggable="true" class="box">Razón rápida: ${razonR.toFixed(2)}</div>
    `;

    return liquidez
    liquidezElement.innerHTML = liquidez
}

async function mostrarEndeudamiento(totalA,totalP,totalPC,totalCOGS,totalIngresosV,interes){
    const enduadamientoElement = document.getElementById('endeudamiento');
    //Nivel de endeudamiento
    let nivelE = totalP/totalA
    //Concentración del endeudamiento en el corto plazo
    let concentracionDEndeudamiento = totalPC/totalP
    let COGS = totalCOGS
    //------
    let gananciaBruta = (totalIngresosV - COGS);
    let UAII = (gananciaBruta - totalGastosOperativosGlobal)
    let coberturaDInteres = UAII/interes
    console.log("UAII",UAII,"interes",interes)
    //console.log("totalCAbonoGlobal", totalC)
    console.log("INGRESOSPORVENTA",totalIngresosV)
    console.log("totalCOGS",COGS)
    console.log("UAII",UAII)
    console.log("INTERESES",interes)
    let endeudamiento = `
        <div draggable="true" class="box">Nivel de endeudamiento: ${nivelE.toFixed(2)}</div>
        <div draggable="true" class="box">Concentración del endeudamiento en el corto plazo: ${concentracionDEndeudamiento.toFixed(2)}</div>
        <div draggable="true" class="box">Cobertura de intereses: ${coberturaDInteres.toFixed(2)}</div>
    `;
    //<li>Cobertura de Interés: ${coberturaDInteres.toFixed(2)}</li>
    return endeudamiento
    enduadamientoElement.innerHTML = endeudamiento
}

async function mostrarActividad(totalPC,inventarioI,inventarioF,totalIngresosV,totalGastoC,dias,totalCXC){
    const actividadElement = document.getElementById("actividad")
    //Rotación de inventario
    let inventarioPromedio = (inventarioI + inventarioF)/2
    let totalCOGS = (totalInventarioIGlobal + totalCAbonoGlobal) - totalInventarioFGlobal
    let rotacionInventario = totalCOGS/inventarioPromedio
    //Periodo Promedio de cobro
    let ventasDiariasPromedio = totalIngresosV/dias //totalIngresosV/365
    let periodoPromedioDCobro = totalCXC/ventasDiariasPromedio
    console.log("totalCXC",totalCXC)
    console.log("ventasDiariasPromedio",ventasDiariasPromedio)
    //Periodo Promedio de pago
    let comprasDiariasPromedio = totalGastoC/dias //totalGastoC/365
    let periodoPromedioDPago = totalPC/comprasDiariasPromedio
    let actividad = `
        <div draggable="true" class="box">Rotación de inventario: ${rotacionInventario.toFixed(2)}</div>
        <div draggable="true" class="box">Periodo Promedio de cobro: ${periodoPromedioDCobro.toFixed(2)}</div>
        <div draggable="true" class="box">Periodo Promedio de pago: ${periodoPromedioDPago.toFixed(2)}</div>
    `;

    return actividad
    actividadElement.innerHTML = actividad
}

async function mostrarRentabilidad(COGS,totalIngresosV){
    const actividadElement = document.getElementById("rentabilidad")
    //Margen bruto (de utilidad)
    //let totalCOGS = (totalInventarioIGlobal + totalCAbonoGlobal) - totalInventarioFGlobal
    let utilidadBruta = totalIngresosV - COGS
    let margenBruto = (utilidadBruta/totalIngresosV)
    //Margen de utilidad operativa
    console.log("totalCXP",totalPcorrienteGlobal)
    console.log("totalCXC",totalCuentasXCobrarGlobal)
    let utilidadOperativa = utilidadBruta - totalGastosOperativosGlobal
    let margenUtilidadOperativa = utilidadOperativa/totalIngresosV
    let rentabilidad = `
        <div draggable="true" class="box">Margen bruto (de utilidad): ${margenBruto.toFixed(2)} centavos</div>
        <div draggable="true" class="box">Margen de utilidad operativa: ${margenUtilidadOperativa.toFixed(2)}</div>
    `;

    return rentabilidad
    actividadElement.innerHTML = rentabilidad
}

async function drag_drop(){
        function handleDragStart(e) {
            this.style.opacity = '0.4';
          
            dragSrcEl = this;
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
            console.log(e.dataTransfer.setData('text/html', this.innerHTML))
        }
      
        function handleDragEnd(e) {
          this.style.opacity = '1';
      
          items.forEach(function (item) {
            item.classList.remove('over');
          });
        }
      
        function handleDragOver(e) {
          e.preventDefault();
          return false;
        }
      
        function handleDragEnter(e) {
          this.classList.add('over');
        }
      
        function handleDragLeave(e) {
          this.classList.remove('over');
        }
    
        function handleDrop(e) {
            e.stopPropagation();
            console.log(e.dataTransfer.getData('text/html'))
            if (dragSrcEl !== this) {
              //dragSrcEl.innerHTML = this.innerHTML;
              console.log(e.dataTransfer.getData('text/html'))
              if(this.textContent.trim() == "Variables"){
                this.innerHTML = fechaMarcada+": "+e.dataTransfer.getData('text/html')
              }else{
                this.innerHTML += ","+e.dataTransfer.getData('text/html');
              }
            }
            return false;
        }
      
        let items = document.querySelectorAll('.box');
        items.forEach(function(item) {
          item.addEventListener('dragstart', handleDragStart);
          item.addEventListener('dragover', handleDragOver);
          item.addEventListener('dragenter', handleDragEnter);
          item.addEventListener('dragleave', handleDragLeave);
          item.addEventListener('dragend', handleDragEnd);
        });

        let question = document.querySelector('.box-q')
        question.addEventListener('dragover', handleDragOver);
        question.addEventListener('dragenter', handleDragEnter);
        question.addEventListener('drop', handleDrop);
}

const calcularActivosFijos = async function (){
    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
                .then(response => response.json())
                .then(activosFijos => {
                    aExistentes.forEach(async (year)=>{
                        for(i=1; i<13; i++){
                        let fechaActual = (new Date(year, i, 0))
                        let totalMobiliario = 0;
                        let totalEquipoOficina = 0;
                        let totalVehiculos = 0;
                        let totalNeto = 0;
                        let depreciacionAcumulada = 0;
                        activosFijos.forEach(activo => {
                            if (activo) { // Verificar si el activo existe y no es null
                                let fechaAdquisicion = new Date(activo["fechaAdquisicion"]);
                                fechaAdquisicion = new Date(fechaAdquisicion.getUTCFullYear(),fechaAdquisicion.getUTCMonth(),fechaAdquisicion.getUTCDate())
                                if(fechaAdquisicion<fechaActual){
                                    const {precioCompra} = activo;
                                    const añosEnOperacion = calcularAñosEnOperacion(fechaActual,fechaAdquisicion);
                                    //  10% depreciacion anual
                                    const depreciacionAnual = 0.10;
                                    depreciacionAcumulada += precioCompra * depreciacionAnual * añosEnOperacion;
                                    totalNeto += precioCompra;
                                    switch (activo["categoria"]) {
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
                            }
                        });
                        const totalAfijos = totalNeto - depreciacionAcumulada;
                        let tD = {}
                        tD["year"]=fechaActual.getUTCFullYear()
                        tD["month"]=fechaActual.getUTCMonth() + 1
                        tD["totalNeto"]=totalNeto
                        tD["depreciacionAcumulada"]=depreciacionAcumulada
                        tD["totalAfijos"]=totalAfijos
                        tD["vehiculos"]= totalVehiculos
                        tD["oficina"]= totalEquipoOficina
                        tD["mobiliarios"]= totalMobiliario
                        totalDepresacionXMesA.push(tD)
                    }
                })
            }).catch(error => console.error('Error al obtener datos de activos fijos:', error));
}

const presupuestoCaja = async function (){
    //Obtener flujo efectivo neto y los gastos por compras de cada mes
    totalVentasXMesA.forEach(venta=>{
        totalComprasXMesA.forEach(compra=>{
            if (venta.year==compra.year && venta.month==compra.month || (flujosEfectivoNetoXMesA.length == 0 && venta.year==compra.year && venta.month==compra.month)){
                const compraGasto = compra.total + totalGastosOperativosGlobal
                let fEN = {}
                fEN["total"] = (venta.total - compraGasto)
                fEN["year"] = venta.year
                fEN["month"] = venta.month
                flujosEfectivoNetoXMesA.push(fEN)
                comprasGastosXMesA.push({"total":compraGasto,"year":venta.year,"month":venta.month})
            }
        })
    })
    console.log(flujosEfectivoNetoXMesA)
    //Obtener efectivo inial de cada mes
    flujosEfectivoNetoXMesA.forEach(efectivoN=>{
        let fEI = {}
        let year = 0
        let month = 0
        year = efectivoN.year
        month = efectivoN.month - 1
        if(efectivoN.month == 1){
            year = Number(efectivoN.year) - 1; 
            month = 12
        }
        const fEfectivoXMes = flujosEfectivoNetoXMesA.find((item) => (item.year == year && item.month == month)) || {"total":0}
        const fInicialXMes = efectivoInicialXMesA.find((item) => (item.year == year && item.month == month)) || {"total":0}
        fEI["total"] = (fEfectivoXMes.total + fInicialXMes.total)
        fEI["year"] = efectivoN.year
        fEI["month"] = efectivoN.month
        efectivoInicialXMesA.push(fEI)
    })
    console.log(efectivoInicialXMesA)
    //Obtener efecto final de cada mes
    flujosEfectivoNetoXMesA.forEach(efectivoN=>{
        const fInicialXMes = efectivoInicialXMesA.find((item) => (item.year == efectivoN.year && item.month == efectivoN.month)) || {"total":0}
        let fEF = {}
        fEF["total"] = (efectivoN.total + fInicialXMes.total)
        fEF["year"] = efectivoN.year
        fEF["month"] = efectivoN.month
        efectivoFinalXMesA.push(fEF)
    })
    console.log(efectivoFinalXMesA)
    //obtener saldo efectivo restante
    efectivoFinalXMesA.forEach(efectivoF=>{
        let eR = {}
        eR["total"] = (efectivoF.total - 900)
        eR["year"] = efectivoF.year
        eR["month"] = efectivoF.month
        efectivoRestante.push(eR)
    })
    console.log(efectivoRestante)
}

const obtenerNombreMes = async function (fecha) {
    return new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC'}).format(fecha);
}

const mostrarMesA = async function(){
    const aElement = document.getElementById('container-A');
    for (const year of aExistentes){
        let button_y = document.createElement('button');
        button_y.id = `btn-razones`;
        button_y.className = "btn btn-primary";
        button_y.textContent = year;
        button_y.addEventListener('click', function() {
            toggleMostrarA(this);
        });
        aElement.appendChild(button_y);
        const fechasElement = document.getElementById(`container-M`);
        let yearElement = document.createElement('div');
            yearElement.id = `${year}`;
            yearElement.className = "years";
            fechasElement.appendChild(yearElement);
        const addElement = document.getElementById(`${year}`);
        for(let i=0; i < 12; i++){
            let fecha = await obtenerNombreMes(new Date(2023,i,1))
            let button_m = document.createElement('button');
            button_m.id = `btn-razones ${fecha}`;
            button_m.className = "btn btn-primary";
            button_m.textContent = fecha;
            button_m.addEventListener('click', function() {
                toggleMostrarM(`razon-${year}-${fecha}`);
            });
            addElement.appendChild(button_m);
        }
    }
}

function toggleMostrarA(event) {
    let items = document.querySelectorAll('.years');
    items.forEach(element =>{
        if(element.id == event.textContent){
            element.style.display = 'block';
        }else{
            element.style.display = 'none';
        }
    })
    console.log(`Mes seleccionado: ${event.textContent}`)
}

function toggleMostrarM(event) {
    let items = document.querySelectorAll('.meses');
    items.forEach(element =>{
        if(element.id == event){
            element.classList.add('change');
        }else{
            element.classList.remove('change');
        }
    })
    if (fechaMarcada == undefined || fechaMarcada != event){
        fechaMarcada = event
        document.getElementById("question").innerHTML = "Variables"
        document.getElementById("answer").innerHTML = ""
    }
    console.log(`Mes seleccionado: ${event}`)
}

const razonXMes = async function() {
    const mainElement = document.getElementById(`main`);
    for (const year of aExistentes){
        for(let i=0; i < 12; i++){
            const activo = totalVentasXMesA.find(venta => venta.year == year && venta.month == i+1)
            const pasivo = totalComprasXMesA.find(compra => compra.year == year && compra.month == i+1)
            const cuota = totalInteresesXMes.find(cuota => cuota.year == year && cuota.month == i+1)
            const caja = efectivoRestante.find(caja => caja.year == year && caja.month == i+1)
            const inventarioF = totalInventariosInicioFinalXMes.find(inventario => inventario.year == year && inventario.month == (i+1) && inventario.day == new Date(year,(i + 1),0).getUTCDate())
            const inventarioI = totalInventariosInicioFinalXMes.find(inventario => inventario.year == year && inventario.month == (i+1) && inventario.day == new Date(year,(i),1).getUTCDate())
            const activoF = totalDepresacionXMesA.find(activoF => activoF.year == year && activoF.month == i+1)
            if (!(activo && caja && inventarioF)){
                return
            }
            //PASIVO CORRIENTE, ACTIVO CORRIENTE, ACTIVO FIJO TOTAL, ACTIVO TOTAL, PASIVO TOTAL, COGS
            const PC = pasivo.cuentas_pagar
            const AC = activo.cuentas_cobrar+caja.total+inventarioF.total
            const AF = activoF.totalNeto - activoF.depreciacionAcumulada
            const AT = AC + AF
            const PT = pasivo.cuentas_pagar+Number(cuota.pago)+Number(cuota.vivo)
            const COGS = (inventarioI.total + pasivo.total) - inventarioF.total
            //console.log(activo.cuentas_cobrar,caja.total,inventarioF.total)
            //console.log(pasivo.cuentas_pagar,Number(cuota.pago),Number(cuota.vivo))
            let liquidez = await mostrarLiquidez(AC,PT,inventarioF.total)
            let endeudamiento = await mostrarEndeudamiento(AT,PT,PC,COGS,activo.total,cuota.interes)
            let actividad = await mostrarActividad(PC,inventarioI.total,inventarioF.total,activo.total,pasivo.total,new Date(year,(i),1).getUTCDate(),activo.cuentas_cobrar)
            let rentabilidad = await mostrarRentabilidad(COGS,activo.total)
            let fecha = await obtenerNombreMes(new Date(year,i,1))

            //operacion para division en pasivo corriente
            const PCD = (pasivo.cuentas_pagar+Number(cuota.interes)+Number(cuota.pago))
            const razonHTML = `<section id="razon-${year}-${fecha}" class="container mt-4 meses">
                    <h2>Razon de ${fecha} de ${year} </h2>
                    <div class="row">
                        <div class="col-md-6">
                            <h3>Liquidez</h3>
                            <p id="liquidez">${liquidez}</p>
                            <h3>Endeudamiento</h3>
                            <p id="endeudamiento">${endeudamiento}</p>
                        </div>
                        <div class="col-md-6">
                            <h3>Actividad</h3>
                            <p id="actividad">${actividad}</p>
                            <h4>Rentabilidad</h4>
                            <p id="rentabilidad">${rentabilidad}</p>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-md-12">
                            <h3>Análisis vertical</h3>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <div draggable="true" class="box">Caja (efectivo):${caja.total.toFixed(2)} || ${((caja.total/AC)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Cuentas por Cobrar: ${activo.cuentas_cobrar.toFixed(2)} || ${((activo.cuentas_cobrar/AC)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Inventario: ${inventarioF.total.toFixed(2)} || ${((inventarioF.total/AC)*100).toFixed(2)}%</div>
                                <h3 draggable="true" class="box">Total activos corrientes: ${AC.toFixed(2)} || ${((AC/(activoF.totalNeto+AC))*100).toFixed(2)}%</h3>
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <div draggable="true" class="box">Mobiliario:${activoF.mobiliarios} || ${((activoF.mobiliarios/activoF.totalNeto)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Equipo de oficina: ${activoF.oficina} || ${((activoF.oficina/activoF.totalNeto)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Vehículos: ${activoF.vehiculos} || ${((activoF.vehiculos/activoF.totalNeto)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Depreciación: ${activoF.depreciacionAcumulada} || ${((activoF.depreciacionAcumulada/activoF.totalNeto)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Total activos fijos: ${AF} || ${((AF/activoF.totalNeto)*100).toFixed(2)}%</div>
                                <h3 draggable="true" class="box">Total Neto: ${activoF.totalNeto} || ${((activoF.totalNeto/(activoF.totalNeto+AC))*100).toFixed(2)}%</h3>
                            </p>
                        </div>
                        <div class="col-md-12">
                            <h3>Total Activos:${(activoF.totalNeto+AC).toFixed(2)}</h3>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <div draggable="true" class="box">Cuentas por pagar: ${pasivo.cuentas_pagar} || ${((pasivo.cuentas_pagar/PCD)*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">interes de prestamo: ${cuota.interes} || ${(cuota.interes/PCD*100).toFixed(2)}%</div>
                                <div draggable="true" class="box">Prestamo a corto plazo: ${cuota.pago} || ${(cuota.pago/PCD*100).toFixed(2)}%</div>
                                <h3 draggable="true" class="box">Pasivo corriente: ${PCD.toFixed(2)} || ${(PCD/(pasivo.cuentas_pagar+Number(cuota.interes)+Number(cuota.pago)+Number(cuota.vivo))*100).toFixed(2)}%</h3>
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <div draggable="true" class="box">Prestamo restante:${cuota.vivo} || ${(cuota.vivo/cuota.vivo)*100}%</div>
                                <h3 draggable="true" class="box">Pasivo fijo: ${cuota.vivo} || ${(Number(cuota.vivo)/(pasivo.cuentas_pagar+Number(cuota.interes)+Number(cuota.pago)+Number(cuota.vivo))*100).toFixed(2)}%</h3>
                            </p>
                        </div>
                        <div class="col-md-12">
                            <h3>Total Pasivos: ${(pasivo.cuentas_pagar+Number(cuota.interes)+Number(cuota.pago)+Number(cuota.vivo))}</h3>
                        </div>
                    </div>
                </section>`
            mainElement.innerHTML += (razonHTML)
        }
    }
}

const question = async function(q){
    const sendElement = document.getElementById('arrow')
    const loadingElement = document.getElementById('change')
    if(q == "Variables"){
        sendElement.classList.toggle("change")
        loadingElement.classList.toggle("change")
        return
    }
    await fetch('/ai_mistral', {
        method: 'POST',
        body: JSON.stringify({question:q}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        if (data) {
            let aElement= document.getElementById("answer")
            let answerElement = document.createElement('pre');
            answerElement.textContent = data.response;
            answerElement.className = "box-q"
            aElement.append(answerElement);
            
            sendElement.classList.toggle("change")
            loadingElement.classList.toggle("change")
        } else {
            console.error("Error al agregar el nuevo activo:", response.statusText);
            sendElement.classList.toggle("change")
            loadingElement.classList.toggle("change")
        }
    }).catch(error => {
        sendElement.classList.toggle("change")
        loadingElement.classList.toggle("change")
        console.error("Error", error);
    });
}

