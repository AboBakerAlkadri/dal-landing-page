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
  // تنبيه: هذه الدالة تمسح بيانات الاختبار القديمة وتعيد إنشاء العناوين الصحيحة فقط.
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  resetCampaignSheet();
}

function authorizeDriveAccess() {
  const folder = getOrCreateFolder(CAMPAIGN_IMAGES_FOLDER_NAME);
  return folder.getUrl();
}

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
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType || "campaignLead";

    if (formType === "jobApplication") {
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

function appendCampaignLead(data) {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);

  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }

  ensureCleanCampaignSheetStructure(sheet);
  const uploadedImages = saveCampaignImages(data.imageFiles || []);
  const uploadedLogo = saveCampaignLogo(data.logoFile);
  const row = buildCampaignRow(data, uploadedImages, uploadedLogo);
  const nextRow = sheet.getLastRow() + 1;

  sheet.getRange(nextRow, 1, 1, CAMPAIGN_HEADERS.length).setValues([row]);
  formatCampaignSheet(sheet);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
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
  ensureCampaignColumnCount(sheet);
  sheet.getRange(1, 1, 1, CAMPAIGN_HEADERS.length).setValues([CAMPAIGN_HEADERS]);
  sheet.setFrozenRows(1);
}

function resetCampaignSheet() {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);
  if (!sheet) {
    throw new Error("Campaign sheet not found");
  }
  sheet.clear();
  ensureCleanCampaignSheetStructure(sheet);
  formatCampaignSheet(sheet);
}

function ensureCleanCampaignSheetStructure(sheet) {
  if (shouldResetCorruptedCampaignSheet(sheet)) {
    sheet.clear();
  }

  ensureCampaignColumnCount(sheet);
  trimExtraCampaignColumns(sheet);
  ensureCampaignHeaders(sheet);
  removeHeaderLikeRows(sheet);
}

function shouldResetCorruptedCampaignSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (!lastRow || !lastColumn) {
    return false;
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map((header) => normalizeHeaderName(header));
  const expectedHeaders = CAMPAIGN_HEADERS.map((header) => normalizeHeaderName(header));
  const deprecatedHeaders = [
    "نوع النموذج",
    "كود الهدف",
    "المدينة",
    "المحافظة",
    "المحافظات",
    "المناطق",
    "الاهتمامات",
    "أسماء الصور المختارة",
    "أسماء الصور المحفوظة",
    "اسم ملف الشعار"
  ].map((header) => normalizeHeaderName(header));

  const hasDeprecatedHeader = headers.some((header) => deprecatedHeaders.includes(header));
  const hasWrongFirstHeaders = expectedHeaders.some((header, index) => headers[index] && headers[index] !== header);

  if (hasDeprecatedHeader || hasWrongFirstHeaders) {
    return true;
  }

  if (lastRow <= 1) {
    return false;
  }

  const sampleRows = sheet.getRange(2, 1, Math.min(lastRow - 1, 20), lastColumn).getValues();
  return sampleRows.some((row) => {
    const firstCell = String(row[0] || "").trim();
    return firstCell === "campaignLead" || firstCell === "jobApplication" || isHeaderLikeRow(row);
  });
}

function getCampaignRequestsCount() {
  const sheet = SpreadsheetApp.openById(CAMPAIGN_SHEET_ID).getSheetByName(CAMPAIGN_SHEET_NAME);
  if (!sheet) {
    return 0;
  }

  ensureCleanCampaignSheetStructure(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return 0;
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, CAMPAIGN_HEADERS.length).getValues();
  return rows.filter((row) => !isEmptyRow(row) && !isHeaderLikeRow(row)).length;
}

function getNormalizedCampaignRows(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow <= 1 || !lastColumn) {
    return [];
  }

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0].map((cell) => normalizeHeaderName(cell));
  const rows = values.slice(1);

  return rows
    .filter((row) => !isEmptyRow(row))
    .filter((row) => !isHeaderLikeRow(row))
    .map((row) => normalizeCampaignRow(row, headers))
    .filter((row) => !isEmptyRow(row));
}

function normalizeCampaignRow(row, headers) {
  if (String(row[0] || "").trim() === "campaignLead") {
    return normalizeLegacyCampaignRow(row);
  }

  return CAMPAIGN_HEADERS.map((header) => {
    const index = findHeaderIndex(headers, header);
    return index === -1 ? "" : row[index];
  });
}

function normalizeLegacyCampaignRow(row) {
  return CAMPAIGN_HEADERS.map((header) => {
    const legacyValue = getLegacyCampaignValue(row, header);
    return legacyValue === undefined ? "" : legacyValue;
  });
}

