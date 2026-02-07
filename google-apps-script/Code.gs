/**
 * RESPOND Safeguarding Simulator — Google Sheet Logger
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire script into Code.gs
 * 4. Click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL
 * 6. Paste it into GOOGLE_SHEET_WEBHOOK in your simulator's index.html
 * 7. Redeploy on Netlify
 *
 * The script auto-creates headers on first run.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Scenario Title",
        "Setting",
        "Hidden Issue",
        "Overall Score",
        "Grade",
        "RAG Final",
        "R — Recognise",
        "E — Engage",
        "S — Support",
        "P — Pause",
        "O — Offer",
        "N — Notify",
        "D — Document",
        "Strengths",
        "Areas for Development",
        "Key Learning",
        "Statutory References",
        "User Responses"
      ];
      sheet.appendRow(headers);
      
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#243044");
      headerRange.setFontColor("#F1F5F9");
      headerRange.setHorizontalAlignment("center");
      
      // Set column widths
      sheet.setColumnWidth(1, 160);  // Timestamp
      sheet.setColumnWidth(2, 200);  // Title
      sheet.setColumnWidth(3, 150);  // Setting
      sheet.setColumnWidth(4, 250);  // Hidden Issue
      sheet.setColumnWidth(5, 80);   // Overall Score
      sheet.setColumnWidth(6, 130);  // Grade
      sheet.setColumnWidth(7, 80);   // RAG
      for (var i = 8; i <= 14; i++) sheet.setColumnWidth(i, 80); // Step scores
      sheet.setColumnWidth(15, 300); // Strengths
      sheet.setColumnWidth(16, 300); // Areas
      sheet.setColumnWidth(17, 300); // Key Learning
      sheet.setColumnWidth(18, 250); // Statutory
      sheet.setColumnWidth(19, 500); // Responses
      
      // Freeze header
      sheet.setFrozenRows(1);
    }
    
    // Format timestamp
    var ts = data.timestamp ? new Date(data.timestamp) : new Date();
    var formattedTs = Utilities.formatDate(ts, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    // Append data row
    var row = [
      formattedTs,
      data.scenario_title || "",
      data.scenario_setting || "",
      data.hidden_issue || "",
      data.overall_score || "",
      data.grade || "",
      data.rag_final || "",
      data.score_recognise || "",
      data.score_engage || "",
      data.score_support || "",
      data.score_pause || "",
      data.score_offer || "",
      data.score_notify || "",
      data.score_document || "",
      data.strengths || "",
      data.areas_for_development || "",
      data.key_learning || "",
      data.statutory_references || "",
      data.user_responses || ""
    ];
    
    sheet.appendRow(row);
    
    // Conditional formatting for grade column (column 6)
    var lastRow = sheet.getLastRow();
    var gradeCell = sheet.getRange(lastRow, 6);
    var grade = data.grade || "";
    if (grade === "Outstanding") { gradeCell.setBackground("#ECFDF5").setFontColor("#059669"); }
    else if (grade === "Good") { gradeCell.setBackground("#EFF6FF").setFontColor("#2563EB"); }
    else if (grade === "Requires Improvement") { gradeCell.setBackground("#FFFBEB").setFontColor("#D97706"); }
    else if (grade === "Inadequate") { gradeCell.setBackground("#FEF2F2").setFontColor("#DC2626"); }
    
    // Conditional formatting for RAG column (column 7)
    var ragCell = sheet.getRange(lastRow, 7);
    var rag = data.rag_final || "";
    if (rag === "GREEN") { ragCell.setBackground("#ECFDF5").setFontColor("#059669"); }
    else if (rag === "AMBER") { ragCell.setBackground("#FFFBEB").setFontColor("#D97706"); }
    else if (rag === "RED") { ragCell.setBackground("#FEF2F2").setFontColor("#DC2626"); }
    
    // Conditional formatting for step score cells (columns 8-14)
    for (var col = 8; col <= 14; col++) {
      var cell = sheet.getRange(lastRow, col);
      var val = cell.getValue();
      if (val !== "" && !isNaN(val)) {
        if (val >= 7) { cell.setBackground("#ECFDF5").setFontColor("#059669"); }
        else if (val >= 4) { cell.setBackground("#FFFBEB").setFontColor("#D97706"); }
        else { cell.setBackground("#FEF2F2").setFontColor("#DC2626"); }
      }
    }
    
    // Overall score formatting (column 5)
    var scoreCell = sheet.getRange(lastRow, 5);
    var scoreVal = data.overall_score;
    if (scoreVal >= 75) { scoreCell.setBackground("#ECFDF5").setFontColor("#059669").setFontWeight("bold"); }
    else if (scoreVal >= 50) { scoreCell.setBackground("#FFFBEB").setFontColor("#D97706").setFontWeight("bold"); }
    else { scoreCell.setBackground("#FEF2F2").setFontColor("#DC2626").setFontWeight("bold"); }
    
    return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run manually to verify script works
function testDoPost() {
  var testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        scenario_title: "Test Scenario",
        scenario_setting: "Boarding house, Tuesday evening",
        hidden_issue: "Emotional abuse masked as academic pressure",
        overall_score: 72,
        grade: "Good",
        rag_final: "AMBER",
        score_recognise: 8,
        score_engage: 7,
        score_support: 6,
        score_pause: 8,
        score_offer: 7,
        score_notify: 9,
        score_document: 5,
        strengths: "Good professional curiosity | Appropriate engagement",
        areas_for_development: "Documentation needs more detail | Offer stage could be stronger",
        key_learning: "Always document using exact student words",
        statutory_references: "KCSIE 2025 Para 43 | Working Together 2023",
        user_responses: "[RECOGNISE] I notice the student looks withdrawn || [ENGAGE] I approach calmly and ask if everything is ok"
      })
    }
  };
  doPost(testData);
}
