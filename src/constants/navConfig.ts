import type { SvgIconComponent } from "@mui/icons-material";
import {
  HomeOutlined,
  People,
  Receipt,
  Payment,
  AccountBalance,
  ReceiptLong,
  Backup,
  TrendingDown,
  MoreHoriz,
} from "@mui/icons-material";

export type NavItem = {
  label: string;
  path: string;
  icon: SvgIconComponent;
  section?: "main" | "system" | "more";
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", path: "/", icon: HomeOutlined, section: "main" },
  { label: "العملاء", path: "/clients", icon: People, section: "main" },
  { label: "الفواتير", path: "/invoices", icon: Receipt, section: "main" },
  { label: "المدفوعات", path: "/payments", icon: Payment, section: "main" },
  { label: "الديون", path: "/debts", icon: AccountBalance, section: "main" },
];

export const MORE_NAV_ITEMS: NavItem[] = [
  { label: "المصروفات", path: "/expenses", icon: TrendingDown, section: "more" },
  { label: "فواتير المصروفات", path: "/expense-invoices", icon: ReceiptLong, section: "more" },
  { label: "النسخ الاحتياطي", path: "/backup", icon: Backup, section: "more" },
];

export const SYSTEM_NAV_ITEMS: NavItem[] = [
  { label: "النسخ الاحتياطي", path: "/backup", icon: Backup, section: "system" },
];

/** عناصر شريط التنقل السفلي — 4 رئيسية + «المزيد» */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  ...MAIN_NAV_ITEMS.slice(0, 4),
  { label: "المزيد", path: "__more__", icon: MoreHoriz, section: "main" },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...MAIN_NAV_ITEMS,
  ...MORE_NAV_ITEMS.filter((i) => i.path !== "/backup"),
  ...SYSTEM_NAV_ITEMS,
];

export function navIsActive(pathname: string, path: string): boolean {
  if (path === "__more__") return false;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function getPageTitle(pathname: string): string | null {
  const item = ALL_NAV_ITEMS.find((i) => navIsActive(pathname, i.path));
  return item?.label ?? null;
}

export function isMoreSectionActive(pathname: string): boolean {
  return MORE_NAV_ITEMS.some((i) => navIsActive(pathname, i.path));
}
