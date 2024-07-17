const mostrarReportes = function() {
    const reportesBody = document.getElementById('reportes-body');
    const tipoReporte = document.getElementById('tipo-reporte').value;
    const mesReporte = parseInt(document.getElementById('mes-reporte').value);
    const anioReporte = parseInt(document.getElementById('anio-reporte').value);
    const reporteTitulo = document.getElementById('reporte-titulo');
    const reporteEncabezado = document.getElementById('reporte-encabezado');
    reportesBody.innerHTML = '';
    reporteEncabezado.innerHTML = '';

    if (tipoReporte === 'ventas') {
        reporteTitulo.textContent = `Reporte de Ventas ${anioReporte}`;
        reporteEncabezado.innerHTML = `
            <tr>
                <th>Fecha</th>
                <th>Transacción</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Monto</th>
                <th>Se otorga crédito</th>
                <th>Abono</th>
                <th>Fecha de cancelación</th>
                <th>Cancelación</th>
            </tr>
        `;
        ventasAnuales.forEach(venta => {
            const fecha = new Date(venta.fecha);
            const mes = fecha.getUTCMonth() + 1;
            const anio = fecha.getUTCFullYear();
            if (mes === mesReporte && anio === anioReporte) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${venta.fecha}</td>
                    <td>${venta.transacción}</td>
                    <td>${venta.Producto}</td>
                    <td>${venta.Cantidad}</td>
                    <td>${venta.Precio.toFixed(2)}</td>
                    <td>${venta.monto.toFixed(2)}</td>
                    <td>${venta["Se otorga crédito"]}</td>
                    <td>${venta["Abono (50%)"].toFixed(2)}</td>
                    <td>${venta["Fecha de cancelación"]}</td>
                    <td>${venta.Cancelación.toFixed(2)}</td>
                `;
                reportesBody.appendChild(row);
            }
        });
    } else if (tipoReporte === 'compras') {
        reporteTitulo.textContent = `Reporte de Compras ${anioReporte}`;
        reporteEncabezado.innerHTML = `
            <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Costo unitario</th>
                <th>Total</th>
                <th>Abono</th>
                <th>Fecha de cancelación</th>
                <th>Cancelación</th>
            </tr>
        `;
        comprasAnuales.forEach(compra => {
            const fecha = new Date(compra.Fecha);
            const mes = fecha.getUTCMonth() + 1;
            const anio = fecha.getUTCFullYear();
            if (mes === mesReporte && anio === anioReporte) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${compra.Fecha}</td>
                    <td>${compra.Producto}</td>
                    <td>${compra.Cantidad}</td>
                    <td>${parseFloat(compra["Costo unitario"]).toFixed(2)}</td>
                    <td>${parseFloat(compra.Total).toFixed(2)}</td>
                    <td>${parseFloat(compra.Abono).toFixed(2)}</td>
                    <td>${compra["Fecha de cancelación"]}</td>
                    <td>${parseFloat(compra.Cancelación).toFixed(2)}</td>
                `;
                reportesBody.appendChild(row);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    await fetchData(); // Asegurarse de cargar los datos antes de generar reportes
});
