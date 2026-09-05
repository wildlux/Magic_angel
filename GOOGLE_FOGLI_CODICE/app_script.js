function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var reviews = [];

  for (var i = 1; i < rows.length; i++) {
    var nome = String(rows[i][1] || "").trim();        // Colonna B
    var motivo = String(rows[i][3] || "").trim();      // Colonna D
    var valutazione = parseInt(rows[i][4]) || 5;        // Colonna E
    var messaggio = String(rows[i][5] || "").trim();   // Colonna F
    var consenso = String(rows[i][6] || "").trim();    // Colonna G

    var haConsenso = consenso.toLowerCase().indexOf("sì") !== -1 || consenso.toLowerCase().indexOf("autorizzo") !== -1;

    if (messaggio !== "" && haConsenso) {
      var stelle = "⭐".repeat(Math.min(Math.max(valutazione, 1), 5));

      reviews.push({
        nome: nome || "Anonimo",
        messaggio: messaggio,
        valutazione: stelle
      });
    }
  }

  return ContentService
  .createTextOutput(JSON.stringify(reviews))
  .setMimeType(ContentService.MimeType.JSON);
}

// Gestione pre-flight CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
  .setMimeType(ContentService.MimeType.TEXT);
}
