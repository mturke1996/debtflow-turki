import html2canvas from 'html2canvas';
import type { Client, Expense } from '../types';
import { formatCurrency } from './calculations';
import { normalizeCategoryLabel } from '@/constants/expenseCategories';
import dayjs from 'dayjs';

export interface ClientFinancialSummaryPayload {
  totalExpenses: number;
  profit: number;
  profitPercentage: number;
  totalDebts: number;
  totalPaid: number;
  totalObligations: number;
  netBalance: number;
  remaining: number;
  surplus: number;
  expenseCount: number;
  paymentCount: number;
}

/**
 * مشاركة ملخص كشف الحساب المالي عبر واتساب بنص عربي منسق بدقة وبدون أي روابط منظومة
 */
export const shareClientFinancialSummaryWhatsApp = (
  client: Client,
  summary: ClientFinancialSummaryPayload
) => {
  const dateStr = dayjs().format('DD/MM/YYYY');
  const lines: string[] = [
    `📊 *كشف حساب مالي*`,
    `👤 *العميل:* ${client.name}`,
    `📅 *التاريخ:* ${dateStr}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📉 *إجمالي المصروفات (${summary.expenseCount}):* ${formatCurrency(summary.totalExpenses)}`,
  ];

  if (summary.profitPercentage > 0 && summary.profit > 0) {
    lines.push(`📈 *نسبة الشركة (${summary.profitPercentage}%):* ${formatCurrency(summary.profit)}`);
  }

  if (summary.totalDebts > 0) {
    lines.push(`💳 *ديون معلقة:* ${formatCurrency(summary.totalDebts)}`);
  }

  lines.push(`💰 *إجمالي المستحق:* ${formatCurrency(summary.totalObligations)}`);
  lines.push(`💵 *إجمالي المدفوع (${summary.paymentCount}):* ${formatCurrency(summary.totalPaid)}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━`);

  if (summary.surplus > 0) {
    lines.push(`✅ *الرصيد: فائض لصالح العميل بقيمة ${formatCurrency(summary.surplus)}*`);
  } else if (summary.remaining > 0) {
    lines.push(`⚠️ *الرصيد: متبقي مطلوب سداده بقيمة ${formatCurrency(summary.remaining)}*`);
  } else {
    lines.push(`✅ *الرصيد: الحساب مسدد بالكامل*`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`شكراً لتعاملكم معنا 🙏`);

  const message = lines.join('\n');
  const phone = (client.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
};

export const generateWhatsAppStatement = async (
  client: Client,
  expenses: Expense[],
  totalExpenses: number,
  totalPaid: number,
  remainingDebt: number,
  profit: number = 0,
  profitPercentage: number = 0
) => {
  // إنشاء div مخفي للتصدير
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 420px;
    background: #ffffff;
    padding: 24px;
    font-family: 'Cairo', system-ui, sans-serif;
    direction: rtl;
  `;

  const totalDue = totalExpenses + profit;

  container.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 16px;
      text-align: center;
    ">
      <div style="font-size: 26px; font-weight: 900; margin-bottom: 6px; letter-spacing: -0.5px;">
        كشف حساب مالي
      </div>
      <div style="font-size: 13px; opacity: 0.92; font-weight: 600;">
        ${dayjs().format('DD MMMM YYYY')}
      </div>
    </div>

    <div style="
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 14px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
    ">
      <div style="font-size: 17px; font-weight: 800; margin-bottom: 8px; color: #0f172a;">
        👤 ${client.name}
      </div>
      ${client.phone ? `<div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">📱 ${client.phone}</div>` : ''}
      ${client.address ? `<div style="font-size: 13px; color: #64748b;">📍 ${client.address}</div>` : ''}
    </div>

    <div style="
      background: #f0fdf4;
      padding: 18px;
      border-radius: 14px;
      margin-bottom: 16px;
      border: 1px solid #bbf7d0;
      border-right: 5px solid #16a34a;
    ">
      <div style="font-size: 14px; font-weight: 800; color: #166534; margin-bottom: 12px;">
        📊 ملخص الحساب المالي
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 13px;">إجمالي المصروفات:</span>
        <span style="font-weight: 800; color: #0f172a; font-size: 14px;">
          ${formatCurrency(totalExpenses)}
        </span>
      </div>
      ${profit > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 13px;">نسبة الشركة (${profitPercentage}%):</span>
        <span style="font-weight: 800; color: #0369a1; font-size: 14px;">
          ${formatCurrency(profit)}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 13px;">إجمالي المستحق:</span>
        <span style="font-weight: 900; color: #0f172a; font-size: 14px;">
          ${formatCurrency(totalDue)}
        </span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 13px;">إجمالي المدفوع:</span>
        <span style="font-weight: 800; color: #16a34a; font-size: 14px;">
          ${formatCurrency(totalPaid)}
        </span>
      </div>
      <div style="
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 2px dashed #bbf7d0;
        margin-top: 10px;
      ">
        <span style="font-weight: 800; font-size: 15px; color: ${remainingDebt > 0 ? '#b91c1c' : '#15803d'};">
          ${remainingDebt > 0 ? 'المتبقي للسداد:' : remainingDebt < 0 ? 'فائض للعميل:' : 'الرصيد:'}
        </span>
        <span style="font-weight: 900; font-size: 17px; color: ${remainingDebt > 0 ? '#dc2626' : '#16a34a'};">
          ${remainingDebt === 0 ? 'مسدد بالكامل' : formatCurrency(Math.abs(remainingDebt))}
        </span>
      </div>
    </div>

    ${expenses.length > 0 ? `
    <div style="
      background: #fffbeb;
      padding: 16px;
      border-radius: 14px;
      border: 1px solid #fef3c7;
      border-right: 5px solid #d97706;
    ">
      <div style="font-size: 14px; font-weight: 800; color: #92400e; margin-bottom: 12px;">
        📝 آخر المصروفات (${expenses.length})
      </div>
      ${expenses.slice(0, 5).map(exp => `
        <div style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #fde68a;
        ">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
              ${exp.description}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${dayjs(exp.date).format('DD/MM/YYYY')} • ${normalizeCategoryLabel(exp.category)}
            </div>
          </div>
          <div style="font-weight: 800; color: #dc2626; font-size: 13.5px;">
            ${formatCurrency(exp.amount)}
          </div>
        </div>
      `).join('')}
      ${expenses.length > 5 ? `
        <div style="text-align: center; color: #92400e; font-size: 12px; margin-top: 8px; font-weight: 700;">
          + ${expenses.length - 5} مصروف آخر
        </div>
      ` : ''}
    </div>
    ` : ''}

    <div style="
      text-align: center;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 11.5px;
      font-weight: 600;
    ">
      شكراً لتعاملكم معنا
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2.5,
      logging: false,
      useCORS: true,
    });

    document.body.removeChild(container);

    // تحويل إلى صورة عالية الدقة
    const image = canvas.toDataURL('image/png');
    
    // فتح الصورة في نافذة جديدة
    const newWindow = window.open('');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <title>كشف حساب - ${client.name}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
              font-family: 'Cairo', system-ui, sans-serif;
            }
            img {
              max-width: 100%;
              border-radius: 16px;
              box-shadow: 0 12px 32px rgba(0,0,0,0.15);
            }
            .buttons {
              margin-top: 20px;
              display: flex;
              gap: 12px;
            }
            button {
              padding: 12px 28px;
              border: none;
              border-radius: 10px;
              font-family: 'Cairo', system-ui, sans-serif;
              font-weight: 800;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
            }
            .download {
              background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
              color: white;
            }
            .share {
              background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
              color: white;
            }
            button:active {
              transform: scale(0.96);
            }
          </style>
        </head>
        <body>
          <img src="${image}" alt="كشف حساب">
          <div class="buttons">
            <button class="download" onclick="downloadImage()">💾 تحميل كشف الحساب</button>
            <button class="share" onclick="shareImage()">📱 مشاركة كشف الحساب</button>
          </div>
          <script>
            function downloadImage() {
              const link = document.createElement('a');
              link.download = 'كشف-حساب-${client.name}-${dayjs().format('YYYY-MM-DD')}.png';
              link.href = '${image}';
              link.click();
            }
            
            async function shareImage() {
              try {
                const response = await fetch('${image}');
                const blob = await response.blob();
                const file = new File([blob], 'كشف-حساب-${client.name}-${dayjs().format('YYYY-MM-DD')}.png', { type: 'image/png' });
                
                if (navigator.share && navigator.canShare({ files: [file] })) {
                  await navigator.share({
                    files: [file],
                    title: 'كشف حساب - ${client.name}'
                  });
                } else {
                  downloadImage();
                }
              } catch (error) {
                console.error('Error sharing:', error);
                downloadImage();
              }
            }
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    }

    return image;
  } catch (error) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    console.error('Error generating statement:', error);
    throw error;
  }
};


