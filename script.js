const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3V3976iPXnRGIBTy7Hfo8FJLfwGmXfKdvmkXXDsmIqbvlOA9FiMq3pRbM3ZGPdHe3/exec";

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
const logoUploadPreview = document.getElementById("logoUploadPreview");
const uploadedLogoPreview = document.getElementById("uploadedLogoPreview");
const governorateOptions = document.getElementById("governorateOptions");
const languageSummary = document.getElementById("languageSummary");
const clearImagesButton = document.getElementById("clearImages");
const clearLogoButton = document.getElementById("clearLogo");

let currentStep = 1;
let previewImageUrls = [];
let previewLogoUrl = "";
const AGE_MIN = 18;
const AGE_MAX = 60;
const MIN_CAMPAIGN_BUDGET = 10;
const MIN_CAMPAIGN_DAYS = 5;
const AD_IMAGE_SIZE = 1080;
const LOGO_IMAGE_SIZE = 512;
const IMAGE_UPLOAD_QUALITY = 0.86;
const PRELOADER_MIN_TIME = 1400;
const pageStartTime = Date.now();
const CAMPAIGN_PACKAGE_TABLES = {
  reach: [
  {
    days: 5,
    budget: 25,
    reachMin: 140000,
    reachMax: 180000,
    engagementMin: 100,
    engagementMax: 300
  },
  {
    days: 8,
    budget: 45,
    reachMin: 280000,
    reachMax: 390000,
    engagementMin: 250,
    engagementMax: 700
  },
  {
    days: 15,
    budget: 100,
    reachMin: 580000,
    reachMax: 800000,
    engagementMin: 1200,
    engagementMax: 2000
  }
  ],
  engagement: [
    {
      days: 5,
      budget: 25,
      reachMin: 5000,
      reachMax: 10000,
      engagementMin: 100,
      engagementMax: 300
    },
    {
      days: 8,
      budget: 45,
      reachMin: 10000,
      reachMax: 25000,
      engagementMin: 250,
      engagementMax: 700
    },
    {
      days: 15,
      budget: 100,
      reachMin: 25000,
      reachMax: 70000,
      engagementMin: 1200,
      engagementMax: 2000
    }
  ],
  messages: [
    {
      days: 5,
      budget: 25,
      reachMin: 45000,
      reachMax: 90000,
      engagementMin: 15,
      engagementMax: 35,
      secondaryMin: 25,
      secondaryMax: 45
    },
    {
      days: 8,
      budget: 45,
      reachMin: 280000,
      reachMax: 390000,
      engagementMin: 60,
      engagementMax: 75,
      secondaryMin: 60,
      secondaryMax: 95
    },
    {
      days: 15,
      budget: 100,
      reachMin: 580000,
      reachMax: 800000,
      engagementMin: 95,
      engagementMax: 160,
      secondaryMin: 130,
      secondaryMax: 210
    }
  ],
  calls: [
    {
      days: 5,
      budget: 25,
      reachMin: 45000,
      reachMax: 90000,
      engagementMin: 15,
      engagementMax: 35,
      secondaryMin: 25,
      secondaryMax: 45
    },
    {
      days: 8,
      budget: 45,
      reachMin: 280000,
      reachMax: 390000,
      engagementMin: 60,
      engagementMax: 75,
      secondaryMin: 60,
      secondaryMax: 95
    },
    {
      days: 15,
      budget: 100,
      reachMin: 580000,
      reachMax: 800000,
      engagementMin: 95,
      engagementMax: 160,
      secondaryMin: 130,
      secondaryMax: 210
    }
  ]
};

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
    if (LINKS[key].startsWith("http") && element.hasAttribute("data-direct-link")) {
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }

    if (LINKS[key].startsWith("http") && !element.hasAttribute("data-direct-link")) {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        openIframe(LINKS[key], element.textContent.trim() || "Dal Syria");
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

window.addEventListener("scroll", hideQuickContactMenu, { passive: true });
document.addEventListener("touchstart", (event) => {
  if (!event.target.closest("#quickContact")) {
    hideQuickContactMenu();
  }
}, { passive: true });
document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#quickContact")) {
    hideQuickContactMenu();
  }
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
  iframeTitle.textContent = title || "Dal Syria";
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

