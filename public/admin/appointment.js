let editingId = null; // Declare this globally
let activeMonth = null; // Track the currently active month
let currentUserId = null; // To store the current user's ID

document.addEventListener('DOMContentLoaded', async () => {
    await fetchUserData(); // Fetch user data
    await fetchAppointments(); // Fetch appointments
});

async function fetchUserData() {
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
            document.getElementById('customerName').value = user.username; // Fill customer name
            currentUserId = user._id; // Store the user's ID
        } else {
            alert(user.error);
            window.location.href = '../index.html'; // Redirect if error
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value; // Get name from the input
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;

    const services = [];
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    checkboxes.forEach((checkbox) => {
        services.push(checkbox.value);
    });

    const appointmentData = {
        customerName: customerName,
        date: new Date(`${date}T${time}`),
        services: services,
        userId: currentUserId // Include the current user's ID
    };

    try {
        const response = editingId 
            ? await fetch(`/appointments/${editingId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appointmentData) })
            : await fetch('/appointments', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appointmentData) });

        await response.json();
        closeModal();
        
        // Refresh appointments for the active month
        if (activeMonth) {
            fetchAppointmentsForMonth(activeMonth);
        } else {
            fetchAppointments(); // Refresh the entire list if no active month
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
    editingId = id; // Set the editing ID
    fetch(`/appointments/${id}`)
        .then(response => response.json())
        .then(appointment => {
            document.getElementById('appointmentDate').value = new Date(appointment.date).toISOString().split('T')[0];
            document.getElementById('appointmentTime').value = new Date(appointment.date).toTimeString().split(' ')[0].slice(0, 5);
            document.querySelectorAll('input[name="services"]').forEach((checkbox) => {
                checkbox.checked = appointment.services.includes(checkbox.value);
            });
            openModal(); // Open the modal
        });
}

async function deleteAppointment(id) {
    try {
        await fetch(`/appointments/${id}`, { method: 'DELETE' });
        fetchAppointments(); // Refresh appointments after deletion
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

function openModal() {
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
    document.getElementById('appointmentForm').reset(); // Reset the form
    editingId = null; // Reset editing ID
}