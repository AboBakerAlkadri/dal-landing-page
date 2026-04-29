const GOOGLE_SCRIPT_URL = "PUT_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const LINKS = {
  googlePlay: "https://play.google.com/store/apps/details?id=com.yashamDigital.dal&gl=DE",
  appStore: "https://apps.apple.com/eg/app/%D8%AF%D8%A7%D9%84-%D8%B3%D9%88%D8%B1%D9%8A%D8%A7/id6753619674?l=ar",
  alternativeDownload: "https://com-yashamdigital-dal.en.uptodown.com/android",
  addPost: "https://dalsyria.com/add-post",
  about: "https://dalsyria.com/about-us",
  support: "https://dalsyria.com/techsupport",
  blog: "https://dalsyria.com/blog",
  help: "https://dalsyria.com/help",
  rateApp: "https://play.google.com/store/apps/details?id=com.yashamDigital.dal&hl=en",
  whatsapp: "https://wa.me/963939769472",
  facebook: "https://www.facebook.com/dalsyriacom",
  instagram: "https://www.instagram.com/dalsyriacom",
  tiktok: "https://www.tiktok.com/@dalsyriacom",
  youtube: "https://www.youtube.com/@Dalsyriacom",
  linkedin: "https://www.linkedin.com/company/dalsyriacom/",
  email: "mailto:support@dalsyria.com",
  phone: "tel:0939769472"
};

const modal = document.getElementById("campaignModal");
const openCampaign = document.getElementById("openCampaign");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const form = document.getElementById("campaignForm");
const prevStepButton = document.getElementById("prevStep");
const nextStepButton = document.getElementById("nextStep");
const submitButton = document.getElementById("submitCampaign");
const formMessage = document.getElementById("formMessage");
const previewText = document.getElementById("previewText");
const previewImage = document.getElementById("previewImage");

let currentStep = 1;
const PRELOADER_MIN_TIME = 1400;
const pageStartTime = Date.now();

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
    if (!LINKS[key].startsWith("tel:") && !LINKS[key].startsWith("mailto:")) {
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }
  }
});

openCampaign.addEventListener("click", () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
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
  updatePreview();
});

form.adImages.addEventListener("change", updatePreviewImage);

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
    updateEstimate();
    updatePreview();
    updatePreviewImage();
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
    if (!field.value.trim()) {
      field.focus();
      showMessage("يرجى تعبئة الحقول الأساسية قبل المتابعة.", "error");
      return false;
    }
  }

  const ageFrom = Number(form.ageFrom.value);
  const ageTo = Number(form.ageTo.value);
  if (currentStep === 2 && ageFrom && ageTo && ageFrom > ageTo) {
    showMessage("العمر من يجب أن يكون أقل من أو يساوي العمر إلى.", "error");
    form.ageFrom.focus();
    return false;
  }

  clearMessage();
  return true;
}

function updateEstimate() {
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const dailyBudget = days > 0 ? budget / days : 0;
  const dailyReach = Math.round(dailyBudget * 850);
  const totalReach = dailyReach * days;
  const quality = getAudienceQuality(budget, days);

  document.getElementById("dailyReach").textContent = formatNumber(dailyReach);
  document.getElementById("totalReach").textContent = formatNumber(totalReach);
  document.getElementById("totalCost").textContent = `${budget || 0}$`;
  document.getElementById("audienceQuality").textContent = quality;
}

function getAudienceQuality(budget, days) {
  if (!budget || !days) return "تحتاج بيانات";
  const dailyBudget = budget / days;
  if (dailyBudget >= 15) return "قوية";
  if (dailyBudget >= 7) return "جيدة";
  return "محدودة";
}

function updatePreview() {
  const caption = form.caption.value.trim();
  previewText.textContent = caption || "سيظهر نص الإعلان هنا أثناء الكتابة.";
}

function updatePreviewImage() {
  const file = form.adImages.files[0];
  previewImage.innerHTML = "";

  if (!file) {
    previewImage.innerHTML = '<i class="fa-regular fa-image" aria-hidden="true"></i>';
    return;
  }

  const image = document.createElement("img");
  image.src = URL.createObjectURL(file);
  image.alt = "معاينة صورة الإعلان";
  previewImage.appendChild(image);
}

function buildPayload() {
  const budget = Number(form.budget.value) || 0;
  const days = Number(form.days.value) || 0;
  const dailyReach = Math.round((days > 0 ? budget / days : 0) * 850);
  const totalReach = dailyReach * days;
  const fileNames = Array.from(form.adImages.files).map((file) => file.name).join(", ");

  return {
    submittedAt: new Date().toISOString(),
    campaignGoal: form.campaignGoal.value,
    budget,
    days,
    dailyReach,
    totalReach,
    totalCost: budget,
    audienceQuality: getAudienceQuality(budget, days),
    regions: form.regions.value.trim(),
    ageFrom: form.ageFrom.value,
    ageTo: form.ageTo.value,
    gender: form.gender.value,
    interests: form.interests.value.trim(),
    caption: form.caption.value.trim(),
    imageFileName: fileNames,
    phone: form.phone.value.trim(),
    customerName: form.customerName.value.trim()
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar-SY").format(value || 0);
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
updatePreview();
updateStep();
