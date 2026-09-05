document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("opinioni-container");

    if (!container) {
        console.error("Elemento #opinioni-container non trovato nel DOM.");
        return;
    }

    // Mostra un messaggio di caricamento iniziale
    container.innerHTML = "<p class=\"loading\">Caricamento opinioni in corso...</p>";

    fetch("/api/opinioni")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            container.innerHTML = ""; // Pulisce il messaggio di caricamento

            // Gestione dati vuoti o formato inatteso
            if (!data || (Array.isArray(data) && data.length === 0)) {
                container.innerHTML = "<p>Nessuna opinione presente al momento.</p>";
                return;
            }

            // Normalizza i dati se restituiti dentro un oggetto (es. { opinioni: [...] })
            const listaOpinioni = Array.isArray(data) ? data : (data.opinioni || []);

            listaOpinioni.forEach((item) => {
                const card = document.createElement("div");
                card.className = "opinione-card";

                // Adatta i nomi dei campi (nome, messaggio, data, stelle) alle chiavi JSON di Apps Script
                const nome = item.nome || item.autore || "Anonimo";
                const testo = item.messaggio || item.testo || item.commento || "";
                const dataInvio = item.data ? new Date(item.data).toLocaleDateString("it-IT") : "";
                const valutazione = item.voto || item.stelle ? "★".repeat(item.voto || item.stelle) : "";

                card.innerHTML = `
                    <div class="opinione-header">
                        <strong>${escapeHtml(nome)}</strong>
                        ${valutazione ? `<span class="stelle">${valutazione}</span>` : ""}
                    </div>
                    ${dataInvio ? `<small class="opinione-data">${dataInvio}</small>` : ""}
                    <p class="opinione-testo">${escapeHtml(testo)}</p>
                `;

                container.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Errore durante il recupero delle opinioni:", error);
            container.innerHTML = `<p class="error">Impossibile caricare le opinioni. Riprova più tardi.</p>`;
        });
});

// Funzione helper per evitare problemi di XSS sanitizzando l'output
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}