function hideQuickContactMenu() {
  quickContactMenu.hidden = true;
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

form.campaignGoal.addEventListener("change", handleCampaignGoalSelection);
form.adImages.addEventListener("change", updatePreviewImage);
form.companyLogo.addEventListener("change", updatePreviewLogo);
clearImagesButton?.addEventListener("click", clearAdImages);
clearLogoButton?.addEventListener("click", clearCompanyLogo);
form.budget.addEventListener("blur", () => applyBudgetRules());
form.budgetRange.addEventListener("input", () => syncNumberFromRange("budget"));
form.days.addEventListener("input", () => syncRangeFromNumber("days"));
form.daysRange.addEventListener("input", () => syncNumberFromRange("days"));
form.ageFrom.addEventListener("input", () => syncRangeFromNumber("ageFrom"));
form.ageFromRange.addEventListener("input", () => syncNumberFromRange("ageFrom"));
form.ageTo.addEventListener("input", () => syncRangeFromNumber("ageTo"));
form.ageToRange.addEventListener("input", () => syncNumberFromRange("ageTo"));
form.querySelectorAll('input[name="languages"]').forEach((checkbox) => {
  checkbox.addEventListener("change", updateLanguageSummary);
});

document.querySelectorAll("[data-stepper]").forEach((button) => {
  button.addEventListener("click", () => {
    changeStepperValue(button.dataset.stepper, Number(button.dataset.change));
  });
});

window.handleCampaignGoalChange = function handleCampaignGoalChange() {
  handleCampaignGoalSelection();
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  if (GOOGLE_SCRIPT_URL.includes("PUT_YOUR")) {
    showMessage("ضع رابط Google Apps Script Web App داخل script.js قبل الإرسال.", "error");
    return;
  }

  submitButton.disabled = true;
  clearMessage();
  submitButton.classList.add("is-loading");
  submitButton.textContent = "جارٍ إرسال الطلب...";
  showMessage("جارٍ إرسال الطلب، يرجى عدم إغلاق الصفحة.", "loading");

  try {
    const payload = await buildPayload();
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Send failed");
    }

    form.reset();
    clearSavedFormState();
    setDefaultLanguages();
    currentStep = 1;
    updateGovernorateSelection();
    updateEstimate();
    updatePreview();
    updatePreviewImage();
    updatePreviewLogo();
    normalizeAgeRange();
    updateLanguageSummary();
    updateStep();
    alert("تم إرسال طلبك بنجاح، سيتواصل معك فريق دال قريبًا.");
    clearMessage();
  } catch (error) {
    showMessage(`حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى. ${error.message || ""}`, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
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
    const budget = Number(form.budget.value) || 0;

    if (budget < MIN_CAMPAIGN_BUDGET) {
      showMessage("أقل ميزانية للحملة هي 10$.", "error");
      form.budget.focus();
      return false;
    }

    if (budget % 5 !== 0) {
      applyBudgetRules();
    }

    const days = Number(form.days.value) || 0;

    if (days < MIN_CAMPAIGN_DAYS) {
      showMessage("أقل مدة للحملة هي 5 أيام.", "error");
      form.days.focus();
      return false;
    }
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

    if (getSelectedLanguages().length === 0) {
      showMessage("يرجى اختيار لغة واحدة على الأقل.", "error");
      languageSummary.focus();
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
  const normalized = normalizePhoneDigits(value).replace(/[\s()+-]/g, "");
  return /^\d{8,15}$/.test(normalized);
}

function isValidUrl(value) {
  const normalizedValue = normalizeUrl(value);

  try {
    const url = new URL(normalizedValue);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (error) {
    return false;
  }
}

function normalizeUrl(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^www\./i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return trimmedValue;
}

function updateEstimate() {
  const estimate = calculateCampaignEstimate();
  const estimateCard = document.getElementById("estimateCard");
  const metricLabels = getEstimateMetricLabels();
  const primaryMetricRow = document.getElementById("primaryMetricValue").closest("div");
  const secondaryMetricRow = document.getElementById("secondaryMetricRow");
  const hasCampaignGoal = Boolean(getSelectedGoalType());

  estimateCard.hidden = !hasCampaignGoal;

  if (!hasCampaignGoal) {
    return;
  }

  document.getElementById("totalReach").textContent = estimate.totalReachText;
  document.getElementById("primaryMetricLabel").textContent = metricLabels.primary;
  document.getElementById("primaryMetricValue").textContent = estimate.engagementText;
  primaryMetricRow.hidden = !estimate.engagementText;
  document.getElementById("secondaryMetricLabel").textContent = metricLabels.secondary;
  document.getElementById("secondaryMetricValue").textContent = estimate.secondaryText || "";
  secondaryMetricRow.hidden = !estimate.secondaryText;
  document.getElementById("totalCost").textContent = `$${formatNumber(estimate.totalCost)}`;
}

function getEstimateMetricLabels() {
  const goalType = getSelectedGoalType();

  if (goalType === "messages" || goalType === "calls") {
    return {
      primary: "الاتصالات المتوقعة",
      secondary: "الرسائل المتوقعة"
    };
  }

  return {
    primary: "التفاعلات المتوقعة",
    secondary: "الرسائل المتوقعة"
  };
}

function calculateCampaignEstimate() {
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const goalType = getSelectedGoalType();

  if (!goalType) {
    return {
      dailyReach: "",
      totalReach: 0,
      engagement: "",
      dailyReachText: "",
      totalReachText: "0",
      engagementText: "",
      secondaryText: "",
      totalCost: budget
    };
  }

  if (CAMPAIGN_PACKAGE_TABLES[goalType]) {
    return calculatePackageEstimate(budget, goalType);
  }

  const dailyBudget = days > 0 ? budget / days : 0;
  const dailyReach = Math.round(dailyBudget * 850);
  const totalReach = dailyReach * days;

  return {
    dailyReach: dailyReach,
    totalReach: totalReach,
    engagement: Math.round(totalReach * 0.003),
    dailyReachText: formatNumber(dailyReach),
    totalReachText: formatNumber(totalReach),
    engagementText: formatNumber(Math.round(totalReach * 0.003)),
    secondaryText: "",
    totalCost: budget
  };
}

function calculatePackageEstimate(budget, goalType) {
  const safeBudget = Math.max(budget, MIN_CAMPAIGN_BUDGET);
  const packageValues = getCampaignPackageValues(safeBudget, goalType);
  const totalReachMin = roundReachValue(packageValues.reachMin);
  const totalReachMax = roundReachValue(packageValues.reachMax);
  const engagementMin = roundMetricValue(packageValues.engagementMin);
  const engagementMax = roundMetricValue(packageValues.engagementMax);
  const secondaryMin = packageValues.secondaryMin ? roundMetricValue(packageValues.secondaryMin) : 0;
  const secondaryMax = packageValues.secondaryMax ? roundMetricValue(packageValues.secondaryMax) : 0;

  return {
    dailyReach: "",
    totalReach: `${totalReachMin} - ${totalReachMax}`,
    engagement: goalType === "reach" ? "" : `${engagementMin} - ${engagementMax}`,
    dailyReachText: "",
    totalReachText: formatRange(totalReachMin, totalReachMax),
    engagementText: goalType === "reach" ? "" : formatRange(engagementMin, engagementMax),
    secondaryText: secondaryMin && secondaryMax ? formatRange(secondaryMin, secondaryMax) : "",
    totalCost: safeBudget
  };
}

function getCampaignPackageValues(budget, goalType) {
  const packages = CAMPAIGN_PACKAGE_TABLES[goalType] || CAMPAIGN_PACKAGE_TABLES.reach;

  if (budget <= packages[0].budget) {
    const multiplier = budget / packages[0].budget;
    return {
      reachMin: packages[0].reachMin * multiplier,
      reachMax: packages[0].reachMax * multiplier,
      engagementMin: packages[0].engagementMin * multiplier,
      engagementMax: packages[0].engagementMax * multiplier,
      secondaryMin: (packages[0].secondaryMin || 0) * multiplier,
      secondaryMax: (packages[0].secondaryMax || 0) * multiplier
    };
  }

  for (let index = 0; index < packages.length - 1; index += 1) {
    const start = packages[index];
    const end = packages[index + 1];

    if (budget <= end.budget) {
      const ratio = (budget - start.budget) / (end.budget - start.budget);
      return {
        reachMin: interpolate(start.reachMin, end.reachMin, ratio),
        reachMax: interpolate(start.reachMax, end.reachMax, ratio),
        engagementMin: interpolate(start.engagementMin, end.engagementMin, ratio),
        engagementMax: interpolate(start.engagementMax, end.engagementMax, ratio),
        secondaryMin: interpolate(start.secondaryMin || 0, end.secondaryMin || 0, ratio),
        secondaryMax: interpolate(start.secondaryMax || 0, end.secondaryMax || 0, ratio)
      };
    }
  }

  const lastPackage = packages[packages.length - 1];
  const multiplier = budget / lastPackage.budget;
  return {
    reachMin: lastPackage.reachMin * multiplier,
    reachMax: lastPackage.reachMax * multiplier,
    engagementMin: lastPackage.engagementMin * multiplier,
    engagementMax: lastPackage.engagementMax * multiplier,
    secondaryMin: (lastPackage.secondaryMin || 0) * multiplier,
    secondaryMax: (lastPackage.secondaryMax || 0) * multiplier
  };
}

function interpolate(start, end, ratio) {
  return start + ((end - start) * ratio);
}

function roundReachValue(value) {
  return Math.round(value / 1000) * 1000;
}

function roundMetricValue(value) {
  const step = value < 100 ? 5 : 10;
  return Math.round(value / step) * step;
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
  updateEstimate();

  if (previewImageUrls.length) {
    renderPreviewCarousel();
  }
}

function handleCampaignGoalSelection() {
  setCampaignDefaults();
  updateGoalFields();
  updatePreview();
}

function setCampaignDefaults() {
  form.budget.value = 25;
  form.budgetRange.value = 25;
  form.days.value = 5;
  form.daysRange.value = 5;
}

function getGoalPreviewConfig() {
  const goalType = getSelectedGoalType();

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

function updatePreviewImage() {
  previewImageUrls.forEach((item) => URL.revokeObjectURL(item.url));
  previewImageUrls = Array.from(form.adImages.files).map((file, index) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    index
  }));
  if (clearImagesButton) {
    clearImagesButton.hidden = !previewImageUrls.length;
  }
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
    if (logoUploadPreview) {
      logoUploadPreview.hidden = true;
    }
    if (uploadedLogoPreview) {
      uploadedLogoPreview.removeAttribute("src");
    }
    if (clearLogoButton) {
      clearLogoButton.hidden = true;
    }
    return;
  }

  previewLogoUrl = URL.createObjectURL(file);
  previewLogo.src = previewLogoUrl;
  if (uploadedLogoPreview) {
    uploadedLogoPreview.src = previewLogoUrl;
  }
  if (logoUploadPreview) {
    logoUploadPreview.hidden = false;
  }
  if (clearLogoButton) {
    clearLogoButton.hidden = false;
  }
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

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "carousel-remove";
    removeButton.setAttribute("aria-label", `حذف الصورة ${item.index + 1}`);
    removeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    removeButton.addEventListener("click", () => removeAdImage(item.index));

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
    card.append(image, removeButton, body);
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
    checkbox.addEventListener("change", () => updateGovernorateSelection(checkbox));
  });
}

