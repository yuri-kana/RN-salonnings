document.addEventListener('DOMContentLoaded', () => {
    fetchAppointments(); // Fetch appointments on page load
});

// Fetch appointments from the server
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
            const status = appointment.status || 'start'; // Default to 'start'
            const buttonText = status.charAt(0).toUpperCase() + status.slice(1);
            const date = new Date(appointment.date);
            
            // Convert date to desired format: "Month Day, Year"
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);

            // Define delete button if status is 'finish'
            const deleteButton = status === 'finish' 
                ? `<button class="delete-btn" onclick="deleteAppointment('${appointment._id}')">Delete</button>` 
                : ''; 

            row.innerHTML = `
                <td>${appointment.customerName}</td>
                <td>${formattedDate}</td>
                <td>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${appointment.services.join(', ')}</td>
                <td>
                    <span>${buttonText}</span>
                    ${deleteButton} <!-- Include delete button if finished -->
                </td>
            `;
            appointmentList.appendChild(row);
        });
    } else {
        appointmentList.innerHTML = '<tr><td colspan="5">No appointments available.</td></tr>';
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
