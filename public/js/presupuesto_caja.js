let ventasXMesA = [];
let comprasXMesA = [];
let ventasAnuales = [];
let comprasAnuales = [];
let productos = [];
let gastosOperativos = 0; 
let flujosEfectivoNetoXMesA = [];  
let efectivoInicialXMesA = [];
let efectivoFinalXMesA = [];
let efectivoRestante = [];

const fetchProductos = async function() {
    try {
        const response = await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/ventas_anuales/productos.json');
        const data = await response.json();
        productos = data;
        llenarSelectProductos();
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
};

const llenarSelectProductos = function() {
    const selectVenta = document.getElementById('producto-venta');
    const selectCompra = document.getElementById('producto-compra');
    if (selectVenta && selectCompra) {
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.Código;
            option.text = producto.Descripción;
            selectVenta.add(option.cloneNode(true));
            selectCompra.add(option.cloneNode(true));
        });
    }
};

// Código comentado relacionado con el registro de ventas
/*
const registrarVenta = async function() {
    const productoSeleccionado = productos.find(producto => producto.Código == document.getElementById('producto-venta').value);
    const cantidad = parseFloat(document.getElementById('cantidad-venta').value);
    const fecha = document.getElementById('fecha-venta').value;
    const credito = document.getElementById('credito-venta').value;
    const abono = parseFloat(document.getElementById('abono-venta').value);
    const fechaCancelacion = document.getElementById('fecha-cancelacion-venta').value;
    const cancelacion = parseFloat(document.getElementById('cancelacion-venta').value);
    const newAsset = {
        "fecha": fecha,
        "transacción": 0, 
        "Producto": productoSeleccionado.Código,
        "Cantidad": cantidad,
        "Precio": parseFloat(productoSeleccionado["Precio de venta"].replace("$", "")),
        "monto": cantidad * parseFloat(productoSeleccionado["Precio de venta"].replace("$", "")),
        "Se otorga crédito": credito,
        "Abono (50%)": abono,
        "Fecha de cancelación": fechaCancelacion,
        "Cancelación": cancelacion
    };

    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(data => {
            const nextIndex = data ? Object.keys(data).length : 0;
            const updates = {};
            newAsset["transacción"] = (nextIndex + 1);
            updates[nextIndex] = newAsset;
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json', {
                method: 'PATCH',
                body: JSON.stringify(updates),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    console.log("Nueva venta agregada exitosamente.");
                    ventasAnuales.push(newAsset);
                    actualizarTabla(newAsset, 'venta');
                } else {
                    console.error("Error al agregar la nueva venta:", response.statusText);
                }
            }).catch(error => {
                console.error("Error al agregar el nueva venta:", error);
            });
        }).catch(error => {
            console.error("Error al obtener datos:", error);
        });
};
*/

// Código comentado relacionado con el registro de compras
/*
const registrarCompra = async function() {
    const productoSeleccionado = productos.find(producto => producto.Código == document.getElementById('producto-compra').value);
    const cantidad = parseFloat(document.getElementById('cantidad-compra').value);
    const fecha = document.getElementById('fecha-compra').value;
    const abono = parseFloat(document.getElementById('abono-compra').value);
    const fechaCancelacion = document.getElementById('fecha-cancelacion-compra').value;
    const cancelacion = parseFloat(document.getElementById('cancelacion-compra').value);
    const newAsset = {
        "Fecha": fecha,
        "Producto": productoSeleccionado.Código,
        "Cantidad": cantidad,
        "Costo unitario": parseFloat(productoSeleccionado["Costo unitario"].replace("$", "")),
        "Total": cantidad * parseFloat(productoSeleccionado["Costo unitario"].replace("$", "")),
        "Abono": abono,
        "Fecha de cancelación": fechaCancelacion,
        "Cancelación": cancelacion
    };

    await fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(data => {
            const nextIndex = data ? Object.keys(data).length : 0;
            const updates = {};
            updates[nextIndex] = newAsset;
            fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json', {
                method: 'PATCH',
                body: JSON.stringify(updates),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    console.log("Nueva compra agregada exitosamente.");
                    comprasAnuales.push(newAsset);
                    actualizarTabla(newAsset, 'compra');
                } else {
                    console.error("Error al agregar la nueva compra:", response.statusText);
                }
            }).catch(error => {
                console.error("Error al agregar el nueva compra:", error);
            });
        }).catch(error => {
            console.error("Error al obtener datos:", error);
        });
};
*/

