document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIN & DASHBOARD LOGIC
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    
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

    if (canvas) {
        // --- CONFIGURATION ---
        const url = 'https://nidalghetf.github.io/TLB--FSRA-meeting/deck.pdf'; // Make sure your file matches this exactly
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        let pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 3.0, 
            ctx = canvas.getContext('2d');

        // Load the PDF
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            
            // Update page count safely
            const countEl = document.getElementById('page_count');
            if (countEl) countEl.textContent = pdfDoc.numPages;

            renderPage(pageNum);
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            
            // VISUAL ERROR MESSAGE (Replaces the Black Screen)
            const container = document.querySelector('.ppt-screen-large') || document.querySelector('.ppt-screen');
            if (container) {
                container.style.backgroundColor = "#222";
                container.style.flexDirection = "column";
                container.innerHTML = `
                    <div style="color:white; text-align:center; padding: 20px;">
                        <h2 style="color: #e74c3c;">⚠️ File Not Found</h2>
                        <p>The system cannot find <strong>"deck.pdf"</strong>.</p>
                        <p style="color: #aaa; font-size: 14px;">Please upload the PDF to your repository and name it <em>deck.pdf</em>.</p>
                    </div>
                `;
            }
        });

        function renderPage(num) {
            pageRendering = true;
            pdfDoc.getPage(num).then(function(page) {
                var viewport = page.getViewport({scale: scale});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);

                renderTask.promise.then(function() {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            // Update UI
            const pageNumEl = document.getElementById('page_num');
            if(pageNumEl) pageNumEl.textContent = num;

            const prevBtn = document.getElementById('prev');
            const nextBtn = document.getElementById('next');
            if(prevBtn) prevBtn.disabled = num <= 1;
            if(nextBtn) nextBtn.disabled = num >= pdfDoc.numPages;
        }

        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        // Button Events
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!pdfDoc || pageNum <= 1) return;
                pageNum--;
                queueRenderPage(pageNum);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
                pageNum++;
                queueRenderPage(pageNum);
            });
        }
        
        // Keyboard Nav
        document.addEventListener('keydown', function(e) {
            if (!pdfDoc) return;
            if (e.key === "ArrowRight" && pageNum < pdfDoc.numPages) {
                pageNum++;
                queueRenderPage(pageNum);
            }
            if (e.key === "ArrowLeft" && pageNum > 1) {
                pageNum--;
                queueRenderPage(pageNum);
            }
        });
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
