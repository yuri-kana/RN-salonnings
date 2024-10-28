document.getElementById('togglePasswordVisibility').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    const icon = this;
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/admins/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            window.location.href = 'dashboard.html';
        } else {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = result.error || 'Login failed.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});