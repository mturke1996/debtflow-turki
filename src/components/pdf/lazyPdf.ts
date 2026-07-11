/** تحميل كسول لمكوّنات PDF — يقلّل حجم الحزمة الأولية */
export async function loadStyledPDFs() {
  return import("./StyledPDFs");
}
