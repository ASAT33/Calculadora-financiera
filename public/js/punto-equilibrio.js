document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const normalBtn = document.getElementById('normal-btn');
    const multipleBtn = document.getElementById('multiple-btn');
    const servicesBtn = document.getElementById('services-btn');
    const normalForm = document.getElementById('normal-form');
    const multipleForm = document.getElementById('multiple-form');
    const servicesForm = document.getElementById('services-form');
  
    // Show and Hide Forms
    normalBtn.addEventListener('click', () => {
      normalForm.classList.remove('hidden');
      multipleForm.classList.add('hidden');
      servicesForm.classList.add('hidden');
    });
  
    multipleBtn.addEventListener('click', () => {
      normalForm.classList.add('hidden');
      multipleForm.classList.remove('hidden');
      servicesForm.classList.add('hidden');
    });
  
    servicesBtn.addEventListener('click', () => {
      normalForm.classList.add('hidden');
      multipleForm.classList.add('hidden');
      servicesForm.classList.remove('hidden');
    });
  
    // Calculations
    document.getElementById('calculate-normal').addEventListener('click', () => {
      const fixedCosts = parseFloat(document.getElementById('fixed-costs-normal').value);
      const pricePerUnit = parseFloat(document.getElementById('price-per-unit-normal').value);
      const variableCosts = parseFloat(document.getElementById('variable-costs-normal').value);
  
      if (isNaN(fixedCosts) || isNaN(pricePerUnit) || isNaN(variableCosts) || pricePerUnit <= variableCosts) {
        alert('Por favor, ingrese valores válidos. Asegúrese de que el precio por unidad sea mayor que los costos variables por unidad.');
        return;
      }
  
      const breakEvenUnits = fixedCosts / (pricePerUnit - variableCosts);
      const breakEvenSales = fixedCosts / (1 - (variableCosts / pricePerUnit));
  
      document.getElementById('break-even-units-normal').innerText = `Punto de Equilibrio en Unidades: ${breakEvenUnits.toFixed(2)} unidades`;
      document.getElementById('break-even-sales-normal').innerText = `Punto de Equilibrio en Ventas: $${breakEvenSales.toFixed(2)}`;
      document.getElementById('results-normal').classList.remove('hidden');
    });
  
    document.getElementById('calculate-multiple').addEventListener('click', () => {
      const fixedCosts = parseFloat(document.getElementById('fixed-costs-multiple').value);
      const pricePerUnit = parseFloat(document.getElementById('price-per-unit-multiple').value);
      const variableCosts = parseFloat(document.getElementById('variable-costs-multiple').value);
  
      if (isNaN(fixedCosts) || isNaN(pricePerUnit) || isNaN(variableCosts) || pricePerUnit <= variableCosts) {
        alert('Por favor, ingrese valores válidos. Asegúrese de que el precio promedio por unidad sea mayor que los costos variables promedio por unidad.');
        return;
      }
  
      const breakEvenUnits = fixedCosts / (pricePerUnit - variableCosts);
      const breakEvenSales = fixedCosts / (1 - (variableCosts / pricePerUnit));
  
      document.getElementById('break-even-units-multiple').innerText = `Punto de Equilibrio en Unidades: ${breakEvenUnits.toFixed(2)} unidades`;
      document.getElementById('break-even-sales-multiple').innerText = `Punto de Equilibrio en Ventas: $${breakEvenSales.toFixed(2)}`;
      document.getElementById('results-multiple').classList.remove('hidden');
    });
  
    document.getElementById('calculate-services').addEventListener('click', () => {
      const fixedCosts = parseFloat(document.getElementById('fixed-costs-services').value);
      const pricePerHour = parseFloat(document.getElementById('price-per-hour').value);
      const variableCosts = parseFloat(document.getElementById('variable-costs-services').value);
  
      if (isNaN(fixedCosts) || isNaN(pricePerHour) || isNaN(variableCosts) || pricePerHour <= variableCosts) {
        alert('Por favor, ingrese valores válidos. Asegúrese de que el precio por hora sea mayor que los costos variables por hora.');
        return;
      }
  
      const breakEvenHours = fixedCosts / (pricePerHour - variableCosts);
      const breakEvenSales = fixedCosts / (1 - (variableCosts / pricePerHour));
  
      document.getElementById('break-even-hours-services').innerText = `Punto de Equilibrio en Horas: ${breakEvenHours.toFixed(2)} horas`;
      document.getElementById('break-even-sales-services').innerText = `Punto de Equilibrio en Ventas: $${breakEvenSales.toFixed(2)}`;
      document.getElementById('results-services').classList.remove('hidden');
    });

    // Menú de móvil
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
  
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  });
  