/*
تعليمات الربط مع Google Sheets:
1. افتح Google Sheet للحملات.
2. Extensions > Apps Script.
3. الصق هذا الكود كاملًا.
4. ضع CAMPAIGN_SHEET_ID الصحيح، وضع JOBS_SHEET_ID إذا أردت ملف وظائف منفصل.
5. شغّل setupCampaignSheet مرة واحدة فقط لإعادة إنشاء العناوين الصحيحة.
6. Deploy > New deployment أو Manage deployments > Edit > New version.
7. Execute as: Me.
8. Who has access: Anyone.
9. انسخ Web App URL وضعه في GOOGLE_SCRIPT_URL داخل script.js.
*/

const CAMPAIGN_SHEET_ID = "1ToD5hxa_6fefZKwxSe2mAO9hSGFb2LAT_fHwr4xN3ig";
const CAMPAIGN_SHEET_NAME = "Leads";
const CAMPAIGN_IMAGES_FOLDER_NAME = "DAL Campaign Images";

const CAMPAIGN_HEADERS = [
  "التاريخ والوقت",
  "هدف الإعلان",
  "الميزانية",
  "عدد الأيام",
  "الوصول اليومي",
  "إجمالي الوصول",
  "إجمالي التكلفة",
  "المحافظة",
  "العمر من",
  "العمر إلى",
  "الجنس",
  "اللغات",
  "نص المنشور",
  "الوصف المختصر",
  "الوصف الطويل",
  "رقم واتساب",
  "رابط الموقع",
  "روابط الصور في Drive",
  "رابط صورة الشعار في Drive",
  "رقم هاتف المعلن",
  "رقم الهاتف في الإعلان",
  "اسم العميل"
];

const JOBS_SHEET_ID = "PUT_YOUR_JOBS_GOOGLE_SHEET_ID_HERE";
const JOBS_SHEET_NAME = "Jobs";

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";

    if (action === "campaignStats") {
      return jsonResponse({
        success: true,
        campaignRequests: getCampaignRequestsCount()
      });
    }

    return jsonResponse({
      success: true,
      message: "DAL Campaign API is running"
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    if (data.formType === "jobApplication") {
      appendJobApplication(data);
    } else {
      appendCampaignLead(data);
    }

    return jsonResponse({
      success: true,
      campaignRequests: getCampaignRequestsCount()
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function setupCampaignSheet() {
  const sheet = getCampaignSheet();
  sheet.clear();
  ensureCampaignHeaders(sheet);
  trimExtraColumns(sheet);
  formatCampaignHeader(sheet);
}

function appendCampaignLead(data) {
  const sheet = getCampaignSheet();
  ensureCampaignSheetReady(sheet);

  const uploadedImages = saveDriveFiles(data.imageFiles || []);
  const uploadedLogo = saveDriveFiles(data.logoFile && data.logoFile.data ? [data.logoFile] : []);
  const row = buildCampaignRow(data, uploadedImages, uploadedLogo);
  const nextRow = Math.max(sheet.getLastRow() + 1, 2);

  sheet.getRange(nextRow, 1, 1, CAMPAIGN_HEADERS.length).setValues([row]);
  formatCampaignRow(sheet, nextRow);
}

function buildCampaignRow(data, uploadedImages, uploadedLogo) {
  return [
    data.submittedAt || new Date().toISOString(),
    data.campaignGoal || "",
    asDollarValue(data.budget),
    data.days || "",
    data.dailyReach || "",
    data.totalReach || "",
    asDollarValue(data.totalCost || data.budget),
    data.governorates || "",
    data.ageFrom || "",
    data.ageTo || "",
    data.gender || "",
    data.languages || "",
    data.caption || "",
    data.shortDescription || "",
    data.longDescription || "",
    data.whatsappNumber || "",
    data.destinationUrl || "",
    uploadedImages.join("\n"),
    uploadedLogo.join("\n"),
    data.phone || "",
    data.contactNumber || "",
    data.customerName || ""
  ];
}

function ensureCampaignSheetReady(sheet) {
  if (!hasExactCampaignHeaders(sheet)) {
    sheet.clear();
  }

  ensureCampaignHeaders(sheet);
  trimExtraColumns(sheet);
  formatCampaignHeader(sheet);
}

function ensureCampaignHeaders(sheet) {
  ensureColumnCount(sheet, CAMPAIGN_HEADERS.length);
  sheet.getRange(1, 1, 1, CAMPAIGN_HEADERS.length).setValues([CAMPAIGN_HEADERS]);
  sheet.setFrozenRows(1);
}

function hasExactCampaignHeaders(sheet) {
  if (sheet.getLastRow() < 1 || sheet.getLastColumn() < CAMPAIGN_HEADERS.length) {
    return false;
  }

  const currentHeaders = sheet
    .getRange(1, 1, 1, CAMPAIGN_HEADERS.length)
    .getValues()[0]
    .map(normalizeText);

  return CAMPAIGN_HEADERS.every((header, index) => currentHeaders[index] === normalizeText(header));
}

function getCampaignRequestsCount() {
  const sheet = getCampaignSheet();
  ensureCampaignSheetReady(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return 0;
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, CAMPAIGN_HEADERS.length).getValues();
  return rows.filter((row) => row.some((cell) => String(cell || "").trim())).length;
}

function formatCampaignHeader(sheet) {
  sheet.getRange(1, 1, 1, CAMPAIGN_HEADERS.length)
    .setFontFamily("Calibri")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#d60000")
    .setBackground("#ffe01b")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  sheet.autoResizeColumns(1, CAMPAIGN_HEADERS.length);
}

function formatCampaignRow(sheet, rowNumber) {
  sheet.getRange(rowNumber, 1, 1, CAMPAIGN_HEADERS.length)
    .setFontFamily("Calibri")
    .setFontSize(12)
    .setFontWeight("normal")
    .setFontColor("#000000")
    .setBackground("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true)
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange(rowNumber, 3).setNumberFormat("$#,##0");
  sheet.getRange(rowNumber, 7).setNumberFormat("$#,##0");
}

function saveDriveFiles(files) {
  if (!files.length) {
    return [];
  }

  const folder = getOrCreateFolder(CAMPAIGN_IMAGES_FOLDER_NAME);

  return files
    .filter((file) => file && file.data)
    .map((file) => {
      const bytes = Utilities.base64Decode(file.data);
      const blob = Utilities.newBlob(bytes, file.mimeType || "application/octet-stream", file.name || "dal-file");
      const savedFile = folder.createFile(blob);
      savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return savedFile.getUrl();
    });
}

function appendJobApplication(data) {
  const sheet = SpreadsheetApp.openById(JOBS_SHEET_ID).getSheetByName(JOBS_SHEET_NAME);

  if (!sheet) {
    throw new Error("Jobs sheet not found");
  }

  sheet.appendRow([
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

function getCampaignSheet() {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  return sheet;
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(folderName);
}

function ensureColumnCount(sheet, count) {
  const currentColumns = sheet.getMaxColumns();
  if (currentColumns < count) {
    sheet.insertColumnsAfter(currentColumns, count - currentColumns);
  }
}

function trimExtraColumns(sheet) {
  const currentColumns = sheet.getMaxColumns();
  if (currentColumns > CAMPAIGN_HEADERS.length) {
    sheet.deleteColumns(CAMPAIGN_HEADERS.length + 1, currentColumns - CAMPAIGN_HEADERS.length);
  }
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function asDollarValue(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const number = Number(String(value).replace("$", ""));
  return Number.isFinite(number) ? number : value;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
