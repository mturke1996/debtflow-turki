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
  PdfMoneyText,
} from "./pdfBrandKit";

const payLabel = (m: string) => paymentMethods[m as keyof typeof paymentMethods] ?? m;

const dangerColor = "#d64545";
const successColor = "#0d9668";
const accentColor = "#8b7e6a";
const primaryColor = "#4a5d4a";

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
   التقرير النهائي VIP — يحتوي:
   - بيانات العميل الكاملة + KPIs
   - جدول المصروفات بكل التفاصيل والملاحظات
   - جدول المدفوعات الكامل
   - جدول الديون والالتزامات
   - الإجماليات النهائية والرصيد
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
  const totalDebts = debts.reduce((x, y) => x + y.amount, 0);
  const paidDebts = debts.reduce((x, y) => x + y.paidAmount, 0);
  const remainingDebts = debts.reduce((x, y) => x + y.remainingAmount, 0);
  const obligations = totalExpenses + profit + remainingDebts;
  const balance = obligations - totalPaid;
  const remaining = Math.max(balance, 0);
  const surplus = Math.max(-balance, 0);

  const today = pdfFmtDate(new Date().toISOString());
  const expenseDates = expenses.map((e) => +new Date(e.date)).filter(Boolean);
  const minDate = expenseDates.length ? new Date(Math.min(...expenseDates)).toISOString() : null;
  const maxDate = expenseDates.length ? new Date(Math.max(...expenseDates)).toISOString() : null;

  /* أعمدة العمود الكامل المستخدم في التقرير النهائي */
  const Cf = {
    n: { width: 24, textAlign: "center" as const },
    amt: { width: 78, textAlign: "left" as const, paddingLeft: 4 },
    dt: { width: 70, textAlign: "center" as const },
    cat: { width: 78, textAlign: "right" as const, paddingRight: 4 },
    desc: { flex: 1, textAlign: "right" as const, paddingRight: 4 },
    note: { width: "20%", textAlign: "right" as const, paddingRight: 4 },
    meth: { width: 80, textAlign: "right" as const },
    pnote: { flex: 1, textAlign: "right" as const, paddingRight: 4 },
    party: { width: 110, textAlign: "right" as const, paddingRight: 4 },
    status: { width: 60, textAlign: "center" as const },
  };

  const debtStatusAr = (st: StandaloneDebt["status"]) =>
    st === "paid" ? "مسدد" : "نشط";

  return (
    <Document title={`التقرير-النهائي-${client.name}`} language="ar">
      <Page size="A4" style={s.page} wrap>
        <PdfBrandedReportHeader
          titleEn="FINAL REPORT"
          subtitleAr="التقرير المالي الشامل"
          refLine={`Client: ${client.name}  •  ${today}`}
        />

        {/* بيانات العميل + الفترة */}
        <View style={s.infoRow}>
          <View style={s.datesCol}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ الإصدار</Text>
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
              <Text style={s.dateLabel}>النسبة المتفق عليها</Text>
              <Text style={s.dateVal}>{profitPercentage}%</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>عدد المصروفات</Text>
              <Text style={s.dateVal}>{expenses.length}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>عدد الدفعات</Text>
              <Text style={s.dateVal}>{payments.length}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>عدد الديون</Text>
              <Text style={s.dateVal}>{debts.length}</Text>
            </View>
          </View>

          <View style={s.clientBox}>
            <Text style={s.clientSectionLbl}>جهة التقرير</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
            {client.phone ? <Text style={s.clientSub}>هاتف: {client.phone}</Text> : null}
            {client.email ? <Text style={s.clientSub}>{client.email}</Text> : null}
            <Text style={s.clientSub}>
              النوع: {client.type === "company" ? "شركة" : "فرد"}
            </Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={[s.summaryRow, { flexWrap: "wrap" }]}>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>المصروفات المعتمدة</Text>
            <PdfMoneyText
              amount={totalExpenses}
              style={[s.summaryValue, { color: dangerColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>النسبة المتفق عليها ({profitPercentage}%)</Text>
            <PdfMoneyText
              amount={profit}
              style={[s.summaryValue, { color: accentColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>إجمالي المقبوض</Text>
            <PdfMoneyText
              amount={totalPaid}
              style={[s.summaryValue, { color: successColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>إجمالي الديون</Text>
            <PdfMoneyText
              amount={totalDebts}
              style={[s.summaryValue, { color: primaryColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>متبقي الديون</Text>
            <PdfMoneyText
              amount={remainingDebts}
              style={[s.summaryValue, { color: dangerColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
          <View style={[s.summaryCard, { minWidth: "31%" }]}>
            <Text style={s.summaryLabel}>إجمالي الالتزامات</Text>
            <PdfMoneyText
              amount={obligations}
              style={[s.summaryValue, { color: primaryColor }]}
              containerStyle={{ justifyContent: "center" }}
            />
          </View>
        </View>

        {/* جدول المصروفات الكامل */}
        <Text style={s.sectionTitle}>سجل المصروفات الكامل ({expenses.length})</Text>
        {expenses.length > 0 ? (
          <>
            <View style={s.tableHead}>
              <Text style={[s.th, Cf.amt]}>المبلغ</Text>
              <Text style={[s.th, Cf.dt]}>التاريخ</Text>
              <Text style={[s.th, Cf.cat]}>التصنيف</Text>
              <Text style={[s.th, Cf.note]}>ملاحظات</Text>
              <Text style={[s.th, Cf.desc]}>البيان</Text>
              <Text style={[s.th, Cf.n]}>#</Text>
            </View>
            {sortedExpenses.map((e, i) => (
              <View
                key={e.id}
                style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                wrap={false}
              >
                <PdfMoneyText
                  amount={e.amount}
                  style={[s.tdBold, { color: dangerColor }]}
                  containerStyle={Cf.amt}
                />
                <Text style={[s.td, Cf.dt]}>{pdfFmtDate(e.date)}</Text>
                <Text style={[s.td, Cf.cat]}>{normalizeCategoryLabel(e.category) || "—"}</Text>
                <Text style={[s.td, Cf.note]}>{e.notes || "—"}</Text>
                <Text style={[s.tdBold, Cf.desc]}>{e.description || "—"}</Text>
                <Text style={[s.td, Cf.n]}>{i + 1}</Text>
              </View>
            ))}
            <View style={s.totalRow} wrap={false}>
              <PdfMoneyText amount={totalExpenses} style={s.tdBold} containerStyle={Cf.amt} />
              <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>
                إجمالي المصروفات
              </Text>
            </View>
          </>
        ) : (
          <Text style={[s.td, { padding: 10 }]}>لا توجد مصروفات مسجَّلة.</Text>
        )}

        {/* جدول الدفعات الكامل */}
        <Text style={s.sectionTitle}>سجل الدفعات الكامل ({payments.length})</Text>
        {payments.length > 0 ? (
          <>
            <View style={s.tableHead}>
              <Text style={[s.th, Cf.amt]}>المبلغ</Text>
              <Text style={[s.th, Cf.dt]}>التاريخ</Text>
              <Text style={[s.th, Cf.meth]}>الوسيلة</Text>
              <Text style={[s.th, Cf.pnote]}>ملاحظات</Text>
              <Text style={[s.th, Cf.n]}>#</Text>
            </View>
            {sortedPayments.map((p, i) => (
              <View
                key={p.id}
                style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                wrap={false}
              >
                <PdfMoneyText amount={p.amount} style={s.tdPos} containerStyle={Cf.amt} />
                <Text style={[s.td, Cf.dt]}>{pdfFmtDate(p.paymentDate)}</Text>
                <Text style={[s.td, Cf.meth]}>{payLabel(p.paymentMethod)}</Text>
                <Text style={[s.td, Cf.pnote]}>{p.notes || "—"}</Text>
                <Text style={[s.td, Cf.n]}>{i + 1}</Text>
              </View>
            ))}
            <View style={s.totalRow} wrap={false}>
              <PdfMoneyText amount={totalPaid} style={s.tdBold} containerStyle={Cf.amt} />
              <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>
                إجمالي المقبوض
              </Text>
            </View>
          </>
        ) : (
          <Text style={[s.td, { padding: 10 }]}>لا توجد دفعات مسجَّلة.</Text>
        )}

        {/* جدول الديون */}
        {debts.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>سجل الديون والالتزامات ({debts.length})</Text>
            <View style={s.tableHead}>
              <Text style={[s.th, Cf.amt]}>متبقي</Text>
              <Text style={[s.th, Cf.amt]}>مدفوع</Text>
              <Text style={[s.th, Cf.amt]}>الإجمالي</Text>
              <Text style={[s.th, Cf.dt]}>التاريخ</Text>
              <Text style={[s.th, Cf.status]}>الحالة</Text>
              <Text style={[s.th, Cf.desc]}>الوصف / الملاحظات</Text>
              <Text style={[s.th, Cf.party]}>الطرف</Text>
            </View>
            {sortedDebts.map((d, i) => (
              <View
                key={d.id}
                style={[s.tableRow, i % 2 !== 0 && s.rowEven]}
                wrap={false}
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
                  {d.notes ? ` — ${d.notes}` : ""}
                </Text>
                <Text style={[s.tdBold, Cf.party]}>{d.partyName || "—"}</Text>
              </View>
            ))}
            <View style={s.totalRow} wrap={false}>
              <PdfMoneyText
                amount={remainingDebts}
                style={[s.tdBold, { color: dangerColor }]}
                containerStyle={Cf.amt}
              />
              <PdfMoneyText amount={paidDebts} style={s.tdBold} containerStyle={Cf.amt} />
              <PdfMoneyText amount={totalDebts} style={s.tdBold} containerStyle={Cf.amt} />
              <Text style={[s.tdBold, { flex: 1, textAlign: "right" }]}>
                إجمالي الديون
              </Text>
            </View>
          </>
        ) : null}

        {/* الإجمالي النهائي */}
        <View
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: primaryColor,
            backgroundColor: "#f6f3ed",
          }}
          wrap={false}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: primaryColor,
              textAlign: "right",
              marginBottom: 6,
            }}
          >
            الخلاصة المالية
          </Text>

          <View style={s.totalLine}>
            <Text style={s.grandLbl}>إجمالي المصروفات</Text>
            <PdfMoneyText amount={totalExpenses} style={s.grandAmt} />
          </View>
          <View style={s.totalLine}>
            <Text style={s.grandLbl}>النسبة المتفق عليها ({profitPercentage}%)</Text>
            <PdfMoneyText amount={profit} style={s.grandAmt} />
          </View>
          <View style={s.totalLine}>
            <Text style={s.grandLbl}>متبقي الديون</Text>
            <PdfMoneyText amount={remainingDebts} style={s.grandAmt} />
          </View>
          <View style={s.totalLine}>
            <Text style={s.grandLbl}>إجمالي المستحق على العميل</Text>
            <PdfMoneyText amount={obligations} style={[s.grandAmt, { color: primaryColor }]} />
          </View>
          <View style={s.totalLine}>
            <Text style={s.grandLbl}>إجمالي المقبوض</Text>
            <PdfMoneyText amount={totalPaid} style={[s.grandAmt, { color: successColor }]} />
          </View>

          <View style={s.grandBar}>
            <Text style={[s.grandLbl, { fontSize: 12 }]}>
              {surplus > 0 ? "فائض دفع للعميل" : "الرصيد المتبقي للسداد"}
            </Text>
            <PdfMoneyText
              amount={surplus > 0 ? surplus : remaining}
              style={[
                s.grandAmt,
                {
                  fontSize: 15,
                  color: surplus > 0 ? successColor : remaining > 0 ? dangerColor : primaryColor,
                },
              ]}
            />
          </View>
        </View>

        <PdfBrandedFooter />
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
