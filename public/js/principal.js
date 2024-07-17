 // Boton responsive para dispositivos móviles
 const menuBtn = document.getElementById('menu-btn');
 const mobileMenu = document.getElementById('mobile-menu');

 menuBtn.addEventListener('click', () => {
   mobileMenu.classList.toggle('hidden');
 });



 // Animación para los subtitulos
const subtitles = [
    'Calculadora de <span class="text-yellow-600 font-semibold">Administración Financiera</span> para tu negocio',
    '<span class="text-yellow-600">Optimiza</span> tus finanzas con nuestra calculadora',
    '<span class="text-yellow-600 font-semibold">Descubre</span> cómo mejorar tu flujo de efectivo',
    '<span class="text-yellow-600 font-semibold">Administra</span> tus recursos de manera eficiente'
  ];
  
  // Función para cambiar el subtítulo 
  function changeSubtitle() {
    const subtitleElement = document.getElementById('subtitle');
    let index = 0;
    setInterval(() => {
      subtitleElement.innerHTML = subtitles[index];
      index = (index + 1) % subtitles.length;
    }, 4000); // Cambia cada 4 segundos 
  }
  changeSubtitle();

