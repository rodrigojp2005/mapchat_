import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;


Alpine.start();

// Listener para esconder o timer na página de criação de quiz
document.addEventListener('DOMContentLoaded', function() {
	if (window.location.pathname.includes('/quiz/create')) {
		const timerContainer = document.getElementById('timerContainer');
		const timerContainerMobile = document.getElementById('timerContainerMobile');
		if (timerContainer) timerContainer.style.display = 'none';
		if (timerContainerMobile) timerContainerMobile.style.display = 'none';
	}
});
