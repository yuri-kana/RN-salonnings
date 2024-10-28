document.querySelectorAll('.package-btn').forEach(button => {
    button.addEventListener('click', () => {
        const packageName = button.getAttribute('data-package');
        window.location.href = `appointment.html?package=${packageName}`;
    });
});