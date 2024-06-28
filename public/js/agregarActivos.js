document.addEventListener('DOMContentLoaded', function() {
    const formNuevoActivo = document.getElementById('form-nuevo-activo');
    
    formNuevoActivo.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const nombre = document.getElementById('nombre').value;
        const categoria = document.getElementById('categoria').value;
        const precioCompra = parseFloat(document.getElementById('precioCompra').value);
        const fechaAdquisicion = document.getElementById('fechaAdquisicion').value;

        if (!nombre || !categoria || isNaN(precioCompra) || !fechaAdquisicion) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        const nuevoActivo = {
            nombre: nombre,
            categoria: categoria,
            precioCompra: precioCompra,
            fechaAdquisicion: fechaAdquisicion
        };

        // Enviar el nuevo activo al servidor
        agregarActivo(nuevoActivo);

        // Limpiar el formulario después de agregar el activo
        formNuevoActivo.reset();
    });
});

function agregarActivo(nuevoActivo) {
    
}
