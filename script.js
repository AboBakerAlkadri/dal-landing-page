const GOOGLE_SCRIPT_URL = "PUT_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const LINKS = {
  googlePlay: "https://play.google.com/store/apps/details?id=com.yashamDigital.dal&gl=DE",
  appStore: "https://apps.apple.com/eg/app/%D8%AF%D8%A7%D9%84-%D8%B3%D9%88%D8%B1%D9%8A%D8%A7/id6753619674?l=ar",
  alternativeDownload: "https://com-yashamdigital-dal.en.uptodown.com/android",
  addPost: "https://dalsyria.com/add-post",
  about: "https://dalsyria.com/about-us",
  support: "https://dalsyria.com/techsupport",
  blog: "https://dalsyria.com/blog",
  help: "https://dalsyria.com/blogs",
  rateApp: "https://play.google.com/store/apps/details?id=com.yashamDigital.dal&hl=en",
  jobs: "https://dalsyria.com/jobs",
  jobsApply: "https://dalsyria.com/jobs/apply",
  whatsapp: "https://wa.me/963939769472",
  facebook: "https://www.facebook.com/dalsyriacom",
  instagram: "https://www.instagram.com/dalsyriacom",
  tiktok: "https://www.tiktok.com/@dalsyriacom",
  youtube: "https://www.youtube.com/@Dalsyriacom",
  linkedin: "https://www.linkedin.com/company/dalsyriacom/",
  phone: "tel:0939769472"
};

const modal = document.getElementById("campaignModal");
const openCampaign = document.getElementById("openCampaign");
const openCampaignBanner = document.getElementById("openCampaignBanner");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const iframeModal = document.getElementById("iframeModal");
const linkFrame = document.getElementById("linkFrame");
const iframeTitle = document.getElementById("iframeTitle");
const quickContactToggle = document.getElementById("quickContactToggle");
const quickContactMenu = document.getElementById("quickContactMenu");
const form = document.getElementById("campaignForm");
const prevStepButton = document.getElementById("prevStep");
const nextStepButton = document.getElementById("nextStep");
const submitButton = document.getElementById("submitCampaign");
const formMessage = document.getElementById("formMessage");
const previewText = document.getElementById("previewText");
const previewShort = document.getElementById("previewShort");
const previewLong = document.getElementById("previewLong");
const previewImage = document.getElementById("previewImage");
const previewCta = document.getElementById("previewCta");
const previewLogo = document.getElementById("previewLogo");
const governorateOptions = document.getElementById("governorateOptions");

let currentStep = 1;
let previewImageUrls = [];
let previewLogoUrl = "";
const AGE_MIN = 18;
const AGE_MAX = 60;
const PRELOADER_MIN_TIME = 1400;
const pageStartTime = Date.now();

const SYRIA_LOCATIONS = {
  "دمشق": ["دمشق", "المزة", "المالكي", "أبو رمانة", "كفرسوسة", "الميدان", "برزة", "جرمانا"],
  "ريف دمشق": ["دوما", "داريا", "قدسيا", "صحنايا", "التل", "النبك", "الزبداني", "يبرود"],
  "حلب": ["حلب", "اعزاز", "الباب", "منبج", "عفرين", "السفيرة", "جرابلس", "عين العرب"],
  "حمص": ["حمص", "تدمر", "الرستن", "تلكلخ", "القصير", "المخرم", "الحولة"],
  "حماة": ["حماة", "مصياف", "السلمية", "محردة", "صوران", "طيبة الإمام", "كفرزيتا"],
  "اللاذقية": ["اللاذقية", "جبلة", "القرداحة", "الحفة", "رأس البسيط", "صلنفة"],
  "طرطوس": ["طرطوس", "بانياس", "صافيتا", "الدريكيش", "الشيخ بدر", "مشتى الحلو"],
  "إدلب": ["إدلب", "أريحا", "جسر الشغور", "معرة النعمان", "سراقب", "خان شيخون"],
  "درعا": ["درعا", "نوى", "الصنمين", "إزرع", "طفس", "بصرى الشام", "جاسم"],
  "السويداء": ["السويداء", "شهبا", "صلخد", "القريا", "عرمان", "ملح"],
  "القنيطرة": ["القنيطرة", "خان أرنبة", "جباتا الخشب", "البعث", "حضر"],
  "دير الزور": ["دير الزور", "الميادين", "البوكمال", "العشارة", "موحسن", "القورية"],
  "الرقة": ["الرقة", "الطبقة", "تل أبيض", "معدان", "الكرامة", "المنصورة"],
  "الحسكة": ["الحسكة", "القامشلي", "المالكية", "رأس العين", "عامودا", "الدرباسية"]
};

