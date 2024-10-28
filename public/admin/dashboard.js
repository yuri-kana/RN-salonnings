document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/admins/me', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        const user = await response.json();
        if (response.ok) {
            document.getElementById('username-display').innerText = user.username;
            document.getElementById('name').value = user.username;
            document.getElementById('email').value = user.email;
        } else {
            alert(user.error);
            window.location.href = 'index.html';
        }

        await fetchPendingAppointments(); // Fetch pending appointments on load
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
        const response = await fetch('/admins/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ username: name, email, password }), // Changed "name" to "username"
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

// Chart initialization remains the same
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

// Fetch Pending Appointments
async function fetchPendingAppointments() {
    try {
        const response = await fetch('/appointments?status=pending');
        const appointments = await response.json();
        displayPendingAppointments(appointments);
    } catch (error) {
        console.error('Error fetching pending appointments:', error);
    }
}

// Display Pending Appointments
function displayPendingAppointments(appointments) {
    const pendingList = document.getElementById('pendingAppointments');
    pendingList.innerHTML = '';

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.customerName}</td>
            <td>${new Date(appointment.date).toLocaleDateString()}</td>
            <td>${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${appointment.services.join(', ')}</td>
            <td>${appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}</td>
            <td>
                <button onclick="approveAppointment('${appointment._id}')">Approve</button>
                <button onclick="declineAppointment('${appointment._id}')">Decline</button>
                <button onclick="deleteAppointment('${appointment._id}')">Delete</button>
            </td>
        `;
        pendingList.appendChild(row);
    });
}

async function deleteAppointment(appointmentId) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await fetch(`/appointments/${appointmentId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Appointment deleted successfully.');
                fetchPendingAppointments(); // Refresh the pending appointments list
            } else {
                alert('Failed to delete the appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    }
}

// Update the approveAppointment and declineAppointment functions
async function approveAppointment(appointmentId) {
    try {
        const response = await fetch(`/appointments/${appointmentId}/approve`, { method: 'PATCH' });
        if (response.ok) {
            alert('Appointment approved successfully.');
            fetchPendingAppointments(); // Refresh the pending appointments list
            await fetchAppointments(); // Fetch updated appointments for the schedule
        } else {
            const errorResponse = await response.json();
            alert(`Failed to approve the appointment: ${errorResponse.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error approving appointment:', error);
    }
}

async function declineAppointment(appointmentId) {
    try {
        const response = await fetch(`/appointments/${appointmentId}/decline`, { method: 'PATCH' });
        if (response.ok) {
            alert('Appointment declined successfully.');
            fetchPendingAppointments(); // Refresh the pending appointments list
        } else {
            const errorResponse = await response.json();
            alert(`Failed to decline the appointment: ${errorResponse.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error declining appointment:', error);
    }
}