function findHeaderIndex(headers, header) {
  const aliases = getHeaderAliases(header).map((name) => normalizeHeaderName(name));
  return headers.findIndex((name) => aliases.includes(name));
}

function getHeaderAliases(header) {
  const aliases = {
    "المحافظات المستهدفة": ["المحافظات المستهدفة", "المحافظات", "المحافظة", "المناطق"],
    "اللغات": ["اللغات", "اللغة"],
    "روابط الصور في Drive": ["روابط الصور في Drive", "أسماء الصور المختارة", "أسماء الصور المحفوظة"],
    "رابط شعار العميل في Drive": ["رابط شعار العميل في Drive", "اسم ملف الشعار"],
    "رابط الموقع": ["رابط الموقع", "رابط الموقع الإلكتروني"],
    "رقم هاتف المعلن": ["رقم هاتف المعلن", "رقم الهاتف"],
    "رقم الهاتف في الإعلان": ["رقم الهاتف في الإعلان", "رقم التواصل"]
  };

  return aliases[header] || [header];
}

function normalizeHeaderName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isEmptyRow(row) {
  return row.every((cell) => !String(cell || "").trim());
}

function isHeaderLikeRow(row) {
  const headerWords = new Set(CAMPAIGN_HEADERS.concat([
    "نوع النموذج",
    "كود الهدف",
    "المدينة",
    "المحافظة",
    "المحافظات",
    "المناطق",
    "اسم ملف الشعار",
    "أسماء الصور المحفوظة",
    "أسماء الصور المختارة"
  ]).map((header) => normalizeHeaderName(header)));
  const filledCells = row.map((cell) => normalizeHeaderName(cell)).filter(Boolean);
  const matchingHeaders = filledCells.filter((cell) => headerWords.has(cell));

  return filledCells.length > 0 && matchingHeaders.length >= Math.min(3, filledCells.length);
}

function ensureCampaignColumnCount(sheet) {
  const currentColumns = sheet.getMaxColumns();

  if (currentColumns < CAMPAIGN_HEADERS.length) {
    sheet.insertColumnsAfter(currentColumns, CAMPAIGN_HEADERS.length - currentColumns);
  }
}

function trimExtraCampaignColumns(sheet) {
  const maxColumns = sheet.getMaxColumns();

  if (maxColumns > CAMPAIGN_HEADERS.length) {
    sheet.deleteColumns(CAMPAIGN_HEADERS.length + 1, maxColumns - CAMPAIGN_HEADERS.length);
  }
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
  const lastColumn = sheet.getLastColumn();

  if (!lastColumn) {
    return;
  }

  const firstHeader = String(sheet.getRange(1, 1).getValue() || "").trim();

  if (firstHeader === "نوع النموذج") {
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

function repairLegacyCampaignLeadRows(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow <= 1 || !lastColumn) {
    return;
  }

  const rowsRange = sheet.getRange(2, 1, lastRow - 1, Math.max(lastColumn, CAMPAIGN_HEADERS.length));
  const rows = rowsRange.getValues();
  let changed = false;

  const repairedRows = rows.map((row) => {
    if (String(row[0] || "").trim() !== "campaignLead") {
      return row.slice(0, CAMPAIGN_HEADERS.length);
    }

    changed = true;
    return CAMPAIGN_HEADERS.map((header) => {
      const legacyValue = getLegacyCampaignValue(row, header);
      return legacyValue === undefined ? "" : legacyValue;
    });
  });

  if (changed) {
    sheet.getRange(2, 1, repairedRows.length, CAMPAIGN_HEADERS.length).setValues(repairedRows);
  }
}

function getLegacyCampaignValue(row, header) {
  const legacyMap = {
    "التاريخ والوقت": 1,
    "هدف الإعلان": 2,
    "الميزانية": 4,
    "عدد الأيام": 5,
    "الوصول اليومي": 6,
    "إجمالي الوصول": 7,
    "إجمالي التكلفة": 8,
    "المحافظات المستهدفة": 10,
    "العمر من": 13,
    "العمر إلى": 14,
    "الجنس": 15,
    "اللغات": 17,
    "نص المنشور": 19,
    "الوصف المختصر": 20,
    "الوصف الطويل": 21,
    "رقم واتساب": 22,
    "رابط الموقع": 23,
    "روابط الصور في Drive": 25,
    "رابط شعار العميل في Drive": 26,
    "رقم هاتف المعلن": 27,
    "رقم الهاتف في الإعلان": 28,
    "اسم العميل": 29
  };

  return row[legacyMap[header]];
}

function formatCampaignSheet(sheet) {
  const headersCount = CAMPAIGN_HEADERS.length;
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
