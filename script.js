document.addEventListener('DOMContentLoaded', () => {

    // 1. LOGIN LOGIC (Kept same)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const passwordInput = document.getElementById('passwordInput');
        const errorMsg = document.getElementById('errorMsg');
        const loginBlock = document.getElementById('loginBlock');
        const dashboardBlock = document.getElementById('dashboardBlock');
        const lockBtn = document.getElementById('lockBtn');
        const CORRECT_PASS = "Token";

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (passwordInput.value === CORRECT_PASS) {
                loginBlock.classList.add('hidden');
                dashboardBlock.classList.remove('hidden');
                errorMsg.style.display = 'none';
                sessionStorage.setItem('isLoggedIn', 'true');
            } else {
                errorMsg.style.display = 'block';
                loginBlock.style.animation = "shake 0.5s";
                setTimeout(() => loginBlock.style.animation = "", 500);
            }
        });

        lockBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            location.reload();
        });

        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            loginBlock.classList.add('hidden');
            dashboardBlock.classList.remove('hidden');
        }
    }

    // 2. DIAGNOSTIC PDF LOADER
    const canvas = document.getElementById('the-canvas');
    if (canvas) {
        const url = 'deck.pdf';
        const container = document.querySelector('.ppt-screen-large') || document.querySelector('.ppt-screen');
        
        // Show Diagnostic Box
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:white;">
                    <h2>🕵️ Diagnostic Mode</h2>
                    <p>Checking what is inside <strong>deck.pdf</strong>...</p>
                    <div id="debug-output" style="background:#333; color:#0f0; padding:20px; font-family:monospace; margin-top:20px; text-align:left; white-space:pre-wrap;">Waiting...</div>
                </div>
            `;
        }

        // FETCH AS TEXT TO SEE CONTENTS
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                return response.text();
            })
            .then(text => {
                const first50 = text.substring(0, 200); // Get first 200 chars
                const output = document.getElementById('debug-output');
                
                let diagnosis = "";
                
                if (text.includes("<!DOCTYPE html>")) {
                    diagnosis = "❌ CRITICAL ERROR: The file is an HTML Page (404), not a PDF. The path is wrong.";
                } else if (text.includes("version https://git-lfs")) {
                    diagnosis = "❌ CRITICAL ERROR: This is a GitHub LFS Pointer, not the real PDF file. You need to disable LFS or upload via the web interface correctly.";
                } else if (text.startsWith("%PDF-")) {
                    diagnosis = "✅ SUCCESS: The header looks like a PDF. (If it still fails, the binary is corrupted inside).";
                } else {
                    diagnosis = "⚠️ UNKNOWN: The file header is weird.";
                }

                output.innerHTML = `<strong>FILE HEADER PREVIEW:</strong>\n---------------------\n${first50}\n---------------------\n\n<strong>DIAGNOSIS:</strong>\n${diagnosis}`;
            })
            .catch(err => {
                const output = document.getElementById('debug-output');
                output.innerHTML = `<strong>FETCH ERROR:</strong>\n${err.message}`;
            });
    }
});
