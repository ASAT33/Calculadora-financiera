document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM completamente cargado");

    const header = document.querySelector("header");
    if (header) {
        console.log("Header encontrado:", header);

        header.innerHTML = `
            <div class="container">
                <h1 class="nav-item"><a class="nav-link texto" href="/principal.html">Calculadora Financiera</a></h1>
                <nav>
                    <ul class="nav">
                        <li class="nav-item"><a class="nav-link" href="/calculadora_intereses.html">Cálculo de Intereses</a></li>
                        <li class="nav-item"><a class="nav-link" href="/proforma_balance.html">Proforma de Balance</a></li>
                        <li class="nav-item"><a class="nav-link" href="">Razones Financieras</a></li>
                        <li class="nav-item"><a class="nav-link" href="/presupuesto_caja.html">Presupuesto de Caja</a></li>
                        <li class="nav-item"><a class="nav-link" href="/activos.html">Activos Fijos</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Punto de Equilibrio</a></li>
                    </ul>
                </nav>
            </div>
        `;

        const link = header.querySelector(".texto");
        if (link) {
            console.log("Enlace encontrado:", link);
            link.style.color = "white";
        } else {
            console.log("No se encontró el enlace con clase 'texto'");
        }
    } else {
        console.log("No se encontró el elemento 'header'");
    }
});
