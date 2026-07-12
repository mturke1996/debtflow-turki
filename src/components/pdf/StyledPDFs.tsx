import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import "./pdfFonts";
import type { Client, Expense, ExpenseInvoice, Invoice, Payment, StandaloneDebt } from "@/types";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import { invoiceStatuses, paymentMethods } from "@/utils/formatters";
import {
  PdfBrandedFooter,
  PdfBrandedReportHeader,
  pdfBrandStyles as s,
  pdfFmtDate,
  pdfFmtNum,
  PdfMoneyText,
  PdfSectionTitle,
  PdfSummaryStrip,
  PdfEmptyBlock,
  PdfSettlementCard,
  PDF_PAGINATION,
} from "./pdfBrandKit";
import { expenseHasQuantityLine, formatQuantityDisplay } from "@/utils/expenseFormUtils";

const payLabel = (m: string) => paymentMethods[m as keyof typeof paymentMethods] ?? m;

const dangerColor = "#b91c1c";
const successColor = "#15803d";
const accentColor = "#78716c";
const primaryColor = "#0f766e";
const primaryDark = "#0d5c56";

const invoiceStatusAr = (st: Invoice["status"]) =>
  invoiceStatuses[st as keyof typeof invoiceStatuses] ?? st;

/* أعمدة جداول (ترتيب من اليسار لليمين كنموذج إطلالة) */
const ci = {
  desc: { flex: 1, textAlign: "right" as const, paddingRight: 4 },
  qty: { width: 52, textAlign: "center" as const },
  price: { width: 74, textAlign: "center" as const },
  total: { width: 82, textAlign: "left" as const, paddingLeft: 4 },

  amt: { width: 78, textAlign: "left" as const, paddingLeft: 4 },
  dt: { width: 76, textAlign: "center" as const },
  cat: { width: 88, textAlign: "right" as const, paddingRight: 4 },
  note: { width: "18%", textAlign: "right" as const, paddingRight: 4 },

  meth: { width: 94, textAlign: "right" as const },
  pnote: { flex: 1, textAlign: "right" as const },

  cClient: { width: 124, textAlign: "right" as const },
  cInv: { width: 100, textAlign: "right" as const },
  cPer: { width: 118, textAlign: "center" as const },
};

