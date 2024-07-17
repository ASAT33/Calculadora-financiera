const today = new Date();
const formattedDate = today.toISOString().split('T')[0];
document.getElementById('fecha').value = formattedDate;

fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos.json')
    .then(response => response.json())
    .then(data => {
        const productoSelect = document.getElementById('producto');
        Object.values(data).forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.Código.toString();
            option.textContent = producto.Descripción; //solo el nombre
            option.dataset.precioVenta = parseFloat(producto['Precio de venta'].replace('$', '')); 
            productoSelect.appendChild(option);
        });

        //llamado para el cambio
        productoSelect.addEventListener('change', actualizarPrecio);
        actualizarPrecio(); 
    })
    .catch(error => console.error('Error al cargar productos:', error));

//actualizar el precio y el monto al seleccionar un producto
function actualizarPrecio() {
    const productoSelect = document.getElementById('producto');
    const selectedOption = productoSelect.options[productoSelect.selectedIndex];
    const precioVenta = parseFloat(selectedOption.dataset.precioVenta);
    document.getElementById('precio').value = precioVenta.toFixed(2);

    calcularMonto();
}

// monto al cambiar cantidad y precio
const cantidadInput = document.getElementById('cantidad');
const precioInput = document.getElementById('precio');
const montoInput = document.getElementById('monto');

cantidadInput.addEventListener('input', calcularMonto);
precioInput.addEventListener('input', calcularMonto);

function calcularMonto() {
    const cantidad = cantidadInput.valueAsNumber || 0;
    const precio = precioInput.valueAsNumber || 0;
    const monto = cantidad * precio;
    montoInput.value = monto.toFixed(2);
    calcularCancelacion(); 
}


const creditoSelect = document.getElementById('credito');
const abonoInput = document.getElementById('abono');
const fechaCancelacionInput = document.getElementById('fecha_cancelacion');
const cancelacionInput = document.getElementById('cancelacion');

creditoSelect.addEventListener('change', () => {
    calcularCancelacion();
    abonoInput.value = ''; 
});

fechaCancelacionInput.addEventListener('input', calcularCancelacion);

function calcularCancelacion() {
    const seOtorgaCredito = creditoSelect.value === 'si';
    const monto = parseFloat(montoInput.value) || 0;

    let abono = 0;
    let cancelacion = 0;
    let fechaCancelacion = '';

    if (seOtorgaCredito) {
        abono = monto * 0.5;
        cancelacion = 0;
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 15); // 15 días
        fechaCancelacion = fecha.toISOString().split('T')[0];
        fechaCancelacionInput.value = fechaCancelacion;
    } else {
        cancelacion = monto;
        fechaCancelacionInput.value = ''; // Vaciar el campo si no se otorga crédito
    }

    abonoInput.value = abono.toFixed(2);
    cancelacionInput.value = cancelacion.toFixed(2);
}


const registroForm = document.getElementById('registroForm');

registroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!fechaCancelacionInput.value) {
        const today = new Date();
        fechaCancelacionInput.value = today.toISOString().split('T')[0];
    }

    const formData = new FormData(registroForm);
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'fecha_cancelacion' && !value) {
            data['Fecha de cancelación'] = null; 
        } else if (key === 'producto') {
            data['Producto'] = parseInt(value); 
        } else if (key === 'abono') {
            data['Abono (50%)'] = parseFloat(value); 
        } else if (key === 'cancelacion') {
            data['Cancelación'] = parseFloat(value); 
        } else if (key === 'cantidad') {
            data['Cantidad'] = parseFloat(value); 
        } else if (key === 'precio') {
            data['Precio'] = parseFloat(value);
        } else if (key === 'monto') {
            data['monto'] = parseFloat(value); 
        } else if (key === 'credito') {
            data['Se otorga crédito'] = value; 
        } else if (key === 'fecha') {
            data['fecha'] = value; 
        } else {
            data[key] = value; 
        }
    });

    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(ventasData => {
            const ventasArray = Object.values(ventasData);
            const ventasLength = ventasArray.length;
            const nuevaTransaccion = ventasLength;
            data['transacción'] = nuevaTransaccion.toString();
            fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales/${nuevaTransaccion}.json`, {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Venta registrada correctamente');
                    registroForm.reset();
                    document.getElementById('fecha').value = formattedDate;
                    actualizarPrecio();
                    cargarCreditosAnuales(); 
                } else {
                    throw new Error('Error al registrar la venta');
                }
            })
            .catch(error => {
                alert('Error al registrar la venta');
                console.error(error);
            });
        })
        .catch(error => console.error('Error al obtener la longitud de las ventas:', error));
});

function cargarCreditosAnuales() {
    const yearActual = new Date().getFullYear(); 

    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales.json')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#tabla-creditos tbody');
            tbody.innerHTML = ''; 

            Object.values(data).forEach(venta => {
                // verificar si se otorgó crédito y si la fecha de cancelación está definida
                if (venta['Se otorga crédito'] === 'si' && venta['Fecha de cancelación']) {
                    const fechaCancelacion = new Date(venta['Fecha de cancelación']);
                    const yearVenta = fechaCancelacion.getFullYear();
                    
                    // filtrar solo las ventas del año actual
                    if (yearVenta === yearActual) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${venta.fecha}</td>
                            <td>${venta.Producto}</td>
                            <td>${venta.Cantidad}</td>
                            <td>${venta.Precio}</td>
                            <td>${venta.monto}</td>
                            <td>${venta['Se otorga crédito']}</td>
                            <td>${venta['Abono (50%)']}</td>
                            <td>${venta['Fecha de cancelación']}</td>
                            <td>${venta.Cancelación}</td>
                            <td><button class="btn btn-secondary btn-cancelar" data-venta-id="${venta.transacción}">Cancelar</button></td>
                        `;
                        tbody.appendChild(row);
                    }
                }
            });

            const botonesCancelar = document.querySelectorAll('.btn-cancelar');
            botonesCancelar.forEach(boton => {
                boton.addEventListener('click', () => {
                    const ventaId = boton.getAttribute('data-venta-id');
                    cancelarPagarMitad(ventaId);
                });
            });
        })
        .catch(error => console.error('Error al cargar créditos:', error));
}


