// ==========================================
// 1. GENERAZIONE MENU (se non esiste già)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('menu-toggle')) {
        const path = window.location.pathname;
        const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        const links = [
            { name: "Home", href: "index.html" },
            { name: "Prodotto", href: "prodotto.html" },
            { name: "Costi", href: "costi.html" },
            { name: "Spot", href: "spot.html" },
            { name: "Opinioni", href: "opinioni.html" },
            { name: "Social", href: "social.html" },
            { name: "Scrivici", href: "contatti.html" },
            { name: "FAQ", href: "faq.html" }
        ];

        let navHTML = `
        <header>
            <div class="header-container">
                <a href="index.html"><img src="REFERENCE/LOGO.png" alt="Magic Angel Logo" class="logo-header"></a>
                <button id="menu-toggle" class="menu-toggle" aria-label="Apri menu">&#9776;</button>
                <nav id="main-nav">
        `;

        links.forEach(link => {
            const isActive = (link.href === currentPage) || (currentPage === '' && link.href === 'index.html');
            const activeClass = isActive ? ' class="active"' : '';
            navHTML += `<a href="${link.href}"${activeClass}>${link.name}</a>`;
        });

        navHTML += `</nav></div></header>`;
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // ==========================================
    // 2. GESTIONE MENU CON POINTERDOWN (UNIVERSALE)
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    if (menuToggle && nav) {
        // Usa 'pointerdown' per intercettare subito il tocco (mobile) e il click (desktop)
        menuToggle.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('active');
        });

        // Chiudi il menu quando si clicca su un link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('pointerdown', function() {
                nav.classList.remove('active');
            });
        });

        // Chiudi il menu quando si clicca fuori dall'header
        document.addEventListener('pointerdown', function(e) {
            if (!e.target.closest('header')) {
                nav.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 3. CARICAMENTO CONFIG (con gestione errori)
    // ==========================================
    async function loadConfig() {
        const loadingMessages = document.querySelectorAll('.loading-message');
        // Mostra il messaggio (di default è già visibile)

        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
            }
            const config = await response.json();

            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el && value) el.innerText = value;
            };
            const setTextForAll = (baseId, value) => {
                if (!value) return;
                document.querySelectorAll(`[id^="${baseId}"]`).forEach(el => el.innerText = value);
            };

            // Aggiorna i campi
            setText('site-tagline', "Lo struccante che fa sparire il trucco... e, almeno per qualche minuto, anche i problemi!");
            setText('product-name', config.product.name);
            setText('product-desc', config.product.desc);
            setText('product-size', config.product.size);
            setText('product-price', config.product.price);
            setText('product-offer', config.product.offer);
            setText('footer-text', config.contact.footerText);

            setTextForAll('donna1', config.dialog.donna1);
            setTextForAll('donna2', config.dialog.donna2);

            setText('address', config.contact.address);
            setText('city', config.contact.city);
            setText('province', config.contact.province);

            const addressLink = document.getElementById('address-link');
            if (addressLink && config.contact.address && config.contact.city && config.contact.province) {
                const fullAddress = `${config.contact.address}, ${config.contact.city} (${config.contact.province})`;
                addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            }
            
            const phoneEl = document.getElementById('phone');
            if (phoneEl && config.contact.phone) {
                phoneEl.innerText = config.contact.phone;
                phoneEl.href = 'tel:' + config.contact.phone.replace(/\s/g, '');
            }

            const emailEl = document.getElementById('email');
            if (emailEl && config.contact.email) {
                emailEl.innerText = config.contact.email;
                emailEl.href = 'mailto:' + config.contact.email;
            }

            const faqList = document.getElementById('faq-list');
            if (faqList && config.faq && Array.isArray(config.faq)) {
                faqList.innerHTML = '';
                config.faq.forEach(item => {
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    faqItem.innerHTML = `<button class="faq-question">${item.question}</button><div class="faq-answer"><p>${item.answer}</p></div>`;
                    faqList.appendChild(faqItem);
                });
            }

            const productCard = document.getElementById('product-card');
            if (productCard) productCard.style.display = 'flex';

        } catch (error) {
            console.error('Errore nel caricamento config:', error);
            
            // Se c'è un errore, mostra un messaggio chiaro al posto del caricamento
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.innerText = 'Errore nel caricamento dei dati. Riprova più tardi.';
                statusMessage.style.color = 'red';
                statusMessage.style.fontSize = '1.2rem';
            }
        } finally {
            // NASCONDI SEMPRE il messaggio di caricamento (anche in caso di errore)
            loadingMessages.forEach(el => el.style.display = 'none');
        }
    }

    loadConfig();
});

// ==========================================
// 4. STICKY HEADER
// ==========================================
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (header) {
        header.style.boxShadow = window.scrollY > 50 ? "0 4px 15px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.05)";
    }
});

// ==========================================
// 5. FAQ ACCORDION
// ==========================================
document.addEventListener('pointerdown', function(e) {
    const faqButton = e.target.closest('.faq-question');
    if (faqButton) {
        const faqItem = faqButton.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            }
        });

        if (faqItem.classList.contains('active')) {
            faqItem.classList.remove('active');
            answer.style.maxHeight = null;
        } else {
            faqItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    }
});

// ==========================================
// 6. FORM VALIDATION
// ==========================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const inputs = this.querySelectorAll('input, textarea');
        let valid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.style.border = '2px solid red';
            } else {
                input.style.border = 'none';
            }
        });
        if (valid) {
            alert("Grazie! Ti risponderemo molto presto.");
            this.reset();
        } else {
            alert("Per favore compila tutti i campi.");
        }
    });
}