const GOAL_PREVIEW_CONFIG = {
  reach: {
    cta: "معرفة المزيد",
    tone: "awareness"
  },
  engagement: {
    cta: "زيارة الملف الشخصي",
    tone: "engagement"
  },
  messages: {
    cta: "إرسال رسالة",
    tone: "messages"
  },
  calls: {
    cta: "اتصال الآن",
    tone: "calls"
  },
  traffic: {
    cta: "زيارة الموقع",
    tone: "traffic"
  }
};

window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const elapsedTime = Date.now() - pageStartTime;
  const remainingTime = Math.max(PRELOADER_MIN_TIME - elapsedTime, 0);

  window.setTimeout(() => {
    preloader.classList.add("is-hidden");
    window.setTimeout(() => {
      preloader.remove();
    }, 450);
  }, remainingTime);
});

// ربط كل الروابط من مكان واحد لتسهيل التعديل.
document.querySelectorAll("[data-link]").forEach((element) => {
  const key = element.dataset.link;
  if (LINKS[key]) {
    element.href = LINKS[key];
    if (LINKS[key].startsWith("http") && !element.hasAttribute("data-direct-link")) {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        openIframe(LINKS[key], element.textContent.trim() || "تطبيق دال");
      });
    }
  }
});

populateGovernorates();

if (openCampaign) {
  openCampaign.addEventListener("click", () => {
    openCampaignModal();
  });
}

openCampaignBanner.addEventListener("click", openCampaignModal);

function openCampaignModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateGoalFields();
}

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelectorAll("[data-close-iframe]").forEach((button) => {
  button.addEventListener("click", closeIframe);
});

