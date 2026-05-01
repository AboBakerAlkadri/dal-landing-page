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
const CAMPAIGN_HEADERS = [
  "التاريخ والوقت",
  "هدف الإعلان",
  "الميزانية",
  "عدد الأيام",
  "الوصول اليومي",
  "إجمالي الوصول",
  "إجمالي التكلفة",
  "المحافظات المستهدفة",
  "العمر من",
  "العمر إلى",
  "الجنس",
  "اللغات",
  "الاهتمامات",
  "نص المنشور",
  "الوصف المختصر",
  "الوصف الطويل",
  "رقم واتساب",
  "رابط الموقع",
  "روابط الصور في Drive",
  "رابط شعار العميل في Drive",
  "رقم هاتف المعلن",
  "رقم الهاتف في الإعلان",
  "اسم العميل"
];

const JOBS_SHEET_ID = "PUT_YOUR_JOBS_GOOGLE_SHEET_ID_HERE";
const JOBS_SHEET_NAME = "Jobs";

function setupCampaignSheet() {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  removeDeprecatedCampaignColumns(sheet);
  removeCampaignTypeColumn(sheet);
  removeHeaderLikeRows(sheet);
  ensureCampaignHeaders(sheet);
  repairCampaignDateColumn(sheet);
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

  removeDeprecatedCampaignColumns(sheet);
  removeCampaignTypeColumn(sheet);
  removeHeaderLikeRows(sheet);
  ensureCampaignHeaders(sheet);
  const uploadedImages = saveCampaignImages(data.imageFiles || []);
  const uploadedLogo = saveCampaignLogo(data.logoFile);
  const row = buildCampaignRow(data, uploadedImages, uploadedLogo);

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, CAMPAIGN_HEADERS.length).setValues([row]);
  formatCampaignSheet(sheet, CAMPAIGN_HEADERS.length);
}

function buildCampaignRow(data, uploadedImages, uploadedLogo) {
  const rowByHeader = {
    "التاريخ والوقت": data.submittedAt || new Date().toISOString(),
    "هدف الإعلان": data.campaignGoal || "",
    "الميزانية": data.budget || "",
    "عدد الأيام": data.days || "",
    "الوصول اليومي": data.dailyReach || "",
    "إجمالي الوصول": data.totalReach || "",
    "إجمالي التكلفة": data.totalCost || "",
    "المحافظات المستهدفة": data.governorates || data.regions || data.governorate || "",
    "العمر من": data.ageFrom || "",
    "العمر إلى": data.ageTo || "",
    "الجنس": data.gender || "",
    "اللغات": data.languages || data.language || "",
    "الاهتمامات": data.interests || "",
    "نص المنشور": data.caption || "",
    "الوصف المختصر": data.shortDescription || "",
    "الوصف الطويل": data.longDescription || "",
    "رقم واتساب": data.whatsappNumber || "",
    "رابط الموقع": data.destinationUrl || "",
    "روابط الصور في Drive": uploadedImages.urls,
    "رابط شعار العميل في Drive": uploadedLogo.url,
    "رقم هاتف المعلن": data.phone || "",
    "رقم الهاتف في الإعلان": data.contactNumber || "",
    "اسم العميل": data.customerName || ""
  };

  return CAMPAIGN_HEADERS.map((header) => rowByHeader[header] || "");
}

function ensureCampaignHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.insertRowBefore(1);
  }

  sheet.getRange(1, 1, 1, CAMPAIGN_HEADERS.length).setValues([CAMPAIGN_HEADERS]);
  sheet.setFrozenRows(1);

  formatCampaignSheet(sheet, CAMPAIGN_HEADERS.length);
}

