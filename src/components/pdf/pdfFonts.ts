import { Font } from "@react-pdf/renderer";

export const PDF_FONT_FAMILY = "Cairo";

const REGULAR_FONT = `${window.location.origin}/fonts/Tajawal-Regular.ttf`;
const BOLD_FONT = `${window.location.origin}/fonts/Tajawal-Bold.ttf`;

Font.register({
  family: PDF_FONT_FAMILY,
  fonts: [
    { src: REGULAR_FONT, fontWeight: 400 },
    { src: BOLD_FONT, fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

/** للتوافق مع المكوّنات القديمة — التسجيل يحدث عند تحميل الوحدة */
export function registerPdfFonts() {
  void 0;
}

