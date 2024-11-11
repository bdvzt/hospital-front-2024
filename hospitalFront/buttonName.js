let fio ="";
const fioElement = document.getElementById('user-name');
fioElement.textContent = fio;

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function goToProfile() {
    window.location.href = '/hospitalFront/profile/profile.html'; 
}

function goToLogin() {
    window.location.href = '/hospitalFront/login/login.html'; 
}