const actualizarTabla = function(newAsset, tipo) {
    const fecha = new Date(newAsset.fecha || newAsset.Fecha);
    const year = fecha.getUTCFullYear();
    const month = fecha.getUTCMonth() + 1;
    const anioSeleccionado = parseInt(document.getElementById('seleccion-anio').value);

    if (anioSeleccionado === year) {
        const filas = document.querySelectorAll('#presupuesto-caja-body tr');
        filas.forEach(fila => {
            const celdas = fila.getElementsByTagName('td');
            if (parseInt(celdas[0].textContent) === month) {
                if (tipo === 'venta') {
                    const ventaActual = parseFloat(celdas[1].textContent);
                    celdas[1].textContent = (ventaActual + newAsset.monto).toFixed(2);
                } else if (tipo === 'compra') {
                    const compraActual = parseFloat(celdas[2].textContent);
                    celdas[2].textContent = (compraActual + newAsset.Total).toFixed(2);
                }
                // Actualizar flujo de efectivo neto, efectivo final, y efectivo restante
                const ventas = parseFloat(celdas[1].textContent);
                const compras = parseFloat(celdas[2].textContent);
                const gastosOperativos = parseFloat(celdas[3].textContent);
                const efectivoInicial = parseFloat(celdas[5].textContent);
                const flujoEfectivoNeto = ventas - (compras + gastosOperativos);
                celdas[4].textContent = flujoEfectivoNeto.toFixed(2);
                const efectivoFinal = efectivoInicial + flujoEfectivoNeto;
                celdas[6].textContent = efectivoFinal.toFixed(2);
                const efectivoRestante = efectivoFinal - 900; 
                celdas[7].textContent = efectivoRestante.toFixed(2);
            }
        });
    }
};

const fetchData = async function() {
    await fetchProductos();

    await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
    .then(response => response.json())
    .then(data => {
        ventasAnuales = data;
        let ventasMeses = [];
        let fechaAnterior;

        data.forEach(venta => {
            let flag = false;
            const fechaArray = new Date(venta["fecha"]);

            ventasMeses.forEach(item => {
                if (item.year == fechaArray.getUTCFullYear() && item.month == fechaArray.getUTCMonth() + 1) {
                    item.total += (venta["Abono (50%)"] + (venta["Fecha de cancelación"] <= '2023-12-31' ? venta["Cancelación"] : 0));
                    flag = true;
                }
            });

            if (fechaAnterior == undefined || flag == false || fechaAnterior.getUTCFullYear() != fechaArray.getUTCFullYear() || fechaAnterior.getUTCMonth() != fechaArray.getUTCMonth()) {
                fechaAnterior = fechaArray;
                let ventas = {};
                ventas["total"] = venta["Abono (50%)"] + (venta["Fecha de cancelación"] <= '2023-12-31' ? venta["Cancelación"] : 0);
                ventas["year"] = fechaArray.getUTCFullYear();
                ventas["month"] = fechaArray.getUTCMonth() + 1;
                ventasMeses.push(ventas);
            }
        });

        ventasXMesA = ventasMeses;
    })
    .catch(error => console.error('Error al obtener datos de ventas anuales:', error));

    await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(data => {
            comprasAnuales = data;
            let comprasMeses = [];
            let fechaAnterior;
            data.forEach(compra => {
                let flag = false;
                const fechaArray = new Date(compra["Fecha"]);
                comprasMeses.forEach(item => {
                    if (item.year == fechaArray.getUTCFullYear() && item.month == fechaArray.getUTCMonth() + 1) {
                        item.total += (compra["Total"] - compra["Cancelación"]);
                        flag = true;
                    }
                });
                if (fechaAnterior == undefined || flag == false || fechaAnterior.getUTCFullYear() != fechaArray.getUTCFullYear() || fechaAnterior.getUTCMonth() != fechaArray.getUTCMonth()) {
                    fechaAnterior = fechaArray;
                    let compras = {};
                    compras["total"] = (compra["Total"] - compra["Cancelación"]);
                    compras["year"] = fechaArray.getUTCFullYear();
                    compras["month"] = fechaArray.getUTCMonth() + 1;
                    comprasMeses.push(compras);
                }
            });
            comprasXMesA = comprasMeses;
        }).catch(error => console.error('Error al obtener datos de compras:', error));

    await fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/costos-operativos/costos-operativos.json')
        .then(response => response.json())
        .then(data => {
            for (let gasto in data) {
                gastosOperativos += data[gasto];
            }
        })
        .catch(error => console.error('Error:', error));

    await presupuestoCaja();
};

