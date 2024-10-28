document.addEventListener('DOMContentLoaded', () => {
    fetchAppointments(); // Fetch appointments on page load
});

// Fetch appointments from the server
async function fetchAppointments() {
    try {
        const response = await fetch('/appointments'); // Fetch all appointments
        if (!response.ok) throw new Error('Failed to fetch appointments');
        
        const appointments = await response.json();

        // Filter out declined appointments
        const filteredAppointments = appointments.filter(appointment => appointment.status !== 'declined');

        showAppointments(filteredAppointments); // Show only non-declined appointments
    } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments. Please try again.');
    }
}

function showAppointments(appointments) {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = ''; // Clear the previous appointment list

    if (appointments.length) {
        appointments.forEach((appointment) => {
            const row = document.createElement('tr');
            const date = new Date(appointment.date);

            // Format date to "Month Day, Year"
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Create action buttons based on status
            let actionButton = '';
            if (appointment.status === 'approved') {
                actionButton = `<button class="start-btn start" onclick="updateStatus('${appointment._id}', 'ongoing', this)">Start</button>`;
            } else if (appointment.status === 'ongoing') {
                actionButton = `<button class="start-btn finish" onclick="updateStatus('${appointment._id}', 'finished', this)">Finish</button>`;
            } else if (appointment.status === 'finished') {
                actionButton = `
                    <span>Completed</span>
                    <button class="delete-btn" onclick="deleteAppointment('${appointment._id}')">Delete</button>
                `;
            }

            row.innerHTML = `
                <td>${appointment.customerName}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime}</td>
                <td>${appointment.services.join(', ')}</td>
                <td>${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</td>
                <td>${actionButton}</td>
            `;
            appointmentList.appendChild(row);
        });
    } else {
        appointmentList.innerHTML = '<tr><td colspan="6">No appointments available.</td></tr>';
    }
}

async function updateStatus(id, newStatus, button) {
    button.disabled = true; // Disable button to prevent multiple clicks
    try {
        const response = await fetch(`/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        fetchAppointments(); // Refresh appointments after status update
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
        button.disabled = false; // Re-enable button if error occurs
    }
}

async function deleteAppointment(id) {
    if (confirm("Are you sure you want to delete this appointment?")) {
        try {
            const response = await fetch(`/appointments/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete appointment');
            }

            fetchAppointments(); // Refresh appointments after deletion
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete appointment. Please try again.'); // User feedback on error
        }
    }
}