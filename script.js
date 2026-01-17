document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('errorMsg');
    const loginBlock = document.getElementById('loginBlock');
    const dashboardBlock = document.getElementById('dashboardBlock');
    const lockBtn = document.getElementById('lockBtn');

    // The Password
    const CORRECT_PASS = "Token";

    // Check Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (passwordInput.value === CORRECT_PASS) {
            // Success
            loginBlock.classList.add('hidden');
            dashboardBlock.classList.remove('hidden');
            errorMsg.style.display = 'none';
            // Optional: Store session so refresh doesn't lock immediately
            sessionStorage.setItem('isLoggedIn', 'true');
        } else {
            // Fail
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
            
            // Shake animation
            loginBlock.style.animation = "shake 0.5s";
            setTimeout(() => loginBlock.style.animation = "", 500);
        }
    });

    // Handle Lock Button
    lockBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        location.reload();
    });

    // Check Session on Load
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginBlock.classList.add('hidden');
        dashboardBlock.classList.remove('hidden');
    }
});

// Add Shake Animation Style dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
        100% { transform: translateX(0); }
    }
`;
document.head.appendChild(style);
