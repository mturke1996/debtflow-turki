import React from "react";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { PDF_COMPANY_INFO } from "@/constants/pdfCompanyInfo";
import { COMPANY_INFO } from "@/constants/companyInfo";
import { PDF_FONT_FAMILY } from "./pdfFonts";

export const PDFPalette = {
  primary: "#4a5d4a",
  accent: "#8b7e6a",
  accentLight: "#c8c0b0",
  text: "#1a1f1a",
  muted: "#6b7f6b",
  white: "#ffffff",
  border: "#e8e5de",
  rowAlt: "#fafaf8",
  success: "#0d9668",
  warning: "#c9a54e",
  danger: "#d64545",
  headerBg: "#4a5d4a",
  paleGold: "#fffcf5",
};

export const LIBYAN_CURRENCY_LABEL = "د.ل";

export const pdfBrandStyles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9,
    color: PDFPalette.text,
    backgroundColor: PDFPalette.white,
    paddingTop: 30,
    paddingBottom: 56,
    paddingHorizontal: 36,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleCol: {
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "40%",
    paddingTop: 8,
  },
  titleEn: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#cfd5cf",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  titleAr: { fontSize: 11, fontWeight: "bold", color: PDFPalette.primary },

  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginLeft: 8,
  },
  logoWrap: {
    paddingLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  identityText: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: 300,
    justifyContent: "center",
  },
  companyFull: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: PDFPalette.primary,
    marginBottom: 3,
    textAlign: "right",
    lineHeight: 1.35,
    letterSpacing: 0.2,
  },
  engineer: {
    fontSize: 10,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 2,
    textAlign: "right",
  },
  tagEn: {
    fontSize: 8,
    fontWeight: "bold",
    color: PDFPalette.muted,
    textAlign: "right",
    letterSpacing: 0.6,
  },

  divider: {
    borderBottomWidth: 2,
    borderBottomColor: PDFPalette.primary,
    paddingBottom: 8,
    marginBottom: 14,
  },

  contactBlock: {
    alignItems: "flex-end",
  },
  contactRowSingle: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    marginBottom: 3,
  },
  contactLine: {
    fontSize: 8.8,
    fontWeight: "bold",
    color: PDFPalette.muted,
    textAlign: "right",
    lineHeight: 1.45,
  },

  kvRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: PDFPalette.border,
  },
  kvBox: {
    width: "32%",
    alignItems: "flex-end",
  },
  kvLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 2,
    textAlign: "right",
  },
  kvVal: {
    fontSize: 8.8,
    fontWeight: "bold",
    color: PDFPalette.text,
    textAlign: "right",
  },

  servicesRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: PDFPalette.border,
    alignItems: "flex-end",
  },
  servicesLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 3,
    textAlign: "right",
  },
  servicesText: {
    fontSize: 8,
    color: PDFPalette.text,
    textAlign: "right",
    lineHeight: 1.55,
  },

  footer: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  footerBrand: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: PDFPalette.primary,
    marginBottom: 2,
  },
  footerEng: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 3,
  },
  footerMuted: {
    fontSize: 7.8,
    color: "#778877",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  footerNote: { fontSize: 6.8, color: "#888" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  datesCol: { width: "38%" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dateLabel: { fontSize: 8.8, color: "#999", textAlign: "right" },
  dateVal: { fontSize: 8.8, fontWeight: "bold", color: PDFPalette.text, textAlign: "left" },

  clientBox: {
    width: "55%",
    paddingVertical: 4,
    paddingRight: 12,
    borderRightWidth: 2,
    borderRightColor: PDFPalette.primary,
    alignItems: "flex-end",
  },
  clientSectionLbl: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 3,
    textAlign: "right",
  },
  clientName: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#2d3a2d",
    textAlign: "right",
    marginBottom: 2,
  },
  clientSub: { fontSize: 8.8, color: "#888", marginTop: 2, textAlign: "right" },

  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: PDFPalette.primary,
    marginBottom: 6,
    marginTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: PDFPalette.border,
    textAlign: "right",
  },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: PDFPalette.rowAlt,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: PDFPalette.border,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8.2,
    color: PDFPalette.muted,
    marginBottom: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: PDFPalette.primary,
    textAlign: "center",
  },
  summaryCurr: {
    fontSize: 9,
    color: PDFPalette.muted,
    fontWeight: "bold",
    marginRight: 2,
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: PDFPalette.headerBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 2,
  },
  th: {
    color: PDFPalette.white,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0efeb",
  },
  rowEven: { backgroundColor: PDFPalette.rowAlt },

  td: { fontSize: 9, color: PDFPalette.text, textAlign: "right" },
  tdBold: { fontSize: 9, fontWeight: "bold", color: PDFPalette.text, textAlign: "right" },
  tdPos: { fontSize: 9, fontWeight: "bold", color: PDFPalette.success, textAlign: "right" },
  tdNeg: { fontSize: 9, fontWeight: "bold", color: PDFPalette.danger, textAlign: "right" },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f0ede7",
    borderTopWidth: 1.5,
    borderTopColor: PDFPalette.primary,
    marginTop: 1,
    borderRadius: 2,
  },

  grandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: PDFPalette.primary,
  },
  grandLbl: {
    fontSize: 11,
    fontWeight: "bold",
    color: PDFPalette.primary,
    textAlign: "right",
  },
  grandAmt: {
    fontSize: 13,
    fontWeight: "bold",
    color: PDFPalette.primary,
    textAlign: "left",
  },

  totalsBox: { width: 240, alignSelf: "flex-start", marginTop: 10 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  notesBox: {
    padding: 10,
    backgroundColor: PDFPalette.paleGold,
    borderRightWidth: 3,
    borderRightColor: PDFPalette.accentLight,
    borderRadius: 3,
    marginTop: 14,
    alignItems: "flex-end",
  },
  notesLbl: {
    fontSize: 9,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 4,
    textAlign: "right",
  },
  notesTxt: { fontSize: 9.5, color: "#555", textAlign: "right", lineHeight: 1.65 },
});

