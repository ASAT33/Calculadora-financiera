
const todayCompra = new Date();
const formattedDateCompra = todayCompra.toISOString().split('T')[0];
document.getElementById('fecha-compra').value = formattedDateCompra;

fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/ventas_anuales/productos.json')
    .then(response => response.json())
    .then(data => {
        const productoCompraSelect = document.getElementById('producto-compra');
        data.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.Código.toString(); 
            option.textContent = producto.Descripción;
            option.dataset.costoUnitario = parseFloat(producto['Costo unitario'].replace('$', '')); 
            productoCompraSelect.appendChild(option);
        });

        productoCompraSelect.addEventListener('change', actualizarCosto);
        actualizarCosto();
    })
    .catch(error => console.error('Error al cargar productos:', error));

function actualizarCosto() {
    const productoCompraSelect = document.getElementById('producto-compra');
    const selectedOption = productoCompraSelect.options[productoCompraSelect.selectedIndex];
    const costoUnitario = parseFloat(selectedOption.dataset.costoUnitario);
    document.getElementById('costo-unitario').value = costoUnitario.toFixed(2);

    calcularTotal();
}

const cantidadCompraInput = document.getElementById('cantidad-compra');
const costoUnitarioInput = document.getElementById('costo-unitario');
const totalInput = document.getElementById('total');

cantidadCompraInput.addEventListener('input', calcularTotal);
costoUnitarioInput.addEventListener('input', calcularTotal);

function calcularTotal() {
    const cantidad = cantidadCompraInput.valueAsNumber || 0;
    const costoUnitario = costoUnitarioInput.valueAsNumber || 0;
    const total = cantidad * costoUnitario;
    totalInput.value = total.toFixed(2);
    calcularCancelacionCompra(); 
}
const abonoCompraInput = document.getElementById('abono-compra');
const fechaCancelacionCompraInput = document.getElementById('fecha-cancelacion-compra');
const cancelacionCompraInput = document.getElementById('cancelacion-compra');

fechaCancelacionCompraInput.addEventListener('input', calcularCancelacionCompra);

function calcularCancelacionCompra() {
    const total = parseFloat(totalInput.value) || 0;
    let abono = 0;
    let cancelacion = 0;
    let fechaCancelacion = '';

    if (total > 0) {
        abono = total * 0.5;
        cancelacion = 0;
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 15); 
        fechaCancelacion = fecha.toISOString().split('T')[0]; 
        fechaCancelacionCompraInput.value = fechaCancelacion;
    } else {
        cancelacion = total;
        fechaCancelacionCompraInput.value = ''; 
    }

    abonoCompraInput.value = abono.toFixed(2);
    cancelacionCompraInput.value = cancelacion.toFixed(2);
}


const compraForm = document.getElementById('compraForm');

compraForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(compraForm);
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'fecha-cancelacion-compra' && !value) {
            data['Fecha de cancelación'] = null; 
        } else if (key === 'producto-compra') {
            data['Producto'] = parseInt(value); 
        } else if (key === 'abono-compra') {
            data['Abono'] = parseFloat(value); 
        } else if (key === 'cancelacion-compra') {
            data['Cancelación'] = parseFloat(value); 
        } else if (key === 'cantidad-compra') {
            data['Cantidad'] = parseFloat(value); 
        } else if (key === 'costo-unitario') {
            data['Costo unitario'] = parseFloat(value); 
        } else if (key === 'total') {
            data['Total'] = parseFloat(value); 
        } else if (key === 'fecha-compra') {
            data['Fecha'] = value; 
        } else {
            data[key] = value; 
        }
    });

    fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            const comprasArray = Object.values(comprasData || {});
            const comprasLength = comprasArray.length;
            const nuevaCompra = comprasLength;
            fetch(`https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras/${nuevaCompra}.json`, {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Compra registrada correctamente');
                    compraForm.reset();
                    document.getElementById('fecha-compra').value = formattedDateCompra;
                    actualizarCosto();
                    cargarCompras();
                } else {
                    throw new Error('Error al registrar la compra');
                }
            })
            .catch(error => {
                alert('Error al registrar la compra');
                console.error(error);
            });
        })
        .catch(error => console.error('Error al obtener la longitud de las compras:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    const comprasTableBody = document.getElementById('comprasTableBody');

    function crearFilaCompra(compra) {
        const row = document.createElement('tr');

        const fechaCell = document.createElement('td');
        fechaCell.textContent = compra['Fecha'];
        row.appendChild(fechaCell);

        const productoCell = document.createElement('td');
        productoCell.textContent = compra['Producto'];
        row.appendChild(productoCell);

        const cantidadCell = document.createElement('td');
        cantidadCell.textContent = compra['Cantidad'];
        row.appendChild(cantidadCell);

        const costoUnitarioCell = document.createElement('td');
        costoUnitarioCell.textContent = compra['Costo unitario'];
        row.appendChild(costoUnitarioCell);

        const totalCell = document.createElement('td');
        totalCell.textContent = compra['Total'];
        row.appendChild(totalCell);

        const abonoCell = document.createElement('td');
        abonoCell.textContent = compra['Abono'];
        row.appendChild(abonoCell);

        const fechaCancelacionCell = document.createElement('td');
        fechaCancelacionCell.textContent = compra['Fecha de cancelación'];
        row.appendChild(fechaCancelacionCell);

        const cancelacionCell = document.createElement('td');
        cancelacionCell.textContent = compra['Cancelación'];
        row.appendChild(cancelacionCell);

        const cancelarButtonCell = document.createElement('td');
        const cancelarButton = document.createElement('button');
        cancelarButton.textContent = 'Cancelar';
        cancelarButton.classList.add('btn', 'btn-danger', 'btn-sm');
        cancelarButton.addEventListener('click', function() {
            cancelarCompra(compra);
        });
        cancelarButtonCell.appendChild(cancelarButton);
        row.appendChild(cancelarButtonCell);

        comprasTableBody.appendChild(row);
    }

    function cargarCompras() {
        fetch('https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras.json')
            .then(response => response.json())
            .then(comprasData => {
                comprasTableBody.innerHTML = ''; 

                Object.entries(comprasData).forEach(([key, compra]) => {
                    if (compra.Fecha && compra.Fecha.includes('2024')) {
                        compra.id = key; 
                        crearFilaCompra(compra);
                    }
                });
            })
            .catch(error => console.error('Error al cargar las compras del 2024:', error));
    }

    function cancelarCompra(compra) {
        const compraId = compra.id; 

        const cancelacion = parseFloat(compra['Total']);
        fetch(`https://admfinan-5fbd1-default-rtdb.firebaseio.com/pasivos/compras/${compraId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ Cancelación: cancelacion }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Compra cancelada correctamente');
                cargarCompras();
            } else {
                throw new Error('Error al cancelar la compra');
            }
        })
        .catch(error => {
            alert('Error al cancelar la compra');
            console.error(error);
        });
    }
    cargarCompras();
});