function updateGovernorateSelection(changedCheckbox = null) {
  if (changedCheckbox && form.allSyria.checked) {
    form.allSyria.checked = false;
    changedCheckbox.checked = true;
  }

  const allChecked = form.allSyria.checked;
  form.querySelectorAll('input[name="governorates"]').forEach((checkbox) => {
    checkbox.checked = allChecked ? true : checkbox.checked;
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
  let value = Math.min(Math.max(Number(numberInput.value) || min, min), max);

  if (name === "budget") {
    value = Math.round(value / 5) * 5;
    value = Math.min(Math.max(value, min), max);
  }

  numberInput.value = value;
  rangeInput.value = value;
  if (name === "ageFrom" || name === "ageTo") {
    normalizeAgeRange(name);
  }
  updateEstimate();
  updatePreview();
}

function applyBudgetRules() {
  const min = Number(form.budget.min);
  const max = Number(form.budget.max);
  let value = Number(form.budget.value);

  if (!value || value < min) {
    value = min;
  }

  value = Math.round(value / 5) * 5;
  value = Math.min(Math.max(value, min), max);
  form.budget.value = value;
  form.budgetRange.value = value;
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

function updateLanguageSummary() {
  const selectedLanguages = getSelectedLanguages();
  languageSummary.textContent = selectedLanguages.length ? selectedLanguages.join("، ") : "اختر لغة أو أكثر";
}

function setDefaultLanguages() {
  form.querySelectorAll('input[name="languages"]').forEach((checkbox) => {
    checkbox.checked = checkbox.value === "العربية";
  });
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(Math.max(number, min), max);
}

async function buildPayload() {
  const estimate = calculateCampaignEstimate();
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const imageFiles = await filesToBase64(form.adImages.files);
  const logoFile = await fileToBase64(form.companyLogo.files[0]);
  const selectedGovernorates = getSelectedGovernorates();

  return {
    submittedAt: new Date().toISOString(),
    campaignGoal: getSelectedGoalLabel(),
    budget,
    days,
    dailyReach: estimate.dailyReachText,
    totalReach: estimate.totalReachText,
    totalCost: budget,
    governorates: selectedGovernorates.join(", "),
    ageFrom: form.ageFrom.value,
    ageTo: form.ageTo.value,
    gender: form.gender.value,
    languages: getSelectedLanguages().join(", "),
    caption: form.caption.value.trim(),
    shortDescription: form.shortDescription.value.trim(),
    longDescription: form.longDescription.value.trim(),
    whatsappNumber: normalizePhoneDigits(form.whatsappNumber.value.trim()),
    destinationUrl: normalizeUrl(form.destinationUrl.value),
    imageFiles,
    logoFile,
    phone: normalizePhoneDigits(form.phone.value.trim()),
    contactNumber: normalizePhoneDigits(form.contactNumber.value.trim()),
    customerName: form.customerName.value.trim()
  };
}

function filesToBase64(fileList) {
  return Promise.all(Array.from(fileList).map((file) => fileToBase64(file, {
    size: AD_IMAGE_SIZE,
    suffix: "ad"
  })));
}

function removeAdImage(indexToRemove) {
  const files = Array.from(form.adImages.files).filter((_, index) => index !== indexToRemove);
  setFileInputFiles(form.adImages, files);
  updatePreviewImage();
}

function clearAdImages() {
  setFileInputFiles(form.adImages, []);
  updatePreviewImage();
}

function clearCompanyLogo() {
  setFileInputFiles(form.companyLogo, []);
  updatePreviewLogo();
}

function setFileInputFiles(input, files) {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
}

function normalizePhoneDigits(value) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return String(value || "").replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex !== -1) return String(arabicIndex);
    const persianIndex = persianDigits.indexOf(digit);
    return persianIndex !== -1 ? String(persianIndex) : digit;
  });
}

