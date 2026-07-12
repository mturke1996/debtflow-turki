import React from "react";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { PDF_COMPANY_INFO } from "@/constants/pdfCompanyInfo";
import { COMPANY_INFO } from "@/constants/companyInfo";
import { PDF_FONT_FAMILY } from "./pdfFonts";

/** Ledger Stone print system — matches app brand (teal + warm stone) */
export const PDFPalette = {
  primary: "#0f766e",
  primaryDark: "#0d5c56",
  accent: "#78716c",
  accentLight: "#a8a29e",
  text: "#1c1917",
  muted: "#57534e",
  white: "#ffffff",
  canvas: "#f7f6f3",
  border: "#e7e5e4",
  rowAlt: "#fafaf9",
  success: "#15803d",
  warning: "#b45309",
  danger: "#b91c1c",
  headerBg: "#0f766e",
  paleGold: "#faf8f5",
  softTeal: "#edf3f2",
};

export const LIBYAN_CURRENCY_LABEL = "د.ل";

export const PDF_PAGINATION = {
  tableHead: 32,
  minRowHeight: 28,
  totalBar: 36,
} as const;

export type PdfSummaryCell = {
  label: string;
  value: number | string;
  color?: string;
  accent?: boolean;
  money?: boolean;
};

export const pdfBrandStyles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9,
    color: PDFPalette.text,
    backgroundColor: PDFPalette.white,
    paddingTop: 30,
    paddingBottom: 70,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#d6d3d1",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  titleAr: { fontSize: 12, fontWeight: "bold", color: PDFPalette.primaryDark },

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
    bottom: 12,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: PDFPalette.border,
    paddingTop: 7,
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
    marginBottom: 2,
    textAlign: "center",
  },
  footerEng: {
    fontSize: 8,
    fontWeight: "bold",
    color: PDFPalette.accent,
    marginBottom: 2,
    textAlign: "center",
  },
  footerMuted: {
    fontSize: 7.4,
    color: PDFPalette.muted,
    lineHeight: 1.4,
    marginBottom: 1,
    textAlign: "center",
  },
  footerNote: { fontSize: 6.6, color: PDFPalette.accentLight, textAlign: "center" },
  footerPage: {
    position: "absolute",
    bottom: 12,
    left: 36,
    fontSize: 7.5,
    fontWeight: "bold",
    color: PDFPalette.muted,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  datesCol: { width: "38%" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  dateLabel: { fontSize: 8.5, color: PDFPalette.accentLight, textAlign: "right" },
  dateVal: { fontSize: 8.5, fontWeight: "bold", color: PDFPalette.text, textAlign: "left" },

  clientBox: {
    width: "55%",
    paddingVertical: 4,
    paddingRight: 12,
    borderRightWidth: 2.5,
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
    fontSize: 13,
    fontWeight: "bold",
    color: PDFPalette.text,
    textAlign: "right",
    marginBottom: 2,
  },
  clientSub: { fontSize: 8.8, color: PDFPalette.muted, marginTop: 2, textAlign: "right" },

  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
    marginBottom: 6,
    marginTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: PDFPalette.border,
    textAlign: "right",
  },

  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 7,
    backgroundColor: PDFPalette.rowAlt,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PDFPalette.border,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 7.8,
    color: PDFPalette.muted,
    marginBottom: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
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
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 2,
  },
  th: {
    color: PDFPalette.white,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: PDFPalette.border,
  },
  rowEven: { backgroundColor: PDFPalette.rowAlt },

  td: { fontSize: 8.5, color: PDFPalette.text, textAlign: "right" },
  tdBold: { fontSize: 8.5, fontWeight: "bold", color: PDFPalette.text, textAlign: "right" },
  tdPos: { fontSize: 8.5, fontWeight: "bold", color: PDFPalette.success, textAlign: "right" },
  tdNeg: { fontSize: 8.5, fontWeight: "bold", color: PDFPalette.danger, textAlign: "right" },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: PDFPalette.softTeal,
    borderTopWidth: 1.5,
    borderTopColor: PDFPalette.primary,
    marginTop: 1,
    borderRadius: 2,
  },

  grandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: PDFPalette.primary,
  },
  grandLbl: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
    textAlign: "right",
  },
  grandAmt: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
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
  notesTxt: { fontSize: 9.5, color: PDFPalette.muted, textAlign: "right", lineHeight: 1.65 },

  settleBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: PDFPalette.border,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: PDFPalette.white,
  },
  settleHead: {
    backgroundColor: PDFPalette.softTeal,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: PDFPalette.border,
    alignItems: "flex-end",
  },
  settleHeadTxt: {
    fontSize: 11,
    fontWeight: "bold",
    color: PDFPalette.primaryDark,
    textAlign: "right",
  },
  settleBody: { paddingVertical: 8, paddingHorizontal: 12 },
  settleLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  settleLbl: {
    fontSize: 9.5,
    color: PDFPalette.muted,
    fontWeight: "bold",
    textAlign: "right",
  },
  settleDivider: {
    borderTopWidth: 1,
    borderTopColor: PDFPalette.border,
    marginVertical: 4,
  },
  settleResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: PDFPalette.canvas,
    borderTopWidth: 1.5,
    borderTopColor: PDFPalette.primary,
  },
  settleResultLbl: {
    fontSize: 11,
    fontWeight: "bold",
    color: PDFPalette.text,
    textAlign: "right",
  },
  settleHint: {
    fontSize: 7.5,
    color: PDFPalette.muted,
    textAlign: "right",
    paddingHorizontal: 12,
    paddingBottom: 8,
    lineHeight: 1.45,
  },
  emptyBox: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: PDFPalette.rowAlt,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PDFPalette.border,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTxt: {
    fontSize: 9,
    color: PDFPalette.muted,
    fontWeight: "bold",
    textAlign: "center",
  },
  formulaBox: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: PDFPalette.paleGold,
    borderRadius: 4,
    borderRightWidth: 3,
    borderRightColor: PDFPalette.primary,
    alignItems: "flex-end",
  },
  formulaTxt: {
    fontSize: 8.2,
    color: PDFPalette.muted,
    textAlign: "right",
    lineHeight: 1.5,
  },
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
    <>
      <View style={pdfBrandStyles.footer} fixed>
        <Text style={pdfBrandStyles.footerBrand}>{PDF_COMPANY_INFO.fullName}</Text>
        {PDF_COMPANY_INFO.engineerName ? (
          <Text style={pdfBrandStyles.footerEng}>{PDF_COMPANY_INFO.engineerName}</Text>
        ) : null}
        {line1 ? <Text style={pdfBrandStyles.footerMuted}>{line1}</Text> : null}
        {line2 ? <Text style={pdfBrandStyles.footerMuted}>{line2}</Text> : null}
        <Text style={pdfBrandStyles.footerNote}>{PDF_COMPANY_INFO.footerNote}</Text>
      </View>
      <Text
        style={pdfBrandStyles.footerPage}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </>
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
  const value = Number(n) || 0;
  if (Number.isInteger(value)) {
    return new Intl.NumberFormat("en-US").format(value);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
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

export const PdfSummaryStrip = ({ cells }: { cells: PdfSummaryCell[] }) => (
  <View style={[pdfBrandStyles.summaryRow, { marginBottom: 18 }]} wrap={false}>
    {cells.map((cell) => (
      <View
        key={cell.label}
        style={[
          pdfBrandStyles.summaryCard,
          cell.accent
            ? {
                borderTopWidth: 3,
                borderTopColor: cell.color ?? PDFPalette.primary,
                backgroundColor: "#fffcfc",
              }
            : {},
        ]}
      >
        <Text style={pdfBrandStyles.summaryLabel}>{cell.label}</Text>
        {cell.money && typeof cell.value === "number" ? (
          <PdfMoneyText
            amount={cell.value}
            style={[pdfBrandStyles.summaryValue, cell.color ? { color: cell.color } : null]}
            containerStyle={{ justifyContent: "center" }}
          />
        ) : (
          <Text
            style={[
              pdfBrandStyles.summaryValue,
              cell.color ? { color: cell.color } : null,
            ]}
          >
            {String(cell.value)}
          </Text>
        )}
      </View>
    ))}
  </View>
);

export const PdfSectionTitle = ({
  children,
  compact,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) => (
  <Text
    style={[pdfBrandStyles.sectionTitle, compact ? { marginTop: 8 } : null]}
    minPresenceAhead={PDF_PAGINATION.tableHead + PDF_PAGINATION.minRowHeight}
  >
    {children}
  </Text>
);

export const PdfEmptyBlock = ({ message }: { message: string }) => (
  <View style={pdfBrandStyles.emptyBox} wrap={false}>
    <Text style={pdfBrandStyles.emptyTxt}>{message}</Text>
  </View>
);

type SettlementLine = {
  label: string;
  amount: number;
  color?: string;
  emphasize?: boolean;
};

export const PdfSettlementCard = ({
  title,
  lines,
  resultLabel,
  resultAmount,
  resultColor,
  hint,
}: {
  title: string;
  lines: SettlementLine[];
  resultLabel: string;
  resultAmount: number;
  resultColor: string;
  hint?: string;
}) => (
  <View style={pdfBrandStyles.settleBox} wrap={false}>
    <View style={pdfBrandStyles.settleHead}>
      <Text style={pdfBrandStyles.settleHeadTxt}>{title}</Text>
    </View>
    <View style={pdfBrandStyles.settleBody}>
      {lines.map((line, index) => {
        const prev = lines[index - 1];
        const showDivider = Boolean(line.emphasize && prev && !prev.emphasize);
        return (
          <React.Fragment key={line.label}>
            {showDivider ? <View style={pdfBrandStyles.settleDivider} /> : null}
            <View style={pdfBrandStyles.settleLine}>
              <PdfMoneyText
                amount={line.amount}
                style={[
                  pdfBrandStyles.grandAmt,
                  {
                    fontSize: line.emphasize ? 12 : 10.5,
                    color: line.color ?? PDFPalette.text,
                  },
                ]}
              />
              <Text
                style={[
                  pdfBrandStyles.settleLbl,
                  line.emphasize ? { color: PDFPalette.text, fontSize: 10 } : null,
                ]}
              >
                {line.label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
    <View style={pdfBrandStyles.settleResult}>
      <PdfMoneyText
        amount={resultAmount}
        style={[pdfBrandStyles.grandAmt, { fontSize: 14, color: resultColor }]}
      />
      <Text style={pdfBrandStyles.settleResultLbl}>{resultLabel}</Text>
    </View>
    {hint ? <Text style={pdfBrandStyles.settleHint}>{hint}</Text> : null}
  </View>
);
