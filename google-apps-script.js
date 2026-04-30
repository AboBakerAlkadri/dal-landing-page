/*
تعليمات الربط مع Google Sheets:
1. افتح Google Sheet للحملات.
2. Extensions > Apps Script.
3. الصق هذا الكود.
4. ضع CAMPAIGN_SHEET_ID الصحيح، وضع JOBS_SHEET_ID إذا أردت ملف وظائف منفصل.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. انسخ Web App URL وضعه في GOOGLE_SCRIPT_URL داخل script.js.
*/

const CAMPAIGN_SHEET_ID = "PUT_YOUR_CAMPAIGN_GOOGLE_SHEET_ID_HERE";
const CAMPAIGN_SHEET_NAME = "Leads";

const JOBS_SHEET_ID = "PUT_YOUR_JOBS_GOOGLE_SHEET_ID_HERE";
const JOBS_SHEET_NAME = "Jobs";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType || "campaignLead";

    if (formType === "jobApplication") {
      appendJobApplication(data);
    } else {
      appendCampaignLead(data);
    }

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

function appendCampaignLead(data) {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  sheet.appendRow([
    data.formType || "campaignLead",
    data.submittedAt || new Date().toISOString(),
    data.campaignGoal || "",
    data.campaignGoalType || "",
    data.budget || "",
    data.days || "",
    data.dailyReach || "",
    data.totalReach || "",
    data.totalCost || "",
    data.governorate || "",
    data.governorates || "",
    data.city || "",
    data.regions || "",
    data.ageFrom || "",
    data.ageTo || "",
    data.gender || "",
    data.language || "",
    data.languages || "",
    data.interests || "",
    data.caption || "",
    data.shortDescription || "",
    data.longDescription || "",
    data.whatsappNumber || "",
    data.destinationUrl || "",
    data.imageFileName || "",
      data.logoFileName || "",
      data.phone || "",
      data.contactNumber || "",
      data.customerName || ""
    ]);
}

function appendJobApplication(data) {
  const sheet = SpreadsheetApp.openById(JOBS_SHEET_ID).getSheetByName(JOBS_SHEET_NAME);

  if (!sheet) {
    throw new Error("Jobs sheet not found");
  }

  sheet.appendRow([
    data.formType || "jobApplication",
    data.submittedAt || new Date().toISOString(),
    data.fullName || "",
    data.customerId || "",
    data.phone || "",
    data.whatsappNumber || "",
    data.email || "",
    data.jobTitle || "",
    data.city || "",
    data.experience || "",
    data.cvFileName || "",
    data.notes || ""
  ]);
}
