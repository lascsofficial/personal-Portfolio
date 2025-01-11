const sidebar = document.getElementById('sidebar'); 
const sidebarToggle = document.getElementById('sidebarToggle');

// Adds a click event listener to the toggle button
sidebarToggle.addEventListener('click', () => {
    console.log('Sidebar toggled');
    // Toggle display between 'block' and 'none'
    if (sidebar.style.display === 'block') {
        sidebar.style.display = 'none'; // Hides the sidebar
    } else {
        sidebar.style.display = 'block'; // Shows the sidebar
    }
});
