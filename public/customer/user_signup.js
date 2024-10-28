document.getElementById('toggleSignupPassword').addEventListener('click', function() {
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

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/customers/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email }),
        });

        const result = await response.json();
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');

        if (response.ok) {
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);

            successMessage.style.display = 'block';
            successMessage.querySelector('#displayUsername').textContent = username;
            document.getElementById('signupForm').reset();
            setTimeout(() => {
                window.location.href = 'user_login.html';
            }, 2000);
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = result.error || 'Signup failed. Please try again.';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
    }
});