function cancelarPagarMitad(ventaId) {
    fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales/${ventaId}.json`)
        .then(response => response.json())
        .then(venta => {
            const montoTotal = venta.monto;
            const abono = venta['Abono (50%)'] || 0;
            if (abono === 0) {
                alert('El abono inicial no ha sido registrado.');
                return;
            }
            const cancelacion = montoTotal - abono;
            fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/ventas_anuales/${ventaId}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ Cancelación: cancelacion }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            .then(response => {
                if (response.ok) {
                    alert('Cancelación actualizada correctamente.');
                    cargarCreditosAnuales();
                } else {
                    throw new Error('Error al actualizar la cancelación.');
                }
            })
            .catch(error => {
                alert('Error al actualizar la cancelación.');
                console.error(error);
            });
        })
        .catch(error => console.error('Error al obtener la venta:', error));
}

// carga créditos al cargar la página
document.addEventListener('DOMContentLoaded', cargarCreditosAnuales)

const agregarProductoForm = document.getElementById('agregarProductoForm');

agregarProductoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const codigo = agregarProductoForm.querySelector('#codigo').value;
    const descripcion = agregarProductoForm.querySelector('#descripcion').value;
    const costo = `$${agregarProductoForm.querySelector('#costo').value}`;
    const precio_venta = `$${agregarProductoForm.querySelector('#precio_venta').value}`;

    const nuevoProducto = {
        Código: codigo,
        Descripción: descripcion,
        'Costo unitario': costo,
        'Precio de venta': precio_venta
    };

    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos.json')
        .then(response => response.json())
        .then(productosData => {
            const productosArray = Object.values(productosData);
            const longitud = productosArray.length;
            const nuevoId = longitud;

            fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos/${nuevoId}.json`, {
                method: 'PATCH',
                body: JSON.stringify(nuevoProducto),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Producto agregado correctamente');
                    agregarProductoForm.reset();
                    cargarProductos();
                } else {
                    throw new Error('Error al agregar el producto');
                }
            })
            .catch(error => {
                alert('Error al agregar el producto');
                console.error(error);
            });
        })
        .catch(error => console.error('Error al obtener la longitud de productos:', error));
});

function cargarProductos() {
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos.json')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#tabla-productos tbody');
            tbody.innerHTML = ''; // Limpiar la tabla

            Object.entries(data).forEach(([key, producto]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.Código}</td>
                    <td>${producto.Descripción}</td>
                    <td>${producto['Costo unitario']}</td>
                    <td>${producto['Precio de venta']}</td>
                    <td>
                        <button class="btn btn-danger btn-sm btn-borrar" data-producto-id="${key}">Borrar</button>
                    </td>
                `;
                tbody.appendChild(row);

                // Agregar evento de click al botón de borrar
                const btnBorrar = row.querySelector('.btn-borrar');
                btnBorrar.addEventListener('click', () => {
                    const productoId = btnBorrar.getAttribute('data-producto-id');
                    eliminarProducto(productoId);
                });
            });
        })
        .catch(error => console.error('Error al cargar productos:', error));
}

// Función para eliminar un producto por su ID
function eliminarProducto(productoId) {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
        return;
    }

    fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos/${productoId}.json`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            alert('Producto eliminado correctamente');
            cargarProductos(); 
        } else {
            throw new Error('Error al eliminar el producto');
        }
    })
    .catch(error => console.error('Error al eliminar el producto:', error));
}
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCreditosAnuales();
});
