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

    // Calcular monto al cambiar cantidad y precio
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
        fecha.setDate(fecha.getDate() + 15); //15 días
        fechaCancelacion = fecha.toISOString().split('T')[0]; 
        fechaCancelacionInput.value = fechaCancelacion; 
    } else {
        cancelacion = monto;
        fechaCancelacionInput.value = ''; 
    }

    abonoInput.value = abono.toFixed(2);
    cancelacionInput.value = cancelacion.toFixed(2);
}

const registroForm = document.getElementById('registroForm');

registroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registroForm);
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'Fecha de cancelación' && !value) {
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

    // Obtener la longitud del array de ventas
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