/**
 * شعار الشركة من ملف PDF الأصلي (محوّل إلى PNG).
 */
const pdfLogoSrc =
  typeof window !== "undefined"
    ? `${window.location.origin}${COMPANY_INFO.logoSrc}`
    : COMPANY_INFO.logoSrc;

export const PdfLogoMark = ({ size = 64 }: { size?: number }) => (
  <View style={[pdfBrandStyles.logoWrap, { width: size, height: size }]}>
    <Image src={pdfLogoSrc} style={{ width: size, height: size, objectFit: "contain" }} />
  </View>
);

const servicesBulleted = `${PDF_COMPANY_INFO.services.join("   •   ")}`;

const joinNonEmpty = (arr: string[], sep = " • ") =>
  arr.filter((x) => !!x && x.trim().length > 0).join(sep);

export const PdfBrandedFooter = () => {
  const line1 = joinNonEmpty([
    PDF_COMPANY_INFO.addressSingle,
    ...PDF_COMPANY_INFO.phones,
  ]);
  const line2 = joinNonEmpty([PDF_COMPANY_INFO.email, PDF_COMPANY_INFO.website]);
  return (
    <View style={pdfBrandStyles.footer} fixed>
      <Text style={pdfBrandStyles.footerBrand}>{PDF_COMPANY_INFO.fullName}</Text>
      {PDF_COMPANY_INFO.engineerName ? (
        <Text style={pdfBrandStyles.footerEng}>{PDF_COMPANY_INFO.engineerName}</Text>
      ) : null}
      {line1 ? <Text style={pdfBrandStyles.footerMuted}>{line1}</Text> : null}
      {line2 ? <Text style={pdfBrandStyles.footerMuted}>{line2}</Text> : null}
      <Text style={pdfBrandStyles.footerNote}>{PDF_COMPANY_INFO.footerNote}</Text>
    </View>
  );
};

type HeaderProps = { titleEn: string; subtitleAr: string; refLine?: string };

export const PdfBrandedReportHeader = ({ titleEn, subtitleAr, refLine }: HeaderProps) => (
  <View wrap={false}>
    <View style={pdfBrandStyles.headerTop}>
      <View style={pdfBrandStyles.headerTitleCol}>
        <Text style={pdfBrandStyles.titleEn}>{titleEn}</Text>
        <Text style={pdfBrandStyles.titleAr}>{subtitleAr}</Text>
        {refLine ? (
          <Text
            style={[
              pdfBrandStyles.titleAr,
              { marginTop: 4, fontSize: 9.5, color: PDFPalette.muted },
            ]}
          >
            {refLine}
          </Text>
        ) : null}
      </View>

      <View style={pdfBrandStyles.identityRow}>
        <View style={pdfBrandStyles.identityText}>
          <Text style={pdfBrandStyles.companyFull}>{PDF_COMPANY_INFO.fullName}</Text>
          {PDF_COMPANY_INFO.engineerName ? (
            <Text style={pdfBrandStyles.engineer}>{PDF_COMPANY_INFO.engineerName}</Text>
          ) : null}
          <Text style={pdfBrandStyles.tagEn}>{PDF_COMPANY_INFO.taglineEn}</Text>
        </View>
        <PdfLogoMark size={68} />
      </View>
    </View>

    <View style={pdfBrandStyles.divider}>
      <View style={pdfBrandStyles.contactBlock}>
        <View style={pdfBrandStyles.kvRow}>
          <View style={[pdfBrandStyles.kvBox, { width: "55%" }]}>
            <Text style={pdfBrandStyles.kvLabel}>العنوان</Text>
            <Text style={pdfBrandStyles.kvVal}>
              {PDF_COMPANY_INFO.addressLines.join("\n")}
            </Text>
          </View>
          <View style={[pdfBrandStyles.kvBox, { width: "40%" }]}>
            <Text style={pdfBrandStyles.kvLabel}>الهاتف</Text>
            <Text style={pdfBrandStyles.kvVal}>
              {PDF_COMPANY_INFO.phones.length
                ? PDF_COMPANY_INFO.phones.join("\n")
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      {PDF_COMPANY_INFO.services.length ? (
        <View style={pdfBrandStyles.servicesRow}>
          <Text style={pdfBrandStyles.servicesLabel}>مجالات الخدمة</Text>
          <Text style={pdfBrandStyles.servicesText}>{servicesBulleted}</Text>
        </View>
      ) : null}
    </View>
  </View>
);

export function pdfFmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

export function pdfFmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export function pdfFmtMoneyLibyan(n: number) {
  return `${LIBYAN_CURRENCY_LABEL} ${pdfFmtNum(n)}`;
}

/** مكوّن يعرض المبلغ ثم العملة بشكل مضمون بدون انعكاس RTL */
export const PdfMoneyText = ({
  amount,
  style,
  currStyle,
  containerStyle,
}: {
  amount: number;
  style?: any;
  currStyle?: any;
  containerStyle?: any;
}) => (
  <View
    wrap={false}
    style={[
      {
        flexDirection: "row-reverse",
        alignItems: "baseline",
        justifyContent: "flex-start",
      },
      containerStyle,
    ]}
  >
    <Text style={style}>{pdfFmtNum(amount)}</Text>
    <Text
      style={[
        { fontSize: 9, color: PDFPalette.text, fontWeight: "bold", marginRight: 3 },
        currStyle,
      ]}
    >
      {LIBYAN_CURRENCY_LABEL}
    </Text>
  </View>
);
