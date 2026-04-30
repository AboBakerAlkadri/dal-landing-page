/*
تعليمات الربط مع Google Sheets:
1. افتح Google Sheet.
2. Extensions > Apps Script.
3. الصق هذا الكود.
4. ضع SHEET_ID الصحيح.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. انسخ Web App URL وضعه في GOOGLE_SCRIPT_URL داخل script.js.
*/

const SHEET_ID = "PUT_YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet not found");
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.campaignGoal || "",
      data.budget || "",
      data.days || "",
      data.dailyReach || "",
      data.totalReach || "",
      data.totalCost || "",
      data.audienceQuality || "",
      data.governorate || "",
      data.city || "",
      data.regions || "",
      data.ageFrom || "",
      data.ageTo || "",
      data.gender || "",
      data.interests || "",
      data.caption || "",
      data.shortDescription || "",
      data.longDescription || "",
      data.whatsappNumber || "",
      data.destinationUrl || "",
      data.imageFileName || "",
      data.phone || "",
      data.customerName || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
