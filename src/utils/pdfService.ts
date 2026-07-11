import { pdf } from "@react-pdf/renderer";
import React from "react";
import toast from "react-hot-toast";

type PdfShareOptions = {
  title?: string;
  text?: string;
  phone?: string;
  whatsappMessage?: string;
};

export const generatePdfBlob = async (document: React.ReactElement): Promise<Blob> => {
  const asPdf = pdf();
  asPdf.updateContainer(document);
  const blob = await asPdf.toBlob();
  return blob;
};

const getPdfTitle = (filename: string, title?: string) =>
  title || filename.replace(/\.pdf$/i, "");

const openPdfBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, "_blank");
  if (!tab) {
    window.location.href = url;
  }
  setTimeout(() => URL.revokeObjectURL(url), 120000);
};

const cleanPhone = (phone?: string) => phone?.replace(/[^0-9]/g, "") || "";

const isShareAbort = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: string }).name === "AbortError";

export const downloadPdf = async (document: React.ReactElement, filename: string) => {
  const title = getPdfTitle(filename);
  const toastId = toast.loading(`جاري إنشاء ${title}...`);
  try {
    const blob = await generatePdfBlob(document);
    openPdfBlob(blob);
    toast.success(`تم فتح ${title}`, { id: toastId });
  } catch (error) {
    toast.error("فشل إنشاء ملف PDF", { id: toastId });
    throw error;
  }
};

export const sharePdf = async (
  document: React.ReactElement,
  filename: string,
  options: PdfShareOptions = {}
) => {
  const toastId = toast.loading("جاري تجهيز الملف للمشاركة...");
  try {
    const blob = await generatePdfBlob(document);
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: getPdfTitle(filename, options.title),
        text: options.text,
        files: [file],
      });
      toast.success("تمت المشاركة", { id: toastId });
      return;
    }

    openPdfBlob(blob);
    toast.success("تم فتح ملف PDF للمشاركة اليدوية", { id: toastId });
  } catch (error) {
    if (isShareAbort(error)) {
      toast.dismiss(toastId);
      return;
    }
    toast.error("فشل تجهيز ملف المشاركة", { id: toastId });
    throw error;
  }
};

export const sharePdfToWhatsApp = async (
  document: React.ReactElement,
  filename: string,
  options: PdfShareOptions = {}
) => {
  const toastId = toast.loading("جاري تجهيز ملف PDF للواتساب...");
  const title = getPdfTitle(filename, options.title);
  const text = options.text || "مرفق ملف PDF جاهز للمراجعة.";

  try {
    const blob = await generatePdfBlob(document);
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text, files: [file] });
      toast.success("تم فتح خيارات المشاركة", { id: toastId });
      return;
    }

    const phone = cleanPhone(options.phone);
    if (phone) {
      const message = options.whatsappMessage || `${text}\n\n${title}`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
      openPdfBlob(blob);
      toast.success("تم فتح واتساب وملف PDF", { id: toastId });
      return;
    }

    openPdfBlob(blob);
    toast.success("تم فتح ملف PDF. يمكن مشاركته عبر واتساب من الهاتف.", { id: toastId });
  } catch (error) {
    if (isShareAbort(error)) {
      toast.dismiss(toastId);
      return;
    }
    toast.error("فشل تجهيز ملف واتساب", { id: toastId });
    throw error;
  }
};
