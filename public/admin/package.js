document.querySelectorAll('.package-btn').forEach(button => {
    button.addEventListener('click', () => {
        const packageName = button.getAttribute('data-package');
        // Redirect to appointment page with the package name in query parameters
        window.location.href = `appointment.html?package=${packageName}`;
    });
});