quickContactToggle.addEventListener("click", () => {
  quickContactMenu.hidden = !quickContactMenu.hidden;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openIframe(url, title) {
  iframeTitle.textContent = title || "تطبيق دال";
  linkFrame.src = url;
  iframeModal.classList.add("is-open");
  iframeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeIframe() {
  iframeModal.classList.remove("is-open");
  iframeModal.setAttribute("aria-hidden", "true");
  linkFrame.src = "about:blank";
  document.body.style.overflow = modal.classList.contains("is-open") ? "hidden" : "";
}

function updateStep() {
  document.querySelectorAll("[data-step]").forEach((step) => {
    step.classList.toggle("is-active", Number(step.dataset.step) === currentStep);
  });

  document.querySelectorAll("[data-step-pill]").forEach((pill) => {
    pill.classList.toggle("is-active", Number(pill.dataset.stepPill) <= currentStep);
  });

  form.classList.toggle("is-last-step", currentStep === 3);
  prevStepButton.disabled = currentStep === 1;
  clearMessage();
}

nextStepButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep = Math.min(currentStep + 1, 3);
  updateStep();
});

prevStepButton.addEventListener("click", () => {
  currentStep = Math.max(currentStep - 1, 1);
  updateStep();
});

form.addEventListener("input", () => {
  updateEstimate();
  updateGoalFields();
  updatePreview();
});

form.campaignGoal.addEventListener("change", updateGoalFields);
form.adImages.addEventListener("change", updatePreviewImage);
form.companyLogo.addEventListener("change", updatePreviewLogo);
form.budget.addEventListener("input", () => syncRangeFromNumber("budget"));
form.budgetRange.addEventListener("input", () => syncNumberFromRange("budget"));
form.days.addEventListener("input", () => syncRangeFromNumber("days"));
form.daysRange.addEventListener("input", () => syncNumberFromRange("days"));
form.ageFrom.addEventListener("input", () => syncRangeFromNumber("ageFrom"));
form.ageFromRange.addEventListener("input", () => syncNumberFromRange("ageFrom"));
form.ageTo.addEventListener("input", () => syncRangeFromNumber("ageTo"));
form.ageToRange.addEventListener("input", () => syncNumberFromRange("ageTo"));

document.querySelectorAll("[data-stepper]").forEach((button) => {
  button.addEventListener("click", () => {
    changeStepperValue(button.dataset.stepper, Number(button.dataset.change));
  });
});

window.handleCampaignGoalChange = function handleCampaignGoalChange() {
  updateGoalFields();
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  if (GOOGLE_SCRIPT_URL.includes("PUT_YOUR")) {
    showMessage("ضع رابط Google Apps Script Web App داخل script.js قبل الإرسال.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "جارٍ الإرسال...";
  clearMessage();

  try {
    const payload = buildPayload();
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error("Send failed");
    }

    form.reset();
    currentStep = 1;
    updateGovernorateSelection();
    updateEstimate();
    updatePreview();
    updatePreviewImage();
    updatePreviewLogo();
    normalizeAgeRange();
    updateStep();
    showMessage("تم إرسال طلبك بنجاح، سيتواصل معك فريق دال قريبًا.", "success");
  } catch (error) {
    showMessage("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "إرسال الطلب";
  }
});

function validateCurrentStep() {
  const activeStep = document.querySelector(`[data-step="${currentStep}"]`);
  const requiredFields = activeStep.querySelectorAll("[required]");

  for (const field of requiredFields) {
    const isEmptyMultipleSelect = field.tagName === "SELECT" && field.multiple && field.selectedOptions.length === 0;
    const isEmptyField = !field.multiple && !field.value.trim();

    if (isEmptyMultipleSelect || isEmptyField) {
      field.focus();
      showMessage("يرجى تعبئة الحقول الأساسية قبل المتابعة.", "error");
      return false;
    }
  }

  if (currentStep === 1) {
  }

  const ageFrom = Number(form.ageFrom.value);
  const ageTo = Number(form.ageTo.value);
  if (currentStep === 2) {
    if (getSelectedGovernorates().length === 0) {
      showMessage("يرجى اختيار محافظة واحدة على الأقل أو اختيار كامل سوريا.", "error");
      form.allSyria.focus();
      return false;
    }

    if (ageFrom < 18 || ageFrom > 60 || ageTo < 18 || ageTo > 60) {
      showMessage("العمر يجب أن يكون بين 18 و60 سنة.", "error");
      form.ageFrom.focus();
      return false;
    }

    if (ageFrom > ageTo) {
      showMessage("العمر من يجب أن يكون أقل من أو يساوي العمر إلى.", "error");
      form.ageFrom.focus();
      return false;
    }
  }

  if (currentStep === 3) {
    if (form.phone.value.trim() && !isValidPhoneNumber(form.phone.value)) {
      showMessage("يرجى إدخال رقم هاتف صحيح.", "error");
      form.phone.focus();
      return false;
    }

    if (form.whatsappNumber.value.trim() && !isValidPhoneNumber(form.whatsappNumber.value)) {
      showMessage("يرجى إدخال رقم واتساب صحيح مع رمز الدولة، مثال: 963939769472.", "error");
      form.whatsappNumber.focus();
      return false;
    }

    if (form.contactNumber.value.trim() && !isValidPhoneNumber(form.contactNumber.value)) {
      showMessage("يرجى إدخال رقم تواصل مباشر صحيح.", "error");
      form.contactNumber.focus();
      return false;
    }

    if (form.destinationUrl.value.trim() && !isValidUrl(form.destinationUrl.value)) {
      showMessage("يرجى إدخال رابط صحيح يبدأ بـ https:// أو http://.", "error");
      form.destinationUrl.focus();
      return false;
    }
  }

  clearMessage();
  return true;
}

function isValidPhoneNumber(value) {
  const normalized = value.replace(/[\s()+-]/g, "");
  return /^\d{8,15}$/.test(normalized);
}

function isValidUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (error) {
    return false;
  }
}

function updateEstimate() {
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const dailyBudget = days > 0 ? budget / days : 0;
  const dailyReach = Math.round(dailyBudget * 850);
  const totalReach = dailyReach * days;

  document.getElementById("dailyReach").textContent = formatNumber(dailyReach);
  document.getElementById("totalReach").textContent = formatNumber(totalReach);
  document.getElementById("totalCost").textContent = `$${formatNumber(budget)}`;
}

function updatePreview() {
  const caption = form.caption.value.trim();
  const shortDescription = form.shortDescription.value.trim();
  const longDescription = form.longDescription.value.trim();

  previewText.textContent = caption || "سيظهر نص الإعلان هنا أثناء الكتابة.";
  previewShort.textContent = shortDescription || "وصف مختصر للحملة";
  previewLong.textContent = longDescription || "تفاصيل الإعلان تظهر هنا بشكل مشابه لإعلانات فيسبوك.";
  const goalPreview = getGoalPreviewConfig();
  previewCta.textContent = goalPreview.cta;
  previewCta.dataset.goalTone = goalPreview.tone;

  if (previewImageUrls.length) {
    renderPreviewCarousel();
  }
}

function updateGoalFields() {
  const goalPreview = getGoalPreviewConfig();

  previewCta.textContent = goalPreview.cta;
  previewCta.dataset.goalTone = goalPreview.tone;

  if (previewImageUrls.length) {
    renderPreviewCarousel();
  }
}

function getGoalPreviewConfig() {
  const goalType = getSelectedGoalType();

  if (goalType === "traffic" && isAppDestination(form.destinationUrl.value)) {
    return {
      cta: "تثبيت الآن",
      tone: "traffic"
    };
  }

  return GOAL_PREVIEW_CONFIG[goalType] || {
    cta: "اختر هدف الحملة",
    tone: "default"
  };
}

function getSelectedGoalType() {
  return form.campaignGoal.value;
}

function getSelectedGoalLabel() {
  return form.campaignGoal.selectedOptions[0]?.dataset.label || "";
}

function isAppDestination(url) {
  const value = url.trim().toLowerCase();
  return value.includes("play.google.com") || value.includes("apps.apple.com") || value.includes("app");
}

function updatePreviewImage() {
  previewImageUrls.forEach((url) => URL.revokeObjectURL(url));
  previewImageUrls = Array.from(form.adImages.files).map((file, index) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    index
  }));
  renderPreviewCarousel();
}

