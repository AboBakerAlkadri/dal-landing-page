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

const CAMPAIGN_SHEET_ID = "1ToD5hxa_6fefZKwxSe2mAO9hSGFb2LAT_fHwr4xN3ig";
const CAMPAIGN_SHEET_NAME = "Leads";
const CAMPAIGN_IMAGES_FOLDER_NAME = "DAL Campaign Images";

const JOBS_SHEET_ID = "PUT_YOUR_JOBS_GOOGLE_SHEET_ID_HERE";
const JOBS_SHEET_NAME = "Jobs";

function setupCampaignSheet() {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  ensureCampaignHeaders(sheet);
}

function authorizeDriveAccess() {
  const folder = getOrCreateFolder(CAMPAIGN_IMAGES_FOLDER_NAME);
  return folder.getUrl();
}

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

  ensureCampaignHeaders(sheet);
  const uploadedImages = saveCampaignImages(data.imageFiles || []);

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
    uploadedImages.urls,
    data.logoFileName || "",
    data.phone || "",
    data.contactNumber || "",
    data.customerName || ""
  ]);
}

function ensureCampaignHeaders(sheet) {
  const headers = [
    "نوع النموذج",
    "التاريخ والوقت",
    "هدف الإعلان",
    "كود الهدف",
    "الميزانية",
    "عدد الأيام",
    "الوصول اليومي",
    "إجمالي الوصول",
    "إجمالي التكلفة",
    "المحافظة",
    "المحافظات",
    "المدينة",
    "المناطق",
    "العمر من",
    "العمر إلى",
    "الجنس",
    "اللغة",
    "اللغات",
    "الاهتمامات",
    "نص المنشور",
    "الوصف المختصر",
    "الوصف الطويل",
    "رقم واتساب",
    "رابط الموقع",
    "روابط الصور في Drive",
    "اسم ملف الشعار",
    "رقم هاتف المعلن",
    "رقم الهاتف في الإعلان",
    "اسم العميل"
  ];

  if (sheet.getRange(1, 1).getValue() !== headers[0]) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  formatCampaignSheet(sheet, headers.length);
}

function formatCampaignSheet(sheet, headersCount) {
  const lastRow = Math.max(sheet.getLastRow(), 1);

  sheet.getRange(1, 1, 1, headersCount)
    .setFontFamily("Calibri")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#d60000")
    .setBackground("#ffe01b")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headersCount)
      .setFontFamily("Calibri")
      .setFontSize(12)
      .setFontWeight("normal")
      .setFontColor("#000000")
      .setBackground("#ffffff")
      .setVerticalAlignment("middle");
  }

  sheet.autoResizeColumns(1, headersCount);
}

function saveCampaignImages(imageFiles) {
  if (!imageFiles.length) {
    return {
      names: "",
      urls: ""
    };
  }

  const folder = getOrCreateFolder(CAMPAIGN_IMAGES_FOLDER_NAME);
  const savedFiles = imageFiles.map((file) => {
    const bytes = Utilities.base64Decode(file.data);
    const blob = Utilities.newBlob(bytes, file.mimeType, file.name);
    const savedFile = folder.createFile(blob);
    savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      name: savedFile.getName(),
      url: savedFile.getUrl()
    };
  });

  return {
    names: savedFiles.map((file) => file.name).join(", "),
    urls: savedFiles.map((file) => file.url).join(", ")
  };
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(folderName);
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
