const todayCompra = new Date();
const formattedDateCompra = todayCompra.toISOString().split('T')[0];
document.getElementById('fecha-compra').value = formattedDateCompra;

fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/ventas_anuales/productos.json')
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

        // Llamar a la función para actualizar el costo al seleccionar un producto
        productoCompraSelect.addEventListener('change', actualizarCosto);
        actualizarCosto(); // Llamar al inicio para establecer el costo inicial
    })
    .catch(error => console.error('Error al cargar productos:', error));

// Función para actualizar el costo y el total al seleccionar un producto
function actualizarCosto() {
    const productoCompraSelect = document.getElementById('producto-compra');
    const selectedOption = productoCompraSelect.options[productoCompraSelect.selectedIndex];
    const costoUnitario = parseFloat(selectedOption.dataset.costoUnitario);
    document.getElementById('costo-unitario').value = costoUnitario.toFixed(2);

    calcularTotal();
}

// calcula total al cambiar cantidad y costo
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

    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras.json')
        .then(response => response.json())
        .then(comprasData => {
            const comprasArray = Object.values(comprasData || {});
            const comprasLength = comprasArray.length;
            const nuevaCompra = comprasLength + 1;
            fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/pasivos/compras/${nuevaCompra}.json`, {
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