function updatePreviewLogo() {
  if (previewLogoUrl) {
    URL.revokeObjectURL(previewLogoUrl);
    previewLogoUrl = "";
  }

  const file = form.companyLogo.files[0];
  if (!file) {
    previewLogo.src = "dal-icon.jpg";
    return;
  }

  previewLogoUrl = URL.createObjectURL(file);
  previewLogo.src = previewLogoUrl;
}

function renderPreviewCarousel() {
  previewImage.innerHTML = "";

  if (!previewImageUrls.length) {
    previewImage.innerHTML = '<i class="fa-regular fa-image" aria-hidden="true"></i>';
    return;
  }

  const carousel = document.createElement("div");
  carousel.className = `facebook-carousel ${previewImageUrls.length === 1 ? "is-single" : "is-multiple"}`;

  previewImageUrls.forEach((item) => {
    const card = document.createElement("article");
    card.className = "carousel-card";

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = `معاينة صورة الإعلان ${item.index + 1}`;

    const body = document.createElement("div");
    body.className = "carousel-card-body";

    const title = document.createElement("strong");
    title.textContent = form.shortDescription.value.trim() || `صورة الإعلان ${item.index + 1}`;

    const price = document.createElement("span");
    price.textContent = form.budget.value ? `${form.budget.value}$` : "ميزانية الحملة";

    const button = document.createElement("button");
    button.type = "button";
    const goalPreview = getGoalPreviewConfig();
    button.textContent = goalPreview.cta;
    button.dataset.goalTone = goalPreview.tone;

    body.append(title, price, button);
    card.append(image, body);
    carousel.appendChild(card);
  });

  previewImage.appendChild(carousel);
}

