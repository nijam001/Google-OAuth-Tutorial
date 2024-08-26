document.addEventListener('DOMContentLoaded', () => {
    // fetch('/user')
    //     .then(response => response.json())
    //     .then(user => {
    //         const userInfo = document.getElementById('user-info');
    //         userInfo.innerHTML = `
    //             <h2>User Details</h2>
    //             <p>Name: ${user.displayName}</p>
    //             <p>Email: ${user.emails[0].value}</p>
    //             <img src="${user.photos[0].value}" alt="Profile Picture" width="100">
    //         `;
    //     })
    //     .catch(error => {
    //         console.error('Error fetching user data:', error);
    //     });

    // In your user info fetching code
    fetch('/user')
    .then(response => response.json())
    .then(user => {
        const userInfo = document.getElementById('user-info');
        userInfo.innerHTML = `
            <img src="${user.photos[0].value}" alt="Profile Picture" width="100" ;">
            <p><strong>Name:</strong> ${user.displayName || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.emails[0].value || 'N/A'}</p>
            <!-- Add more user information as needed -->
        `;
    })
    .catch(error => {
        console.error('Error fetching user information:', error);
        document.getElementById('user-info').innerHTML = '<p>Error loading user information.</p>';
    });

});