async function fileToBase64(file, options = {}) {
  if (!file) {
    return null;
  }

  if (file.type && file.type.startsWith("image/")) {
    try {
      return await fileToOptimizedImage(file, {
        size: options.size || LOGO_IMAGE_SIZE,
        suffix: options.suffix || "logo"
      });
    } catch (error) {
      return readFileAsBase64(file);
    }
  }

  return readFileAsBase64(file);
}

function fileToOptimizedImage(file, options) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    const outputSize = options.size || AD_IMAGE_SIZE;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas unavailable"));
        return;
      }

      drawImageCover(context, image, outputSize, outputSize);
      enhanceImageCanvas(context, outputSize, outputSize);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Image compression failed"));
          return;
        }

        readFileAsBase64(blob).then((result) => {
          const safeName = file.name.replace(/\.[^.]+$/, "") || "dal-image";
          resolve({
            ...result,
            name: `${safeName}-${options.suffix || "optimized"}-${outputSize}x${outputSize}.jpg`,
            mimeType: "image/jpeg"
          });
        }).catch(reject);
      }, "image/jpeg", IMAGE_UPLOAD_QUALITY);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    image.src = objectUrl;
  });
}

function drawImageCover(context, image, targetWidth, targetHeight) {
  const sourceRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "contrast(1.06) saturate(1.08) brightness(1.02)";
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
  context.filter = "none";
}

