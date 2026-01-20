document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LOGIN & DASHBOARD LOGIC
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    
    // Only run login logic if we are on the login page (index.html)
    if (loginForm) {
        const passwordInput = document.getElementById('passwordInput');
        const errorMsg = document.getElementById('errorMsg');
        const loginBlock = document.getElementById('loginBlock');
        const dashboardBlock = document.getElementById('dashboardBlock');
        const lockBtn = document.getElementById('lockBtn');

        const CORRECT_PASS = "Token";

        // Check Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (passwordInput.value === CORRECT_PASS) {
                loginBlock.classList.add('hidden');
                dashboardBlock.classList.remove('hidden');
                errorMsg.style.display = 'none';
                sessionStorage.setItem('isLoggedIn', 'true');
            } else {
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
    }

    // ==========================================
    // 2. PRESENTATION VIEWER LOGIC (PDF.js)
    // ==========================================
    const canvas = document.getElementById('the-canvas');

    // Only run PDF logic if the canvas exists (presentation.html)
    if (canvas) {
        
        // --- CONFIGURATION ---
        const url = 'deck.pdf';  // <--- NAME OF YOUR UPLOADED PDF FILE
        
        // We set the worker source explicitly for stability
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        let pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 2.0, // High res
            ctx = canvas.getContext('2d');

        // Load the PDF
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;

            // Initial render
            renderPage(pageNum);
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            // Optional: Alert user if file not found
            // alert('Presentation file "deck.pdf" not found.');
        });

        // Render the page
        function renderPage(num) {
            pageRendering = true;
            
            // Fetch page
            pdfDoc.getPage(num).then(function(page) {
                var viewport = page.getViewport({scale: scale});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);

                // Wait for render to finish
                renderTask.promise.then(function() {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            // Update page counters
            document.getElementById('page_num').textContent = num;

            // Update button states
            document.getElementById('prev').disabled = num <= 1;
            document.getElementById('next').disabled = num >= pdfDoc.numPages;
        }

        // Queue rendering if another page is rendering
        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        // Button Events
        document.getElementById('prev').addEventListener('click', function() {
            if (pageNum <= 1) return;
            pageNum--;
            queueRenderPage(pageNum);
        });

        document.getElementById('next').addEventListener('click', function() {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            queueRenderPage(pageNum);
        });

        // Optional: Keyboard Navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === "ArrowRight") {
                if (pageNum < pdfDoc.numPages) {
                    pageNum++;
                    queueRenderPage(pageNum);
                }
            }
            if (e.key === "ArrowLeft") {
                if (pageNum > 1) {
                    pageNum--;
                    queueRenderPage(pageNum);
                }
            }
        });
    }
});

// Add Shake Animation Style dynamically (Global)
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
