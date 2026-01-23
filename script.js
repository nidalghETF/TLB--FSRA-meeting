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

        const CORRECT_PASS = "Idea";

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

    // ==========================================
    // 2. PRESENTATION VIEWER LOGIC (PDF.js)
    // ==========================================
    const canvas = document.getElementById('the-canvas');

    if (canvas) {
        const container = document.querySelector('.ppt-screen-large') || document.querySelector('.ppt-screen');
        
        // --- 1. SHOW LOADING INDICATOR ---
        // We show this briefly until the first page is ready
        if (container) {
            const loaderDiv = document.createElement('div');
            loaderDiv.id = 'pdf-loader';
            loaderDiv.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div class="spinner" style="margin-bottom: 15px; font-size: 30px;">⏳</div>
                    <h3 style="margin: 0;">Loading Presentation...</h3>
                </div>
            `;
            loaderDiv.style.position = 'absolute';
            loaderDiv.style.display = 'flex';
            loaderDiv.style.justifyContent = 'center';
            loaderDiv.style.alignItems = 'center';
            loaderDiv.style.width = '100%';
            loaderDiv.style.height = '100%';
            loaderDiv.style.background = '#000';
            loaderDiv.style.zIndex = '10';
            
            container.style.position = 'relative';
            container.appendChild(loaderDiv);
        }

        const url = 'deck.pdf'; 
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        let pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 3.0, 
            ctx = canvas.getContext('2d');

        // --- FAST STREAMING CONFIGURATION ---
        // We removed 'disableRange' and 'disableStream' so it behaves normally again.
        const loadingTask = pdfjsLib.getDocument(url);
        
        loadingTask.promise.then(function(pdfDoc_) {
            // --- 2. HIDE LOADING INDICATOR ---
            const loader = document.getElementById('pdf-loader');
            if (loader) loader.style.display = 'none';

            pdfDoc = pdfDoc_;
            const countEl = document.getElementById('page_count');
            if (countEl) countEl.textContent = pdfDoc.numPages;

            renderPage(pageNum);
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            
            if (container) {
                container.style.backgroundColor = "#222";
                container.style.flexDirection = "column";
                container.innerHTML = `
                    <div style="color:white; text-align:center; padding: 20px;">
                        <h2 style="color: #e74c3c;">⚠️ Load Error</h2>
                        <p style="margin-bottom:10px;">The presentation could not be loaded.</p>
                        <div style="margin-top: 15px; padding: 10px; background: #333; font-family: monospace; color: #ff6b6b; font-size: 12px;">
                            ${error.message}
                        </div>
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
    .spinner {
        display: inline-block;
        animation: spin 2s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
