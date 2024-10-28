let editingId = null;
let activeMonth = null;
let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchUserData();
    await fetchAppointments();
});

async function fetchUserData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/customers/me', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        const user = await response.json();
        if (response.ok) {
            document.getElementById('customerName').value = user.username;
            currentUserId = user._id;
        } else {
            alert(user.error);
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;

    const services = [];
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    checkboxes.forEach((checkbox) => {
        services.push(checkbox.value);
    });

    // Add a status property to the appointment data
    const appointmentData = {
        customerName: customerName,
        date: new Date(`${date}T${time}`),
        services: services,
        userId: currentUserId,
        status: 'pending' // Set initial status to 'pending'
    };

    try {
        const response = await fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();
        if (response.ok) {
            closeModal();
            fetchAppointments(); // Refresh the appointments list
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
    }
});

async function fetchAppointments() {
    try {
        const response = await fetch('/appointments');
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const appointments = await response.json();
        showAppointments(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments. Please try again.');
    }
}

function showAppointments(appointments) {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';

    if (appointments.length) {
        appointments.forEach((appointment) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(appointment.date).toLocaleDateString()}</td>
                <td>${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${appointment.services.join(', ')}</td>
                <td>
                    ${appointment.userId === currentUserId ? 
                        `<button class="edit-btn" onclick="editAppointment('${appointment._id}')">Edit</button>
                         <button class="delete-btn" onclick="deleteAppointment('${appointment._id}')">Delete</button>` 
                        : ''}
                </td>
            `;
            appointmentList.appendChild(row);
        });
    } else {
        appointmentList.innerHTML = '<tr><td colspan="4">No appointments available.</td></tr>';
    }
}

function editAppointment(id) {
    editingId = id;
    fetch(`/appointments/${id}`)
        .then(response => response.json())
        .then(appointment => {
            document.getElementById('appointmentDate').value = new Date(appointment.date).toISOString().split('T')[0];
            document.getElementById('appointmentTime').value = new Date(appointment.date).toTimeString().split(' ')[0].slice(0, 5);
            document.querySelectorAll('input[name="services"]').forEach((checkbox) => {
                checkbox.checked = appointment.services.includes(checkbox.value);
            });
            openModal();
        });
}

async function deleteAppointment(id) {
    try {
        await fetch(`/appointments/${id}`, { method: 'DELETE' });
        fetchAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

function openModal() {
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    editingId = null;
}