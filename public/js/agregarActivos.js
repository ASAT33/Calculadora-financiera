document.getElementById('form-nuevo-activo').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const precioCompra = parseFloat(document.getElementById('precioCompra').value);
    const fechaAdquisicion = document.getElementById('fechaAdquisicion').value;

    const newAsset = {
        nombre: nombre,
        categoria: categoria,
        precioCompra: precioCompra,
        fechaAdquisicion: fechaAdquisicion
    };

    // se saca el largo de cuantos activos van
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
      .then(response => response.json())
      .then(data => {
        const nextIndex = data ? Object.keys(data).length : 0;

        const updates = {};
        updates[nextIndex] = newAsset;

        // patch
        fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json', {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log("Nuevo activo agregado exitosamente.");
                document.getElementById('form-nuevo-activo').reset();
                cargarActivos();
            } else {
                console.error("Error al agregar el nuevo activo:", response.statusText);
            }
        })
        .catch(error => {
            console.error("Error al agregar el nuevo activo:", error);
        });
    })
    .catch(error => {
        console.error("Error al obtener datos:", error);
    });
});

//listar los activos
function cargarActivos() {
    fetch('https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos.json')
        .then(response => response.json())
        .then(data => {
            mostrarActivos(data); // Mostrar los activos en la tabla
        })
        .catch(error => {
            console.error("Error al cargar los activos:", error);
        });
}

// Función para mostrar los activos en una tabla
function mostrarActivos(data) {
    const tablaActivosDiv = document.getElementById('tabla-activos');
    tablaActivosDiv.innerHTML = ''; // Limpiar la tabla actual

    if (data) {
        //tabla
        const table = document.createElement('table');
        table.classList.add('table', 'table-bordered');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio de Compra</th>
                <th>Fecha de Adquisición</th>
                <th>Eliminar</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        Object.keys(data).forEach(key => {
            const activo = data[key];
            if (activo) { // verifica si el activo existe 
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${activo.nombre}</td>
                    <td>${activo.categoria}</td>
                    <td>${activo.precioCompra}</td>
                    <td>${activo.fechaAdquisicion}</td>
                    <td><button class="btn btn-danger btn-sm btn-eliminar" data-key="${key}">Eliminar</button></td>
                `;
                tbody.appendChild(row);
            }
        });

        table.appendChild(tbody);
        tablaActivosDiv.appendChild(table);

        tablaActivosDiv.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                eliminarActivo(key);
            });
        });
    } else {
        tablaActivosDiv.innerHTML = '<p>No hay activos registrados.</p>';
    }
}

function eliminarActivo(key) {
    if (!confirm('¿Estás seguro de querer eliminar este activo?')) {
        return;
    }

    fetch(`https://admfinan-52fbd-default-rtdb.firebaseio.com/activos/activosFijos/${key}.json`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log("Activo eliminado correctamente.");
            cargarActivos(); 
        } else {
            console.error("Error al eliminar el activo:", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error al eliminar el activo:", error);
    });
}


document.addEventListener('DOMContentLoaded', cargarActivos);