function populateGovernorates() {
  Object.keys(SYRIA_LOCATIONS).forEach((governorate) => {
    const label = document.createElement("label");
    label.className = "check-row";
    label.innerHTML = `<input type="checkbox" name="governorates" value="${governorate}"><span>${governorate}</span>`;
    governorateOptions.appendChild(label);
  });

  form.allSyria.addEventListener("change", updateGovernorateSelection);
  form.querySelectorAll('input[name="governorates"]').forEach((checkbox) => {
    checkbox.addEventListener("change", updateGovernorateSelection);
  });
}

function updateGovernorateSelection() {
  const allChecked = form.allSyria.checked;
  form.querySelectorAll('input[name="governorates"]').forEach((checkbox) => {
    checkbox.disabled = allChecked;
    checkbox.checked = allChecked ? false : checkbox.checked;
  });
}

function getSelectedGovernorates() {
  if (form.allSyria.checked) return ["كامل سوريا"];
  return Array.from(form.querySelectorAll('input[name="governorates"]:checked')).map((checkbox) => checkbox.value);
}

function syncRangeFromNumber(name) {
  const numberInput = form[name];
  const rangeInput = form[`${name}Range`];
  const min = Number(numberInput.min);
  const max = Number(numberInput.max);
  const value = Math.min(Math.max(Number(numberInput.value) || min, min), max);

  numberInput.value = value;
  rangeInput.value = value;
  if (name === "ageFrom" || name === "ageTo") {
    normalizeAgeRange(name);
  }
  updateEstimate();
  updatePreview();
}

function syncNumberFromRange(name) {
  form[name].value = form[`${name}Range`].value;
  if (name === "ageFrom" || name === "ageTo") {
    normalizeAgeRange(name);
  }
  updateEstimate();
  updatePreview();
}

function changeStepperValue(name, change) {
  const input = form[name];
  input.value = (Number(input.value) || 0) + change;
  syncRangeFromNumber(name);
}

function normalizeAgeRange(changedName = "") {
  let ageFrom = clampNumber(form.ageFrom.value, AGE_MIN, AGE_MAX);
  let ageTo = clampNumber(form.ageTo.value, AGE_MIN, AGE_MAX);

  if (ageFrom > ageTo) {
    if (changedName === "ageTo") {
      ageFrom = ageTo;
    } else {
      ageTo = ageFrom;
    }
  }

  form.ageFrom.value = ageFrom;
  form.ageFromRange.value = ageFrom;
  form.ageTo.value = ageTo;
  form.ageToRange.value = ageTo;

  form.ageFrom.max = ageTo;
  form.ageFromRange.max = ageTo;
  form.ageTo.min = ageFrom;
  form.ageToRange.min = ageFrom;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function buildPayload() {
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const dailyReach = Math.round((days > 0 ? budget / days : 0) * 850);
  const totalReach = dailyReach * days;
  const fileNames = Array.from(form.adImages.files).map((file) => file.name).join(", ");
  const logoFileName = form.companyLogo.files[0]?.name || "";
  const selectedGovernorates = getSelectedGovernorates();

  return {
    submittedAt: new Date().toISOString(),
    campaignGoal: getSelectedGoalLabel(),
    campaignGoalType: getSelectedGoalType(),
    budget,
    days,
    dailyReach,
    totalReach,
    totalCost: budget,
    governorate: selectedGovernorates.join(", "),
    governorates: selectedGovernorates.join(", "),
    city: "",
    regions: selectedGovernorates.join(", "),
    ageFrom: form.ageFrom.value,
    ageTo: form.ageTo.value,
    gender: form.gender.value,
    language: form.language.value,
    languages: form.language.value,
    interests: form.interests.value.trim(),
    caption: form.caption.value.trim(),
    shortDescription: form.shortDescription.value.trim(),
    longDescription: form.longDescription.value.trim(),
    whatsappNumber: form.whatsappNumber.value.trim(),
    destinationUrl: form.destinationUrl.value.trim(),
    imageFileName: fileNames,
    logoFileName,
    phone: form.phone.value.trim(),
    contactNumber: form.contactNumber.value.trim(),
    customerName: form.customerName.value.trim()
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message is-${type}`;
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

updateEstimate();
updateGoalFields();
updatePreview();
normalizeAgeRange();
updateStep();
