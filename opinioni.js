document.addEventListener("DOMContentLoaded", () => {
    caricaOpinioni();
});

async function caricaOpinioni() {
    const statusMsg = document.getElementById("status-message"); // Assicurati che esista un elemento per lo stato nell'HTML
    const container = document.getElementById("opinioni-container");

    try {
        // Sostituisci questo URL con il link di esportazione CSV/JSON del tuo Google Doc o Google Sheet pubblicato
        const urlGoogleDoc = "INSERISCI_QUI_IL_LINK_DEL_TUO_GOOGLE_DOC_PUBBLICATO";
        
        const response = await fetch(urlGoogleDoc);
        if (!response.ok) {
            throw new Error(`Errore di rete: ${response.status}`);
        }

        const data = await response.text(); // O .json() a seconda di come pubblichi il documento

        // Qui inserisci la logica per parsare i dati e metterli a video
        // Esempio generico di popolamento:
        if (container) {
            container.innerHTML = data; // Oppure elabora le righe se è un CSV/testo
        }

        if (statusMsg) statusMsg.style.display = "none";
        if (container) container.style.display = "block";

    } catch (error) {
        console.error("Errore durante il caricamento delle opinioni:", error);
        if (statusMsg) {
            statusMsg.innerHTML = "Impossibile caricare le opinioni al momento.";
            statusMsg.style.color = "red";
        }
    }
}