function removeDeprecatedCampaignColumns(sheet) {
  const deprecatedHeaders = [
    "نوع النموذج",
    "كود الهدف",
    "المدينة",
    "اللغة",
    "المحافظة",
    "المحافظات",
    "المناطق",
    "أسماء الصور المختارة",
    "أسماء الصور المحفوظة",
    "اسم ملف الشعار"
  ];
  const lastColumn = sheet.getLastColumn();

  if (!lastColumn) {
    return;
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  for (let index = headers.length - 1; index >= 0; index -= 1) {
    if (deprecatedHeaders.includes(headers[index])) {
      sheet.deleteColumn(index + 1);
    }
  }
}

function removeCampaignTypeColumn(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (!lastRow || !lastColumn) {
    return;
  }

  const firstHeader = String(sheet.getRange(1, 1).getValue() || "").trim();
  const firstColumnValues = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map((value) => String(value || "").trim())
    : [];
  const hasFormTypeValues = firstColumnValues.some((value) => value === "campaignLead" || value === "jobApplication");

  if (firstHeader === "نوع النموذج" || hasFormTypeValues) {
    sheet.deleteColumn(1);
  }
}

function removeHeaderLikeRows(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow <= 1 || !lastColumn) {
    return;
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  const headerWords = new Set(CAMPAIGN_HEADERS.concat([
    "نوع النموذج",
    "كود الهدف",
    "المدينة",
    "المحافظة",
    "المحافظات",
    "المناطق",
    "اسم ملف الشعار",
    "أسماء الصور المحفوظة"
  ]));

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const filledCells = rows[index].filter((cell) => String(cell).trim());
    const matchingHeaders = filledCells.filter((cell) => headerWords.has(String(cell).trim()));

    if (filledCells.length && matchingHeaders.length >= Math.min(3, filledCells.length)) {
      sheet.deleteRow(index + 2);
    }
  }
}

function repairCampaignDateColumn(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow <= 1 || !lastColumn) {
    return;
  }

  const range = sheet.getRange(2, 1, lastRow - 1, lastColumn);
  const rows = range.getValues();
  const knownGoalValues = [
    "مشاهدات ووصول",
    "تفاعل مع الفيديو والمنشور",
    "تلقي رسائل",
    "تلقي مكالمات",
    "زيارة موقع إلكتروني",
    "اختبار",
    "test"
  ];

  const repairedRows = rows.map((row) => {
    const firstCell = String(row[0] || "").trim();

    if (isDateLikeValue(firstCell)) {
      return row;
    }

    const dateIndex = row.findIndex((cell) => isDateLikeValue(cell));

    if (dateIndex > 0) {
      row[0] = row[dateIndex];
      row[dateIndex] = "";
      return row;
    }

    if (knownGoalValues.includes(firstCell)) {
      row[0] = "";
    }

    return row;
  });

  range.setValues(repairedRows);
  formatCampaignSheet(sheet, CAMPAIGN_HEADERS.length);
}

function isDateLikeValue(value) {
  if (value instanceof Date) {
    return true;
  }

  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}T/.test(text) || /^\d{4}[/-]\d{1,2}[/-]\d{1,2}/.test(text);
}

function formatCampaignSheet(sheet, headersCount) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const fullRange = sheet.getRange(1, 1, lastRow, headersCount);

  fullRange
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.getRange(1, 1, 1, headersCount)
    .setFontFamily("Calibri")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#d60000")
    .setBackground("#ffe01b")
    .setHorizontalAlignment("center");

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headersCount)
      .setFontFamily("Calibri")
      .setFontSize(12)
      .setFontWeight("normal")
      .setFontColor("#000000")
      .setBackground("#ffffff")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    sheet.getRange(2, 3, lastRow - 1, 1).setNumberFormat("$#,##0");
    sheet.getRange(2, 7, lastRow - 1, 1).setNumberFormat("$#,##0");
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

function saveCampaignLogo(logoFile) {
  if (!logoFile || !logoFile.data) {
    return {
      url: ""
    };
  }

  const folder = getOrCreateFolder(CAMPAIGN_IMAGES_FOLDER_NAME);
  const bytes = Utilities.base64Decode(logoFile.data);
  const blob = Utilities.newBlob(bytes, logoFile.mimeType, logoFile.name);
  const savedFile = folder.createFile(blob);
  savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    url: savedFile.getUrl()
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