const presupuestoCaja = async function() {
    ventasXMesA.forEach(venta => {
        comprasXMesA.forEach(compra => {
            if (venta.year == compra.year && venta.month == compra.month) {
                const compraGasto = compra.total + gastosOperativos;
                let fEN = {};
                fEN["total"] = (venta.total - compraGasto);
                fEN["year"] = venta.year;
                fEN["month"] = venta.month;
                flujosEfectivoNetoXMesA.push(fEN);
            }
        });
    });

    flujosEfectivoNetoXMesA.forEach(efectivoN => {
        let fEI = {};
        let year = 0;
        let month = 0;
        year = efectivoN.year;
        month = efectivoN.month - 1;
        if (efectivoN.month == 1) {
            year = Number(efectivoN.year) - 1;
            month = 12;
        }
        const fEfectivoXMes = flujosEfectivoNetoXMesA.find((item) => (item.year == year && item.month == month)) || {"total": 0};
        const fInicialXMes = efectivoInicialXMesA.find((item) => (item.year == year && item.month == month)) || {"total": 0};
        fEI["total"] = (fEfectivoXMes.total + fInicialXMes.total);
        fEI["year"] = efectivoN.year;
        fEI["month"] = efectivoN.month;
        efectivoInicialXMesA.push(fEI);
    });

    flujosEfectivoNetoXMesA.forEach(efectivoN => {
        const fInicialXMes = efectivoInicialXMesA.find((item) => (item.year == efectivoN.year && item.month == efectivoN.month)) || {"total": 0};
        let fEF = {};
        fEF["total"] = (efectivoN.total + fInicialXMes.total);
        fEF["year"] = efectivoN.year;
        fEF["month"] = efectivoN.month;
        efectivoFinalXMesA.push(fEF);
    });

    efectivoFinalXMesA.forEach(efectivoF => {
        let eR = {};
        eR["total"] = (efectivoF.total - 900);
        eR["year"] = efectivoF.year;
        eR["month"] = efectivoF.month;
        efectivoRestante.push(eR);
    });
};

document.addEventListener('DOMContentLoaded', async function() {
    await fetchData();

    function mostrarDatos(anioSeleccionado) {
        const presupuestoCajaBody = document.getElementById('presupuesto-caja-body');
        presupuestoCajaBody.innerHTML = '';
        const encabezado = document.getElementById('tabla-encabezado');
        const titulo = document.getElementById('titulo-presupuesto');
        if (anioSeleccionado) {
            titulo.textContent = `Presupuesto de Caja ${anioSeleccionado}`;
            encabezado.innerHTML = `
                <tr>
                    <th>Mes</th>
                    <th>Ventas</th>
                    <th>Compras</th>
                    <th>Gastos Operativos</th>
                    <th>Flujo Efectivo Neto</th>
                    <th>Efectivo Inicial</th>
                    <th>Efectivo Final</th>
                    <th>Saldo minimo efectivo</th>
                    <th>Efectivo Restante</th>
                </tr>
            `;
            for (let month = 1; month <= 12; month++) {
                const venta = ventasXMesA.find(item => item.year == anioSeleccionado && item.month == month) || {};
                const compra = comprasXMesA.find(item => item.year == anioSeleccionado && item.month == month) || {};
                const efectivoInicial = efectivoInicialXMesA.find(item => item.year == anioSeleccionado && item.month == month) || {};
                const efectivoFinal = efectivoFinalXMesA.find(item => item.year == anioSeleccionado && item.month == month) || {};
                const restante = efectivoRestante.find(item => item.year == anioSeleccionado && item.month == month) || {};
                const flujoEfectivoNeto = venta.total - (compra.total + gastosOperativos);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${month}</td>
                    <td>${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
                    <td>${compra.total ? compra.total.toFixed(2) : '0.00'}</td>
                    <td>${gastosOperativos.toFixed(2)}</td>
                    <td>${flujoEfectivoNeto.toFixed(2)}</td>
                    <td>${efectivoInicial.total ? efectivoInicial.total.toFixed(2) : '0.00'}</td>
                    <td>${efectivoFinal.total ? efectivoFinal.total.toFixed(2) : '0.00'}</td>
                    <td>${'900'}</td>
                    <td>${restante.total ? restante.total.toFixed(2) : '0.00'}</td>
                `;
                presupuestoCajaBody.appendChild(row);
            }
        } else {
            titulo.textContent = 'Presupuesto de Caja';
            encabezado.innerHTML = '';
        }
    }

    const seleccionAnio = document.getElementById('seleccion-anio');
    if (seleccionAnio) {
        seleccionAnio.addEventListener('change', function() {
            const anioSeleccionado = parseInt(this.value);
            mostrarDatos(anioSeleccionado);
        });
    }

    // Mostrar y ocultar formularios
    const mostrarFormVenta = document.getElementById('mostrar-form-venta');
    if (mostrarFormVenta) {
        mostrarFormVenta.addEventListener('click', function() {
            const formContainer = document.getElementById('form-venta-container');
            if (formContainer) {
                formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    const mostrarFormCompra = document.getElementById('mostrar-form-compra');
    if (mostrarFormCompra) {
        mostrarFormCompra.addEventListener('click', function() {
            const formContainer = document.getElementById('form-compra-container');
            if (formContainer) {
                formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
});
