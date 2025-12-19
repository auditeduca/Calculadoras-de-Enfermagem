        document.addEventListener('DOMContentLoaded', () => {
            const banner = document.getElementById('cookie-banner');
            const overlay = document.getElementById('cookie-overlay');
            const modalContent = document.getElementById('cookie-modal-content');
            const backToTop = document.getElementById('backToTop');
            const body = document.body;
            let lastFocusedElement;

            const CONSENT_KEY = 'ce_cookie_consent_v4_2025';
            
            const saveConsent = (all = false) => {
                const prefs = {
                    date: new Date().toISOString(),
                    analytics: all || document.getElementById('check-stats')?.checked,
                    adsense: all || document.getElementById('check-adsense')?.checked
                };
                localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
                hideBanner();
            };

            const checkExistingConsent = () => {
                if (!localStorage.getItem(CONSENT_KEY)) {
                    setTimeout(showBanner, 1500);
                }
            };

            const updateFabsPosition = () => {
                if (banner.classList.contains('visible')) {
                    const bannerHeight = banner.offsetHeight;
                    body.style.setProperty('--banner-height', `${bannerHeight}px`);
                    body.classList.add('fabs-above-banner');
                } else {
                    body.classList.remove('fabs-above-banner');
                }
            };

            const showBanner = () => {
                banner.classList.add('visible');
                updateFabsPosition();
            };

            const hideBanner = () => {
                banner.classList.remove('visible');
                updateFabsPosition();
            };

            const openModal = () => {
                lastFocusedElement = document.activeElement;
                overlay.classList.remove('invisible', 'opacity-0');
                overlay.classList.add('opacity-100');
                modalContent.classList.remove('translate-y-full');
                modalContent.classList.add('translate-y-0');
                setTimeout(() => modalContent.querySelector('button, input')?.focus(), 300);
            };

            const closeModal = () => {
                overlay.classList.remove('opacity-100');
                overlay.classList.add('invisible', 'opacity-0');
                modalContent.classList.remove('translate-y-0');
                modalContent.classList.add('translate-y-full');
                lastFocusedElement?.focus();
            };

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !overlay.classList.contains('invisible')) closeModal();
                if (e.key === 'Tab' && !overlay.classList.contains('invisible')) {
                    const focusable = modalContent.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
                    else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
                }
            });

            overlay.addEventListener('click', (e) => e.target === overlay && closeModal());

            document.getElementById('banner-options')?.addEventListener('click', openModal);
            document.getElementById('cookie-fab')?.addEventListener('click', openModal);
            document.getElementById('modal-close-x')?.addEventListener('click', closeModal);
            document.getElementById('banner-accept')?.addEventListener('click', () => saveConsent(true));
            document.getElementById('modal-save')?.addEventListener('click', () => { saveConsent(false); closeModal(); });
            document.getElementById('modal-reject-all')?.addEventListener('click', () => { 
                document.querySelectorAll('.consent-check').forEach(i => i.checked = false);
                saveConsent(false); 
                closeModal(); 
            });

            document.querySelectorAll('.cookie-desc-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = document.getElementById(btn.dataset.target);
                    const isHidden = target.classList.contains('hidden');
                    target.classList.toggle('hidden');
                    btn.querySelector('i').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    btn.setAttribute('aria-expanded', !isHidden);
                });
            });

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.remove('opacity-0', 'pointer-events-none');
                    backToTop.classList.add('opacity-100');
                } else {
                    backToTop.classList.add('opacity-0', 'pointer-events-none');
                    backToTop.classList.remove('opacity-100');
                }
            });

            backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            window.addEventListener('resize', updateFabsPosition);
            document.getElementById('current-year').textContent = new Date().getFullYear();
            checkExistingConsent();
        });