function enhanceImageCanvas(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const amount = 0.32;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const center = copy[index + channel];
        const left = copy[index + channel - 4];
        const right = copy[index + channel + 4];
        const top = copy[index + channel - (width * 4)];
        const bottom = copy[index + channel + (width * 4)];
        const blur = (left + right + top + bottom) / 4;
        data[index + channel] = clampColor(center + ((center - blur) * amount));
      }
    }
  }

  context.putImageData(imageData, 0, 0);
}

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function readFileAsBase64(file) {
  if (!file) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve({
        name: file.name || "dal-file",
        mimeType: file.type || "application/octet-stream",
        data: result.includes(",") ? result.split(",")[1] : result
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function clearSavedFormState() {
  previewImageUrls.forEach((item) => URL.revokeObjectURL(item.url));
  previewImageUrls = [];
  if (clearImagesButton) {
    clearImagesButton.hidden = true;
  }

  if (previewLogoUrl) {
    URL.revokeObjectURL(previewLogoUrl);
    previewLogoUrl = "";
  }
  if (logoUploadPreview) {
    logoUploadPreview.hidden = true;
  }
  if (uploadedLogoPreview) {
    uploadedLogoPreview.removeAttribute("src");
  }
  if (clearLogoButton) {
    clearLogoButton.hidden = true;
  }

  try {
    window.localStorage.removeItem("dalCampaignForm");
    window.sessionStorage.removeItem("dalCampaignForm");
  } catch (error) {
    // التخزين قد يكون غير متاح في بعض المتصفحات الخاصة.
  }
}

function getSelectedLanguages() {
  return Array.from(form.querySelectorAll('input[name="languages"]:checked')).map((checkbox) => checkbox.value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatRange(min, max) {
  return `${formatNumber(min)} - ${formatNumber(max)}`;
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
setDefaultLanguages();
updateLanguageSummary();
updateStep();