export const InvoiceStyledPDF = ({ invoice, client }: { invoice: Invoice; client: Client }) => (
  <Document title={`فاتورة-${invoice.invoiceNumber}`} language="ar">
    <Page size="A4" style={s.page}>
      <PdfBrandedReportHeader
        titleEn="INVOICE"
        subtitleAr="فاتورة رسمية"
        refLine={`#${invoice.invoiceNumber}`}
      />

      <View style={s.infoRow}>
        <View style={s.datesCol}>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>الإصدار</Text>
            <Text style={s.dateVal}>{pdfFmtDate(invoice.issueDate)}</Text>
          </View>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>الاستحقاق</Text>
            <Text style={s.dateVal}>{pdfFmtDate(invoice.dueDate)}</Text>
          </View>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>الحالة</Text>
            <Text style={s.dateVal}>{invoiceStatusAr(invoice.status)}</Text>
          </View>
        </View>
        <View style={s.clientBox}>
          <Text style={s.clientSectionLbl}>إلى السيد / السادة</Text>
          <Text style={s.clientName}>{client.name}</Text>
          {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
          {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, ci.total]}>الإجمالي</Text>
        <Text style={[s.th, ci.price]}>سعر الوحدة</Text>
        <Text style={[s.th, ci.qty]}>الكمية</Text>
        <Text style={[s.th, ci.desc]}>الوصف</Text>
      </View>
      {invoice.items.map((item, i) => (
        <View key={item.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <View style={[ci.total, { flexDirection: 'row' }]}>
            <PdfMoneyText amount={item.total} style={s.tdBold} />
          </View>
          <PdfMoneyText amount={item.unitPrice} style={s.td} containerStyle={ci.price} />
          <Text style={[s.td, ci.qty]}>{item.quantity}</Text>
          <Text style={[s.tdBold, ci.desc]}>{item.description}</Text>
        </View>
      ))}

      <View style={s.totalsBox}>
        <View style={s.totalLine}>
          <View style={{ flexDirection: 'row' }}>
            <PdfMoneyText amount={invoice.subtotal} style={s.grandAmt} />
          </View>
          <Text style={s.grandLbl}>المجموع الفرعي</Text>
        </View>
        {invoice.taxAmount > 0 ? (
          <View style={s.totalLine}>
            <PdfMoneyText amount={invoice.taxAmount} style={s.grandAmt} />
            <Text style={s.grandLbl}>ضريبة ({invoice.taxRate}%)</Text>
          </View>
        ) : null}
        <View style={s.grandBar}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <PdfMoneyText amount={invoice.total} style={[s.grandAmt, { fontSize: 15 }]} />
          </View>
          <Text style={[s.grandLbl, { fontSize: 12 }]}>الإجمالي النهائي</Text>
        </View>
      </View>

      {invoice.notes ? (
        <View style={s.notesBox}>
          <Text style={s.notesLbl}>ملاحظات</Text>
          <Text style={s.notesTxt}>
            {invoice.notes.replace(/__TEMP_CLIENT__name:.+?__phone:.+?__/g, "").trim()}
          </Text>
        </View>
      ) : null}

      <PdfBrandedFooter />
    </Page>
  </Document>
);

export const ExpensesStyledPDF = ({ client, expenses }: { client: Client; expenses: Expense[] }) => {
  const total = expenses.reduce((x, y) => x + y.amount, 0);
  return (
    <Document title={`مصروفات-${client.name}`} language="ar">
      <Page size="A4" style={s.page}>
        <PdfBrandedReportHeader titleEn="EXPENSES" subtitleAr="كشف المصروفات المعتمدة" />

        <View style={s.infoRow}>
          <View style={s.datesCol}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ التقرير</Text>
              <Text style={s.dateVal}>{pdfFmtDate(new Date().toISOString())}</Text>
            </View>
          </View>
          <View style={s.clientBox}>
            <Text style={s.clientSectionLbl}>تقرير لحساب</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
            {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
          </View>
        </View>

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>عدد السجلات</Text>
            <Text style={s.summaryValue}>{expenses.length}</Text>
          </View>
          <View style={[s.summaryCard, { borderTopWidth: 3, borderTopColor: dangerColor, backgroundColor: "#fffcfc" }]}>
            <Text style={s.summaryLabel}>إجمالي المصروفات</Text>
            <PdfMoneyText
              amount={total}
              style={[s.summaryValue, { color: dangerColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>تفاصيل الحركة</Text>
        <View style={s.tableHead}>
          <Text style={[s.th, ci.amt]}>المبلغ</Text>
          <Text style={[s.th, ci.dt]}>التاريخ</Text>
          <Text style={[s.th, ci.cat]}>التصنيف</Text>
          <Text style={[s.th, ci.note]}>ملاحظات</Text>
          <Text style={[s.th, ci.desc]}>البيان</Text>
        </View>
        {expenses.map((e, i) => (
          <View key={e.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <PdfMoneyText amount={e.amount} style={s.tdBold} containerStyle={ci.amt} />
            <Text style={[s.td, ci.dt]}>{pdfFmtDate(e.date)}</Text>
            <Text style={[s.td, ci.cat]}>{normalizeCategoryLabel(e.category) || "—"}</Text>
            <Text style={[s.td, ci.note]}>{e.notes || "—"}</Text>
            <Text style={[s.tdBold, ci.desc]}>{e.description}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <PdfMoneyText amount={total} style={s.tdBold} containerStyle={ci.amt} currStyle={{ fontSize: 10, color: "#1a1f1a" }} />
          <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>إجمالي المصروفات</Text>
        </View>

        <PdfBrandedFooter />
      </Page>
    </Document>
  );
};

export const PaymentsStyledPDF = ({ client, payments }: { client: Client; payments: Payment[] }) => {
  const total = payments.reduce((x, y) => x + y.amount, 0);
  return (
    <Document title={`مدفوعات-${client.name}`} language="ar">
      <Page size="A4" style={s.page}>
        <PdfBrandedReportHeader titleEn="PAYMENTS" subtitleAr="كشف المبالغ الواردة" />

        <View style={s.infoRow}>
          <View style={s.datesCol}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ التقرير</Text>
              <Text style={s.dateVal}>{pdfFmtDate(new Date().toISOString())}</Text>
            </View>
          </View>
          <View style={s.clientBox}>
            <Text style={s.clientSectionLbl}>صاحب الحساب</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
            {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
          </View>
        </View>

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>عدد الدفعات</Text>
            <Text style={s.summaryValue}>{payments.length}</Text>
          </View>
          <View style={[s.summaryCard, { borderTopWidth: 3, borderTopColor: successColor, backgroundColor: "#f5fbf8" }]}>
            <Text style={s.summaryLabel}>إجمالي الوارد</Text>
            <PdfMoneyText
              amount={total}
              style={[s.summaryValue, { color: successColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>سجل الدفعات</Text>
        <View style={s.tableHead}>
          <Text style={[s.th, ci.amt]}>المبلغ</Text>
          <Text style={[s.th, ci.dt]}>التاريخ</Text>
          <Text style={[s.th, ci.meth]}>طريقة الدفع</Text>
          <Text style={[s.th, ci.pnote]}>ملاحظات</Text>
        </View>
        {payments.map((p, i) => (
          <View key={p.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <PdfMoneyText amount={p.amount} style={s.tdPos} containerStyle={ci.amt} />
            <Text style={[s.td, ci.dt]}>{pdfFmtDate(p.paymentDate)}</Text>
            <Text style={[s.td, ci.meth]}>{payLabel(p.paymentMethod)}</Text>
            <Text style={[s.td, ci.pnote]}>{p.notes || "—"}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <PdfMoneyText amount={total} style={s.tdBold} containerStyle={ci.amt} currStyle={{ fontSize: 10, color: "#1a1f1a" }} />
          <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>الإجمالي</Text>
        </View>

        <PdfBrandedFooter />
      </Page>
    </Document>
  );
};

/* ============================================================
   التقرير المالي الشامل — وثيقة تسوية لحساب العميل
   ============================================================ */
export const ClientFinalStyledPDF = ({
  client,
  expenses,
  payments,
  debts = [],
  profitPercentage,
}: {
  client: Client;
  expenses: Expense[];
  payments: Payment[];
  debts?: StandaloneDebt[];
  profitPercentage: number;
}) => {
  const sortedExpenses = [...expenses].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const sortedPayments = [...payments].sort(
    (a, b) => +new Date(b.paymentDate) - +new Date(a.paymentDate)
  );
  const sortedDebts = [...debts].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const totalExpenses = expenses.reduce((x, y) => x + y.amount, 0);
  const totalPaid = payments.reduce((x, y) => x + y.amount, 0);
  const profit = (totalExpenses * (profitPercentage || 0)) / 100;
  const remainingDebts = debts.reduce((x, y) => x + y.remainingAmount, 0);
  const obligations = totalExpenses + profit + remainingDebts;
  const balance = obligations - totalPaid;
  const remaining = Math.max(balance, 0);
  const surplus = Math.max(-balance, 0);
  const settled = balance === 0;

  const today = pdfFmtDate(new Date().toISOString());
  const allDates = [
    ...expenses.map((e) => +new Date(e.date)),
    ...payments.map((p) => +new Date(p.paymentDate)),
    ...debts.map((d) => +new Date(d.date)),
  ].filter((n) => Number.isFinite(n) && n > 0);
  const minDate = allDates.length ? new Date(Math.min(...allDates)).toISOString() : null;
  const maxDate = allDates.length ? new Date(Math.max(...allDates)).toISOString() : null;

  const resultColor = surplus > 0 ? successColor : remaining > 0 ? dangerColor : primaryDark;
  const resultLabel = surplus > 0 ? "فائض لصالح العميل" : remaining > 0 ? "المبلغ المتبقي للسداد" : "الحساب مسدَّد بالكامل";

  const pdfExpenseQty = (e: Expense) =>
    expenseHasQuantityLine({ quantity: e.quantity ?? null, unitPrice: e.unitPrice ?? null })
      ? formatQuantityDisplay(e.quantity!, e.unit)
      : "—";

  const pdfExpenseUnitPrice = (e: Expense) =>
    expenseHasQuantityLine({ quantity: e.quantity ?? null, unitPrice: e.unitPrice ?? null })
      ? pdfFmtNum(e.unitPrice!)
      : "—";

  const expenseNote = (e: Expense) =>
    [e.supplierInvoiceNumber ? `فاتورة: ${e.supplierInvoiceNumber}` : "", e.notes || ""]
      .filter(Boolean)
      .join(" - ") || "—";

  const Cf = {
    amt: { width: 68, textAlign: "left" as const, paddingLeft: 3 },
    qty: { width: 48, textAlign: "center" as const },
    uprice: { width: 58, textAlign: "center" as const },
    dt: { width: 62, textAlign: "center" as const },
    cat: { width: 68, textAlign: "right" as const, paddingRight: 3 },
    desc: { flex: 1, textAlign: "right" as const, paddingRight: 3 },
    note: { width: "15%", textAlign: "right" as const, paddingRight: 3 },
    meth: { width: 72, textAlign: "right" as const },
    pnote: { flex: 1, textAlign: "right" as const, paddingRight: 3 },
    party: { width: 92, textAlign: "right" as const, paddingRight: 3 },
    status: { width: 50, textAlign: "center" as const },
  };

  const tableHeadAhead = PDF_PAGINATION.tableHead + PDF_PAGINATION.minRowHeight;
  const debtStatusAr = (st: StandaloneDebt["status"]) => (st === "paid" ? "مسدد" : "نشط");

  return (
    <Document
      title={`التقرير-الشامل-${client.name}`}
      author="شركة المهندسة"
      subject="التقرير المالي الشامل"
      language="ar"
    >
      <Page size="A4" style={s.page} wrap>
        <PdfBrandedFooter />

        <View wrap={false} style={{ marginBottom: 10 }}>
          <PdfBrandedReportHeader
            titleEn="LEDGER REPORT"
            subtitleAr="التقرير المالي الشامل"
            refLine={`${client.name}  ·  ${today}`}
          />

          <View style={s.infoRow}>
            <View style={s.datesCol}>
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>تاريخ التقرير</Text>
                <Text style={s.dateVal}>{today}</Text>
              </View>
              {minDate ? (
                <View style={s.dateRow}>
                  <Text style={s.dateLabel}>أول حركة</Text>
                  <Text style={s.dateVal}>{pdfFmtDate(minDate)}</Text>
                </View>
              ) : null}
              {maxDate ? (
                <View style={s.dateRow}>
                  <Text style={s.dateLabel}>آخر حركة</Text>
                  <Text style={s.dateVal}>{pdfFmtDate(maxDate)}</Text>
                </View>
              ) : null}
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>الحركات</Text>
                <Text style={s.dateVal}>
                  {expenses.length + payments.length + debts.length}
                </Text>
              </View>
            </View>

            <View style={s.clientBox}>
              <Text style={s.clientSectionLbl}>تقرير حساب العميل</Text>
              <Text style={s.clientName}>{client.name}</Text>
              {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
              {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
              {client.email ? <Text style={s.clientSub}>{client.email}</Text> : null}
            </View>
          </View>

          <PdfSummaryStrip
            cells={[
              {
                label: "إجمالي المقبوض",
                value: totalPaid,
                color: successColor,
                accent: true,
                money: true,
              },
              {
                label: `نسبة الإدارة (${profitPercentage}%)`,
                value: profit,
                color: accentColor,
                money: true,
              },
              {
                label: "إجمالي المستحق",
                value: obligations,
                color: dangerColor,
                accent: true,
                money: true,
              },
              {
                label: surplus > 0 ? "فائض دفع" : remaining > 0 ? "المتبقي" : "الرصيد",
                value: surplus > 0 ? surplus : remaining,
                color: resultColor,
                accent: true,
                money: true,
              },
            ]}
          />

          <View style={s.formulaBox}>
            <Text style={s.formulaTxt}>
              طريقة الحساب: المستحق = المصروفات + نسبة الإدارة + الديون غير المسددة · المتبقي = المستحق − المقبوض
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 8 }}>
          <PdfSectionTitle>المصروفات ({expenses.length})</PdfSectionTitle>
          {expenses.length === 0 ? (
            <PdfEmptyBlock message="لا توجد مصروفات مسجّلة لهذا العميل" />
          ) : (
            <>
              <View style={s.tableHead} minPresenceAhead={tableHeadAhead}>
                <Text style={[s.th, Cf.amt]}>المبلغ</Text>
                <Text style={[s.th, Cf.uprice]}>سعر الوحدة</Text>
                <Text style={[s.th, Cf.qty]}>الكمية</Text>
                <Text style={[s.th, Cf.dt]}>التاريخ</Text>
                <Text style={[s.th, Cf.cat]}>التصنيف</Text>
                <Text style={[s.th, Cf.note]}>ملاحظات</Text>
                <Text style={[s.th, Cf.desc]}>البيان</Text>
              </View>
              {sortedExpenses.map((e, i) => (
                <View
                  key={e.id}
                  style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                  wrap={false}
                  minPresenceAhead={PDF_PAGINATION.minRowHeight}
                >
                  <PdfMoneyText
                    amount={e.amount}
                    style={[s.tdBold, { color: dangerColor }]}
                    containerStyle={Cf.amt}
                  />
                  <Text style={[s.td, Cf.uprice]}>{pdfExpenseUnitPrice(e)}</Text>
                  <Text style={[s.td, Cf.qty]}>{pdfExpenseQty(e)}</Text>
                  <Text style={[s.td, Cf.dt]}>{pdfFmtDate(e.date)}</Text>
                  <Text style={[s.td, Cf.cat]}>{normalizeCategoryLabel(e.category) || "—"}</Text>
                  <Text style={[s.td, Cf.note]}>{expenseNote(e)}</Text>
                  <Text style={[s.tdBold, Cf.desc]}>{e.description || "—"}</Text>
                </View>
              ))}
              <View style={s.totalRow} wrap={false} minPresenceAhead={PDF_PAGINATION.totalBar}>
                <PdfMoneyText amount={totalExpenses} style={s.tdBold} containerStyle={Cf.amt} />
                <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>إجمالي المصروفات</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ marginBottom: 8 }}>
          <PdfSectionTitle compact>المدفوعات ({payments.length})</PdfSectionTitle>
          {payments.length === 0 ? (
            <PdfEmptyBlock message="لا توجد مدفوعات مسجّلة لهذا العميل" />
          ) : (
            <>
              <View style={s.tableHead} minPresenceAhead={tableHeadAhead}>
                <Text style={[s.th, Cf.amt]}>المبلغ</Text>
                <Text style={[s.th, Cf.dt]}>التاريخ</Text>
                <Text style={[s.th, Cf.meth]}>الوسيلة</Text>
                <Text style={[s.th, Cf.pnote]}>ملاحظات</Text>
              </View>
              {sortedPayments.map((p, i) => (
                <View
                  key={p.id}
                  style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                  wrap={false}
                  minPresenceAhead={PDF_PAGINATION.minRowHeight}
                >
                  <PdfMoneyText amount={p.amount} style={s.tdPos} containerStyle={Cf.amt} />
                  <Text style={[s.td, Cf.dt]}>{pdfFmtDate(p.paymentDate)}</Text>
                  <Text style={[s.td, Cf.meth]}>{payLabel(p.paymentMethod)}</Text>
                  <Text style={[s.td, Cf.pnote]}>{p.notes || "—"}</Text>
                </View>
              ))}
              <View style={s.totalRow} wrap={false} minPresenceAhead={PDF_PAGINATION.totalBar}>
                <PdfMoneyText amount={totalPaid} style={s.tdBold} containerStyle={Cf.amt} />
                <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>إجمالي المدفوعات</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ marginBottom: 8 }}>
          <PdfSectionTitle compact>الديون ({debts.length})</PdfSectionTitle>
          {debts.length === 0 ? (
            <PdfEmptyBlock message="لا توجد ديون مسجّلة لهذا العميل" />
          ) : (
            <>
              <View style={s.tableHead} minPresenceAhead={tableHeadAhead}>
                <Text style={[s.th, Cf.amt]}>متبقي</Text>
                <Text style={[s.th, Cf.amt]}>مدفوع</Text>
                <Text style={[s.th, Cf.amt]}>الإجمالي</Text>
                <Text style={[s.th, Cf.dt]}>التاريخ</Text>
                <Text style={[s.th, Cf.status]}>الحالة</Text>
                <Text style={[s.th, Cf.desc]}>الوصف</Text>
                <Text style={[s.th, Cf.party]}>الطرف</Text>
              </View>
              {sortedDebts.map((d, i) => (
                <View
                  key={d.id}
                  style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                  wrap={false}
                  minPresenceAhead={PDF_PAGINATION.minRowHeight}
                >
                  <PdfMoneyText
                    amount={d.remainingAmount}
                    style={[s.tdBold, { color: dangerColor }]}
                    containerStyle={Cf.amt}
                  />
                  <PdfMoneyText amount={d.paidAmount} style={s.tdPos} containerStyle={Cf.amt} />
                  <PdfMoneyText amount={d.amount} style={s.tdBold} containerStyle={Cf.amt} />
                  <Text style={[s.td, Cf.dt]}>{pdfFmtDate(d.date)}</Text>
                  <Text
                    style={[
                      s.tdBold,
                      Cf.status,
                      { color: d.status === "paid" ? successColor : dangerColor },
                    ]}
                  >
                    {debtStatusAr(d.status)}
                  </Text>
                  <Text style={[s.td, Cf.desc]}>
                    {d.description || "—"}
                    {d.notes ? ` - ${d.notes}` : ""}
                  </Text>
                  <Text style={[s.tdBold, Cf.party]}>{d.partyName || "—"}</Text>
                </View>
              ))}
              <View style={s.totalRow} wrap={false} minPresenceAhead={PDF_PAGINATION.totalBar}>
                <PdfMoneyText
                  amount={remainingDebts}
                  style={[s.tdBold, { color: dangerColor }]}
                  containerStyle={Cf.amt}
                />
                <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>
                  إجمالي الديون غير المسددة
                </Text>
              </View>
            </>
          )}
        </View>

        <PdfSettlementCard
          title="خلاصة التسوية النهائية"
          lines={[
            { label: "إجمالي المصروفات", amount: totalExpenses },
            { label: `نسبة الإدارة (${profitPercentage}%)`, amount: profit },
            { label: "ديون غير مسددة", amount: remainingDebts },
            {
              label: "إجمالي المستحق",
              amount: obligations,
              color: primaryColor,
              emphasize: true,
            },
            {
              label: "إجمالي المقبوض",
              amount: totalPaid,
              color: successColor,
              emphasize: true,
            },
          ]}
          resultLabel={resultLabel}
          resultAmount={surplus > 0 ? surplus : remaining}
          resultColor={resultColor}
          hint={
            settled
              ? "لا يوجد رصيد متبقٍ على هذا الحساب في تاريخ إعداد التقرير."
              : surplus > 0
                ? "المبلغ المدفوع أعلى من المستحق، والفائض لصالح العميل."
                : "المبلغ المتبقي هو ما يلزم سداده لإغلاق الحساب وفق البيانات الحالية."
          }
        />
      </Page>
    </Document>
  );
};

export const ExpenseInvoiceStyledPDF = ({ invoice, client }: { invoice: ExpenseInvoice; client: Client }) => (
  <Document title={`فاتورة-مصاريف-${invoice.invoiceNumber}`} language="ar">
    <Page size="A4" style={s.page}>
      <PdfBrandedReportHeader titleEn="EXP. INVOICE" subtitleAr="فاتورة تجميع مصروفات" refLine={`#${invoice.invoiceNumber}`} />

      <View style={s.infoRow}>
        <View style={s.datesCol}>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>من تاريخ</Text>
            <Text style={s.dateVal}>{pdfFmtDate(invoice.startDate)}</Text>
          </View>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>إلى تاريخ</Text>
            <Text style={s.dateVal}>{pdfFmtDate(invoice.endDate)}</Text>
          </View>
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>تاريخ الإصدار</Text>
            <Text style={s.dateVal}>{pdfFmtDate(invoice.issueDate)}</Text>
          </View>
        </View>
        <View style={s.clientBox}>
          <Text style={s.clientSectionLbl}>المكلف بالسداد</Text>
          <Text style={s.clientName}>{client.name}</Text>
          {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
          {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, ci.amt]}>المبلغ</Text>
        <Text style={[s.th, ci.cat]}>الفئة</Text>
        <Text style={[s.th, ci.dt]}>التاريخ</Text>
        <Text style={[s.th, ci.desc]}>الوصف</Text>
      </View>
      {invoice.expenses.map((e, i) => (
        <View key={e.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <PdfMoneyText amount={e.amount} style={s.tdBold} containerStyle={ci.amt} />
          <Text style={[s.td, ci.cat]}>{normalizeCategoryLabel(e.category) || "—"}</Text>
          <Text style={[s.td, ci.dt]}>{pdfFmtDate(e.date)}</Text>
          <Text style={[s.tdBold, ci.desc]}>{e.description}</Text>
        </View>
      ))}

      <View style={s.grandBar}>
        <Text style={s.grandLbl}>المبلغ الإجمالي المستحق</Text>
        <PdfMoneyText amount={invoice.totalAmount} style={[s.grandAmt, { color: primaryColor }]} />
      </View>

      {invoice.notes ? (
        <View style={s.notesBox}>
          <Text style={s.notesLbl}>ملاحظات</Text>
          <Text style={s.notesTxt}>
            {invoice.notes.replace(/__TEMP_CLIENT__name:.+?__phone:.+?__/g, "").trim()}
          </Text>
        </View>
      ) : null}

      <PdfBrandedFooter />
    </Page>
  </Document>
);

export const PaymentsSummaryStyledPDF = ({ payments, clients }: { payments: Payment[]; clients: Client[] }) => {
  const total = payments.reduce((x, y) => x + y.amount, 0);
  return (
    <Document title="مدفوعات-شامل" language="ar">
      <Page size="A4" style={s.page}>
        <PdfBrandedReportHeader titleEn="COLLECTIONS" subtitleAr="تقرير المدفوعات لجميع العملاء" />

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>إجمالي السجلات</Text>
            <Text style={s.summaryValue}>{payments.length}</Text>
          </View>
          <View style={[s.summaryCard, { borderTopWidth: 3, borderTopColor: successColor }]}>
            <Text style={s.summaryLabel}>إجمالي المبالغ</Text>
            <PdfMoneyText
              amount={total}
              style={[s.summaryValue, { color: successColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
        </View>

        <View style={s.tableHead}>
          <Text style={[s.th, ci.amt]}>المبلغ</Text>
          <Text style={[s.th, ci.dt]}>التاريخ</Text>
          <Text style={[s.th, ci.meth]}>الوسيلة</Text>
          <Text style={[s.th, ci.cClient]}>العميل</Text>
        </View>
        {payments.map((p, i) => (
          <View key={p.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <PdfMoneyText amount={p.amount} style={s.tdPos} containerStyle={ci.amt} />
            <Text style={[s.td, ci.dt]}>{pdfFmtDate(p.paymentDate)}</Text>
            <Text style={[s.td, ci.meth]}>{payLabel(p.paymentMethod)}</Text>
            <Text style={[s.tdBold, ci.cClient]}>{clients.find((c) => c.id === p.clientId)?.name || "—"}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <PdfMoneyText amount={total} style={s.tdBold} containerStyle={ci.amt} />
          <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>الإجمالي العام</Text>
        </View>

        <PdfBrandedFooter />
      </Page>
    </Document>
  );
};

export const ExpenseInvoicesSummaryStyledPDF = ({
  expenseInvoices,
  clients,
}: {
  expenseInvoices: ExpenseInvoice[];
  clients: Client[];
}) => {
  const sum = expenseInvoices.reduce((x, y) => x + y.totalAmount, 0);
  return (
    <Document title="فواتير-مصاريف-شامل" language="ar">
      <Page size="A4" style={s.page}>
        <PdfBrandedReportHeader titleEn="INVOICES" subtitleAr="قائمة فواتير المصروفات الصادرة" />

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>عدد الفواتير</Text>
            <Text style={s.summaryValue}>{expenseInvoices.length}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>مجموع المبالغ</Text>
            <PdfMoneyText
              amount={sum}
              style={s.summaryValue}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
        </View>

        <View style={s.tableHead}>
          <Text style={[s.th, ci.amt]}>الإجمالي</Text>
          <Text style={[s.th, ci.cPer]}>الفترة</Text>
          <Text style={[s.th, ci.cClient]}>العميل</Text>
          <Text style={[s.th, ci.cInv]}>رقم الفاتورة</Text>
        </View>
        {expenseInvoices.map((inv, i) => (
          <View key={inv.id} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <PdfMoneyText amount={inv.totalAmount} style={s.tdBold} containerStyle={ci.amt} />
            <Text style={[s.td, ci.cPer]}>{`${pdfFmtDate(inv.startDate)} ← ${pdfFmtDate(inv.endDate)}`}</Text>
            <Text style={[s.td, ci.cClient]}>{clients.find((c) => c.id === inv.clientId)?.name || "—"}</Text>
            <Text style={[s.tdBold, ci.cInv]}>{inv.invoiceNumber}</Text>
          </View>
        ))}

        <PdfBrandedFooter />
      </Page>
    </Document>
  );
};
