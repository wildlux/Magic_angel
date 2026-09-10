// ==========================================
// CONFIGURAZIONE GLOBALE
// ==========================================
let CONFIG = null;

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    generaHeader();
    generaFooter();
    popolaContenuti();
    gestisciMenuMobile();
    gestisciScrollHeader();
});

// ==========================================
// 1. CARICAMENTO CONFIG
// ==========================================
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Debug: mostra in console cosa arriva
        console.log('[CONFIG caricato]', data);

        // Se il server ha restituito un errore, mostra avviso
        if (data.error) {
            console.warn('[CONFIG] Il server ha restituito un errore:', data.error);
            CONFIG = null;
            return;
        }

        CONFIG = data;
    } catch (error) {
        console.error('[CONFIG] Errore di caricamento:', error);
        CONFIG = null;
    }
}

// ==========================================
// 2. GENERAZIONE HEADER
// ==========================================
function generaHeader() {
    const page = document.body.getAttribute('data-page') || 'home';

    const links = [
        { name: "Home", href: "index.html", id: "home" },
        { name: "Prodotto", href: "prodotto.html", id: "prodotto" },
        { name: "Costi", href: "costi.html", id: "costi" },
        { name: "Spot", href: "spot.html", id: "spot" },
        { name: "Opinioni", href: "opinioni.html", id: "opinioni" },
        { name: "Social", href: "social.html", id: "social" },
        { name: "Scrivici", href: "contatti.html", id: "contatti" },
        { name: "FAQ", href: "faq.html", id: "faq" }
    ];

    let navHTML = `
    <header>
        <div class="header-container">
            <a href="index.html"><img src="REFERENCE/LOGO.png" alt="Magic Angel" class="logo-header"></a>
            <button id="menu-toggle" class="menu-toggle" aria-label="Apri menu">&#9776;</button>
            <nav id="main-nav">
    `;

    links.forEach(link => {
        const activeClass = (link.id === page) ? ' class="active"' : '';
        navHTML += `<a href="${link.href}"${activeClass}>${link.name}</a>`;
    });

    navHTML += `</nav></div></header>`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ==========================================
// 3. GENERAZIONE FOOTER
// ==========================================
function generaFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const anno = new Date().getFullYear();
    const testo = (CONFIG && CONFIG.contact && CONFIG.contact.footerText)
        ? CONFIG.contact.footerText
        : `© ${anno} Magic Angel. Tutti i diritti riservati.`;

    footer.innerHTML = `<p>${testo}</p>`;
}

