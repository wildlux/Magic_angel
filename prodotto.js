document.addEventListener("DOMContentLoaded", () => {
    caricaDatiProdotto();
});

function caricaDatiProdotto() {
    const statusMsg = document.getElementById("status-message");
    const productCard = document.getElementById("product-card");

    // Dati locali simulati (nessuna fetch necessaria)
    const data = {
        nome: "Struccante Bifasico Magic Angel",
        descrizione: "Formula delicata ed efficace per rimuovere ogni tipo di trucco, rispettando l'equilibrio della pelle.",
        formato: "200 ml",
        prezzo: "19,90",
        offerta: "Spedizione gratuita inclusa per ordini superiori a 30€"
    };

    // Popola i campi della pagina
    document.getElementById("product-name").innerText = data.nome;
    document.getElementById("product-desc").innerText = data.descrizione;
    document.getElementById("product-size").innerText = `Formato: ${data.formato}`;
    document.getElementById("product-price").innerText = `${data.prezzo} €`;
    document.getElementById("product-offer").innerText = data.offerta;

    // Mostra la scheda prodotto
    if (statusMsg) statusMsg.style.display = "none";
    if (productCard) productCard.style.display = "block";
}