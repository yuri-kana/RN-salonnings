document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    try {
        // Fetch user data
        const userResponse = await fetch('/customers/me', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        const user = await userResponse.json();
        if (userResponse.ok) {
            document.getElementById('username-display').innerText = user.username;
            document.getElementById('name').value = user.username;
            document.getElementById('email').value = user.email;

            // Fetch appointments after user data is loaded
            await fetchAppointments(user.username, token);
            // Fetch notifications for the user
            await fetchNotifications(token);
        } else {
            alert(user.error);
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});

function togglePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
}

async function saveInfo() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/customers/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Information updated successfully');
            document.getElementById('username-display').innerText = name;
            togglePopup();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error saving user info:', error);
    }
}

// Fetch Appointments
async function fetchAppointments(username, token) {
    try {
        const response = await fetch('/appointments', {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');
        const appointments = await response.json();

        // Filter appointments for the current user
        const userAppointments = appointments.filter(appointment => appointment.customerName === username);
        showAppointments(userAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments. Please try again.');
    }
}

function showAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList').querySelector('tbody');
    appointmentsList.innerHTML = '';

    if (appointments.length) {
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.customerName}</td>
                <td>${new Date(appointment.date).toLocaleDateString()}</td>
                <td>${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${appointment.services.join(', ')}</td>
                <td>${appointment.status === 'pending' ? 'Pending' : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</td>
            `;
            appointmentsList.appendChild(row);
        });
    } else {
        appointmentsList.innerHTML = '<tr><td colspan="5">No appointments available.</td></tr>';
    }
}

// Update the fetchNotifications function to display messages based on approval/decline
async function fetchNotifications(token) {
    try {
        const response = await fetch('/notifications', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        const notifications = await response.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

// Display Notifications
function displayNotifications(notifications) {
    const notificationSection = document.querySelector('.notification');
    notificationSection.innerHTML = '<h2>Your Notifications</h2>';
    const notificationList = document.createElement('ul');

    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.innerText = notification.message;
        notificationList.appendChild(listItem);
    });

    notificationSection.appendChild(notificationList);
}

// Appointment Chart
const ctxAppointments = document.getElementById('appointmentsChart').getContext('2d');
const appointmentsChart = new Chart(ctxAppointments, {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'Appointments',
            data: [12, 19, 3, 5, 2, 3, 7],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Ratings Chart
const ctxRatings = document.getElementById('ratingsChart').getContext('2d');
const ratingsChart = new Chart(ctxRatings, {
    type: 'radar',
    data: {
        labels: ['Service Quality', 'Punctuality', 'Cleanliness', 'Staff Friendliness', 'Value for Money'],
        datasets: [{
            label: 'Ratings',
            data: [4, 5, 3, 4, 4],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            r: {
                beginAtZero: true
            }
        }
    }
});