// ==========================================
// 4. POPOLA CONTENUTI (con controlli di sicurezza)
// ==========================================
function popolaContenuti() {
    if (!CONFIG) {
        console.warn('[POPOLA] CONFIG non disponibile, salto il popolamento.');
        nascondiLoading();
        return;
    }

    // --- Utility: imposta testo se l'elemento esiste ---
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null) {
            el.innerText = value;
        }
    };

    // --- Utility: imposta testo su TUTTI gli elementi con id che inizia per baseId ---
    const setTextForAll = (baseId, value) => {
        if (!value) return;
        document.querySelectorAll(`[id^="${baseId}"]`).forEach(el => {
            el.innerText = value;
        });
    };

    // ==========================================
    // PRODOTTO (con controllo di sicurezza)
    // ==========================================
    const product = CONFIG.product || {};
    setText('product-name', product.nome || product.name);
    setText('product-desc', product.desc);
    setText('product-size', product.size);
    setText('product-price', product.price);
    setText('product-offer', product.offer);

    // ==========================================
    // DIALOGO
    // ==========================================
    const dialog = CONFIG.dialog || {};
    setTextForAll('donna1', dialog.donna1);
    setTextForAll('donna2', dialog.donna2);

    // ==========================================
    // CONTATTI
    // ==========================================
    const contact = CONFIG.contact || {};
    setText('address', contact.address);
    setText('city', contact.city);
    setText('province', contact.province);

    // Link Google Maps
    const addressLink = document.getElementById('address-link');
    if (addressLink && contact.address && contact.city) {
        const fullAddress = `${contact.address}, ${contact.city} (${contact.province || ''})`;
        addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    }

    // Telefono cliccabile
    const phoneEl = document.getElementById('phone');
    if (phoneEl && contact.phone) {
        phoneEl.innerText = contact.phone;
        phoneEl.href = 'tel:' + contact.phone.replace(/\s/g, '');
    }

    // Email cliccabile
    const emailEl = document.getElementById('email');
    if (emailEl && contact.email) {
        emailEl.innerText = contact.email;
        emailEl.href = 'mailto:' + contact.email;
    }

    // ==========================================
    // LINK (video, form)
    // ==========================================
    const links = CONFIG.links || {};

    // Video di Giusy
    const videoIframe = document.getElementById('video-giusy');
    if (videoIframe && links.videoGiusy && links.videoGiusy !== '') {
        videoIframe.src = links.videoGiusy;
    }

    // Google Form - pulsante
    const formLink = document.getElementById('google-form-link');
    if (formLink && links.googleForm && links.googleForm !== '') {
        formLink.href = links.googleForm;
    }

    // Google Form - iframe (se presente)
    const formContainer = document.getElementById('google-form-container');
    const formIframe = document.getElementById('google-form-iframe');
    if (formContainer && formIframe && links.googleForm && links.googleForm !== '') {
        formIframe.src = links.googleForm;
        formContainer.style.display = 'block';
    }

    // ==========================================
    // FAQ
    // ==========================================
    const faqList = document.getElementById('faq-list');
    if (faqList && Array.isArray(CONFIG.faq) && CONFIG.faq.length > 0) {
        faqList.innerHTML = '';
        CONFIG.faq.forEach(item => {
            if (!item.question || !item.answer) return;
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <button class="faq-question">${item.question}</button>
                <div class="faq-answer"><p>${item.answer}</p></div>
            `;
            faqList.appendChild(faqItem);
        });
    }

    // ==========================================
    // OPINIONI
    // ==========================================
    const opinioniContainer = document.getElementById('opinioni-container');
    if (opinioniContainer && Array.isArray(CONFIG.opinioni) && CONFIG.opinioni.length > 0) {
        opinioniContainer.innerHTML = '';
        CONFIG.opinioni.forEach(op => {
            if (!op.nome || !op.testo) return;
            const stelleNum = parseInt(op.stelle, 10) || 5;
            const stelle = '★'.repeat(stelleNum) + '☆'.repeat(5 - stelleNum);

            const div = document.createElement('div');
            div.className = 'opinione';
            div.innerHTML = `
                <div class="stelle">${stelle}</div>
                <div class="testo">"${op.testo}"</div>
                <div class="nome">— ${op.nome}</div>
            `;
            opinioniContainer.appendChild(div);
        });
    }

    // ==========================================
    // MOSTRA CARD PRODOTTO
    // ==========================================
    const productCard = document.getElementById('product-card');
    if (productCard) productCard.style.display = 'flex';

    // ==========================================
    // NASCONDI MESSAGGI DI CARICAMENTO
    // ==========================================
    nascondiLoading();
}

// ==========================================
// 5. NASCONDI MESSAGGI LOADING
// ==========================================
function nascondiLoading() {
    document.querySelectorAll('.loading-message').forEach(el => {
        el.style.display = 'none';
    });
}

// ==========================================
// 6. MENU MOBILE
// ==========================================
function gestisciMenuMobile() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('active'));
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            nav.classList.remove('active');
        }
    });
}

// ==========================================
// 7. FAQ ACCORDION (delegato)
// ==========================================
document.addEventListener('click', function(e) {
    const faqButton = e.target.closest('.faq-question');
    if (!faqButton) return;

    const faqItem = faqButton.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    if (!answer) return;

    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            const a = item.querySelector('.faq-answer');
            if (a) a.style.maxHeight = null;
        }
    });

    if (faqItem.classList.contains('active')) {
        faqItem.classList.remove('active');
        answer.style.maxHeight = null;
    } else {
        faqItem.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
    }
});

// ==========================================
// 8. STICKY HEADER
// ==========================================
function gestisciScrollHeader() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            header.style.boxShadow = window.scrollY > 50
                ? "0 4px 15px rgba(0,0,0,0.1)"
                : "0 2px 10px rgba(0,0,0,0.05)";
        }
    });
}

// ==========================================
// 9. TOGGLE LOGO (Home)
// ==========================================
function toggleLogo() {
    const logo = document.getElementById('logo-rivelato');
    if (logo) logo.classList.toggle('visible');
}