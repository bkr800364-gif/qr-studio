
/* =========================================
   QR Studio - QR Code Generator
   ========================================= */

"use strict";

// عناصر الصفحة
const qrForm = document.getElementById("qrForm");
const qrInput = document.getElementById("qrInput");
const inputLabel = document.getElementById("inputLabel");
const inputHint = document.getElementById("inputHint");
const charCount = document.getElementById("charCount");
const qrSize = document.getElementById("qrSize");

const qrContainer = document.getElementById("qrcode");
const qrPlaceholder = document.getElementById("qrPlaceholder");
const qrStatus = document.getElementById("qrStatus");

const resultType = document.getElementById("resultType");
const resultSize = document.getElementById("resultSize");
const resultState = document.getElementById("resultState");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");

const typeButtons = document.querySelectorAll(".type-btn");
const colorButtons = document.querySelectorAll(".color-btn");

// حالة التطبيق
let currentType = "link";
let currentColor = "#111827";
let lastContent = "";
let toastTimer = null;

// تحديث عدد الأحرف
function updateCharCount() {
  charCount.textContent = `${qrInput.value.length} / 2500`;
}

qrInput.addEventListener("input", updateCharCount);

// تغيير نوع المحتوى
typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentType = button.dataset.type;

    typeButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    if (currentType === "link") {
      inputLabel.textContent = "رابط الموقع";
      qrInput.placeholder = "https://example.com";
      inputHint.textContent =
        "أدخل رابطًا يبدأ بـ https:// أو http://";
      resultType.textContent = "رابط موقع";
    } else {
      inputLabel.textContent = "النص الذي تريد تحويله";
      qrInput.placeholder = "اكتب النص الذي تريد تحويله إلى QR Code...";
      inputHint.textContent = "يمكنك إدخال نص عربي أو إنجليزي";
      resultType.textContent = "نص عادي";
    }

    // لا نحتفظ بنتيجة قديمة بعد تغيير النوع
    clearResult();
  });
});

// اختيار لون الرمز
colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentColor = button.dataset.color;

    colorButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    // إعادة إنشاء الرمز باللون الجديد إذا كانت هناك نتيجة
    if (lastContent) {
      generateQRCode(lastContent);
    }
  });
});

// تغيير الحجم
qrSize.addEventListener("change", () => {
  if (lastContent) {
    generateQRCode(lastContent);
  }

  resultSize.textContent = `${qrSize.value} × ${qrSize.value} px`;
});

// مسح النتيجة الحالية
function clearResult() {
  lastContent = "";
  qrContainer.innerHTML = "";
  qrContainer.style.display = "none";

  qrPlaceholder.style.display = "flex";
  downloadBtn.disabled = true;
  copyBtn.disabled = true;

  resultState.textContent = "لم يتم الإنشاء";
  resultState.className = "state-muted";

  qrStatus.innerHTML =
    '<span class="status-dot"></span> بانتظار إنشاء الرمز';
}

// التحقق من صحة الرابط
function isValidURL(value) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" ||
           url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

// إنشاء الرمز عند إرسال النموذج
qrForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const content = qrInput.value.trim();

  if (!content) {
    showToast("من فضلك أدخل رابطًا أو نصًا أولًا.");
    qrInput.focus();
    return;
  }

  if (currentType === "link" && !isValidURL(content)) {
    showToast("الرابط غير صحيح. استخدم https:// أو http://");
    qrInput.focus();
    return;
  }

  if (typeof QRCode === "undefined") {
    showToast("تعذر تحميل مكتبة QR. تحقق من اتصال الإنترنت.");
    return;
  }

  generateQRCode(content);
});

// إنشاء رمز QR
function generateQRCode(content) {
  if (typeof QRCode === "undefined") {
    showToast("مكتبة QR غير متاحة. تحقق من اتصال الإنترنت.");
    return;
  }

  const size = Number(qrSize.value);

  qrContainer.innerHTML = "";
  qrContainer.style.display = "flex";
  qrPlaceholder.style.display = "none";

  try {
    new QRCode(qrContainer, {
      text: content,
      width: size,
      height: size,
      colorDark: currentColor,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    lastContent = content;

    resultType.textContent =
      currentType === "link" ? "رابط موقع" : "نص عادي";

    resultSize.textContent = `${size} × ${size} px`;

    resultState.textContent = "تم الإنشاء بنجاح";
    resultState.className = "state-success";

    qrStatus.innerHTML =
      '<span class="status-dot"></span> تم إنشاء الرمز بنجاح';

    downloadBtn.disabled = false;
    copyBtn.disabled = false;

    showToast("تم إنشاء رمز QR بنجاح!");
  } catch (error) {
    console.error("QR generation error:", error);

    qrContainer.innerHTML = "";
    qrContainer.style.display = "none";
    qrPlaceholder.style.display = "flex";

    lastContent = "";
    downloadBtn.disabled = true;
    copyBtn.disabled = true;

    resultState.textContent = "تعذر الإنشاء";
    resultState.className = "state-muted";

    qrStatus.textContent = "حدث خطأ أثناء إنشاء الرمز";

    showToast(
      "تعذر إنشاء الرمز. جرّب محتوى أقصر أو حجمًا أكبر."
    );
  }
}

// تحميل رمز QR بصيغة PNG
downloadBtn.addEventListener("click", () => {
  if (!lastContent) {
    showToast("أنشئ رمز QR أولًا.");
    return;
  }

  const canvas = qrContainer.querySelector("canvas");
  const image = qrContainer.querySelector("img");

  let imageURL = "";

  try {
    if (canvas) {
      imageURL = canvas.toDataURL("image/png");
    } else if (image && image.src) {
      imageURL = image.src;
    }

    if (!imageURL) {
      showToast("الصورة غير جاهزة بعد. حاول مرة أخرى.");
      return;
    }

    const link = document.createElement("a");

    link.href = imageURL;
    link.download = "qr-code.png";

    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast("تم تجهيز صورة QR للتحميل.");
  } catch (error) {
    console.error("Download error:", error);
    showToast("تعذر تحميل الصورة. حاول مرة أخرى.");
  }
});

// نسخ المحتوى
copyBtn.addEventListener("click", async () => {
  if (!lastContent) {
    showToast("أنشئ رمز QR أولًا.");
    return;
  }

  try {
    await navigator.clipboard.writeText(lastContent);
    showToast("تم نسخ المحتوى بنجاح!");
  } catch (error) {
    // طريقة بديلة عند عدم توفر Clipboard API
    const temporaryInput = document.createElement("textarea");

    temporaryInput.value = lastContent;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";

    document.body.appendChild(temporaryInput);
    temporaryInput.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (copyError) {
      copied = false;
    }

    temporaryInput.remove();

    if (copied) {
      showToast("تم نسخ المحتوى بنجاح!");
    } else {
      showToast("تعذر النسخ تلقائيًا. يمكنك نسخ النص يدويًا.");
    }
  }
});

// رسائل التنبيه
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toastTimer = null;
  }, 2800);
}

// الإعدادات الأولية
updateCharCount();
resultSize.textContent = `${qrSize.value} × ${qrSize.value} px`;