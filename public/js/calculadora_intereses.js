document.addEventListener('DOMContentLoaded', function() {
    const interestForm = document.getElementById('interest-form');
    interestForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const principal = parseFloat(document.getElementById('principal').value);
        const annualRate = parseFloat(document.getElementById('rate').value);
        const years = parseInt(document.getElementById('years').value);

        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = years * 12;

        const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow((1 + monthlyRate), -numberOfPayments));
        
        const pagoanual = monthlyPayment * 12;
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <h3>Resultados</h3>
            <p>Pago Mensual: ${monthlyPayment.toFixed(2)}</p>
            <p>Pago Anual: ${pagoanual.toFixed(2)}</p>
            <p>Total de Pagos: ${(monthlyPayment * numberOfPayments).toFixed(2)}</p>
            <p>Total de Intereses: ${((monthlyPayment * numberOfPayments) - principal).toFixed(2)}</p>
        `;

        generateAmortizationSchedule(principal, monthlyRate, numberOfPayments, monthlyPayment);
    });

    function generateAmortizationSchedule(principal, monthlyRate, numberOfPayments, monthlyPayment) {
        const amortizationDiv = document.getElementById('amortization-schedule');
        amortizationDiv.innerHTML = "<h3>Tabla de Amortización</h3>";

        const table = document.createElement('table');
        table.classList.add('table', 'table-bordered', 'table-striped'); 
        table.border = 1;
        const headerRow = table.insertRow();
        headerRow.insertCell().innerText = "Mes";
        headerRow.insertCell().innerText = "Pago Mensual";
        headerRow.insertCell().innerText = "Intereses";
        headerRow.insertCell().innerText = "Capital";
        headerRow.insertCell().innerText = "Saldo";

        let balance = principal;

        for (let i = 1; i <= numberOfPayments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            const row = table.insertRow();
            row.insertCell().innerText = i;
            row.insertCell().innerText = monthlyPayment.toFixed(2);
            row.insertCell().innerText = interestPayment.toFixed(2);
            row.insertCell().innerText = principalPayment.toFixed(2);
            row.insertCell().innerText = balance.toFixed(2);
        }

        amortizationDiv.appendChild(table);
        document.getElementById('export-proforma').style.display = 'block';
    }

    document.getElementById('export-proforma').addEventListener('click', function() {
        alert('Los pagos se han incluido en los estados financieros proforma.');
    });
});
