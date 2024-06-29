document.addEventListener('DOMContentLoaded', function () {
    const email = checkEmail('email');  // Replace with the actual email parameter
    const apiUrl = `http://86.38.205.133:8087/api/driving-states/getDrivingStates/${email}`;
    const tripsTableBody = document.getElementById('tripsTableBody');
    const tableBody = document.getElementById('tableBody');



    function handleButtonClick(tripId) {
        fetchDetails(tripId);
    }

    // Function to fetch details
    async function fetchDetails(tripId) {
        fetch(`http://86.38.205.133:8087/api/drowsy-state-details/${tripId}`)
            .then(response => {
                // Check if the response is JSON
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) });
                }
            })
            .then(data => {
                // Clear the table body
                tableBody.innerHTML = '';

                // Populate the table with fetched data
                data.forEach(trip => {
                    var duration = (new Date(trip.endTime) - new Date(trip.startTime)) / 60000 * 60;
                    var strDuration;
                    if (duration >= 60) {
                        var real = parseInt(duration / 60);
                        remain = duration - (real * 60);
                        if (remain > 0) {
                            strDuration = real + " Min " + remain + " Sec";
                        }
                        else {
                            strDuration = real + " Min ";
                        }

                    }
                    else {
                        strDuration = duration + " Sec"
                    }
                    var colore;
                    if (trip.stateDegree=="ALERT") {
                        colore = "green";
                    }
                    else if (trip.stateDegree=="SLIGHTLY_DROWSY") {
                        colore = "#74a11a";
                    }
                    else if (trip.stateDegree=="MODERATELY_DROWSY") {
                        colore = "#da5";
                    }
                    else if (trip.stateDegree=="VERY_DROWSY") {
                        colore = "#e75";
                    }
                    else if (trip.stateDegree=="EXTREMELY_DROWSY") {
                        colore = "#d33131";
                    }
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td data-label="Start time">${new Date(trip.startTime).toLocaleString()}</td>
                        <td data-label="End time">${new Date(trip.endTime).toLocaleString()}</td>
                        <td data-label="Duration">${strDuration} </td>
                        <td data-label="State degree"><span style = "background-color: ${colore}; color: #fff; border-radius: 25px; display: inline-block; width: 100%; padding:10px 0; font-size: 0.8rem;" >${trip.stateDegree}</span></td>
                    `;
                    tableBody.appendChild(row);
                    
                });

                document.querySelector('.containerInfo').style.display = "block";
            })
            .catch((error) => {
                // Handle errors
                console.error('Error:', error.message);
                alert(error.message);
            });
    }

    // Function to fetch and display trip data
    function fetchTrips() {
        fetch(apiUrl)
            .then(response => {
                // Check if the response is JSON
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) });
                }
            })
            .then(data => {

                // Clear the table body
                tripsTableBody.innerHTML = '';

                // Populate the table with fetched data
                data.forEach(trip => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td data-label="Start time">${new Date(trip.startDate).toLocaleString()}</td>
                        <td data-label="End time">${new Date(trip.endDate).toLocaleString()}</td>
                        <td data-label="Drowsy state"><button class="action-button" data-trip-id="${trip.drivingStateId}">Show details</button></td>
                    `;
                    tripsTableBody.appendChild(row);
                });


                // Attach event listeners to the buttons
                document.querySelectorAll('.action-button').forEach(button => {
                    button.style.display = "block";
                    button.style.margin = "0 auto";
                    button.style.backgroundColor = "#598b40";
                    button.style.color = "#fff";
                    button.style.border = "none";
                    button.style.padding = "10px";
                    button.style.borderRadius = "7px";
                    button.style.cursor = "pointer";
                    button.addEventListener('click', function () {
                        const tripId = this.getAttribute('data-trip-id');
                        handleButtonClick(tripId);
                    });
                })
            })
            .catch((error) => {
                // Handle errors
                console.log(email);
                console.error('Error:', error.message);
                alert(error.message);
                // document.getElementById('registrationError').textContent = error.message;
            });


    }
    // Fetch trips on page load
    fetchTrips();
});