import { pdf } from "@react-pdf/renderer";
import React from "react";
import toast from "react-hot-toast";

type PdfShareOptions = {
  /** عنوان قصير (بدون روابط) */
  title?: string;
  phone?: string;
  whatsappMessage?: string;
};

/** ينظّف اسم الملف من رموز غير صالحة ويضمن لاحقة .pdf */
export const sanitizePdfFilename = (raw: string): string => {
  const base = (raw || "مستند")
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^[-.\s]+|[-.\s]+$/g, "");

  return `${base || "مستند"}.pdf`;
};

/**
 * اسم ملف واضح: نوع المستند + اسم العميل (+ مرجع اختياري)
 * مثال: التقرير-المالي-الشامل-شركة النور.pdf
 */
export const buildPdfFilename = (
  docType: string,
  clientName?: string,
  reference?: string
): string => {
  const parts = [docType.trim(), clientName?.trim(), reference?.trim()].filter(
    (part): part is string => Boolean(part && part.length > 0)
  );
  return sanitizePdfFilename(parts.join("-"));
};

export const generatePdfBlob = async (document: React.ReactElement): Promise<Blob> => {
  const asPdf = pdf();
  asPdf.updateContainer(document);
  return asPdf.toBlob();
};

const getPdfTitle = (filename: string, title?: string) =>
  (title || filename).replace(/\.pdf$/i, "").trim();

/** فتح ملف PDF في تبويب جديد — السلوك المناسب للآيفون للمشاركة لاحقاً من عارض PDF */
const openPdfBlob = (blob: Blob, filename: string) => {
  const safeName = sanitizePdfFilename(filename);
  // type صريح يساعد Safari على فتح عارض PDF بدل التحميل/المشاركة المباشرة
  const pdfBlob =
    blob.type === "application/pdf"
      ? blob
      : new Blob([blob], { type: "application/pdf" });

  const url = URL.createObjectURL(pdfBlob);
  const tab = window.open(url, "_blank", "noopener,noreferrer");

  if (!tab) {
    // إن حظر المتصفح النافذة: نفتح في نفس الصفحة كحل أخير
    window.location.href = url;
  }

  // إبقاء الرابط صالحاً وقتاً كافياً للعرض والمشاركة من عارض الآيفون
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);

  return safeName;
};

/**
 * إنشاء PDF وفتحه للعرض — مثل السابق.
 * على الآيفون: بعد الفتح يمكن المشاركة من زر المشاركة في عارض PDF.
 */
export const downloadPdf = async (document: React.ReactElement, filename: string) => {
  const safeName = sanitizePdfFilename(filename);
  const title = getPdfTitle(safeName);
  const toastId = toast.loading(`جاري إنشاء ${title}...`);
  try {
    const blob = await generatePdfBlob(document);
    openPdfBlob(blob, safeName);
    toast.success(`تم فتح ${title}`, { id: toastId });
  } catch (error) {
    toast.error("فشل إنشاء ملف PDF", { id: toastId });
    throw error;
  }
};

/**
 * نفس سلوك الفتح — بدون مشاركة مباشرة من التطبيق.
 * المشاركة تتم يدوياً من عارض PDF (خصوصاً على الآيفون).
 */
export const sharePdf = async (
  document: React.ReactElement,
  filename: string,
  options: PdfShareOptions = {}
) => {
  const safeName = sanitizePdfFilename(filename);
  const title = getPdfTitle(safeName, options.title);
  const toastId = toast.loading(`جاري فتح ${title}...`);

  try {
    const blob = await generatePdfBlob(document);
    openPdfBlob(blob, safeName);
    toast.success(`تم فتح ${title} — يمكنك مشاركته من عارض الملف`, {
      id: toastId,
    });
  } catch (error) {
    toast.error("فشل فتح ملف PDF", { id: toastId });
    throw error;
  }
};

/** فتح PDF للعرض — بدون مشاركة مباشرة أو روابط للمنظومة */
export const sharePdfToWhatsApp = async (
  document: React.ReactElement,
  filename: string,
  options: PdfShareOptions = {}
) => {
  const safeName = sanitizePdfFilename(filename);
  const title = getPdfTitle(safeName, options.title);
  const toastId = toast.loading(`جاري فتح ${title}...`);

  try {
    const blob = await generatePdfBlob(document);
    openPdfBlob(blob, safeName);
    toast.success(`تم فتح ${title} — شارك الملف من عارض PDF`, { id: toastId });
  } catch (error) {
    toast.error("فشل فتح ملف PDF", { id: toastId });
    throw error;
  }
};
