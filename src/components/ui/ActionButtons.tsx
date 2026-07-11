import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Add,
  Visibility,
  Edit,
  DeleteOutline,
  Share,
} from "@mui/icons-material";
import { cn } from "./cn";

const tapSpring = { type: "spring" as const, stiffness: 520, damping: 28 };

type MotionBtnProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
};

function MotionBtn({ children, className, disabled, onClick, ...a11y }: MotionBtnProps) {
  return (
    <motion.button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={tapSpring}
      {...a11y}
    >
      {children}
    </motion.button>
  );
}

type HeroCtaButtonProps = {
  children: ReactNode;
  onClick: () => void;
  icon?: "add" | "share";
  compact?: boolean;
};

export function HeroCtaButton({ children, onClick, icon = "add", compact }: HeroCtaButtonProps) {
  const Icon = icon === "share" ? Share : Add;
  return (
    <MotionBtn
      className={cn("hero-cta-btn", compact && "hero-cta-btn--compact")}
      onClick={onClick}
    >
      <span className="hero-cta-icon">
        <Icon sx={{ fontSize: compact ? 15 : 16 }} />
      </span>
      <span className="hero-cta-label">{children}</span>
    </MotionBtn>
  );
}

type FilterChipProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <MotionBtn
      className={cn("filter-chip", active && "filter-chip--active")}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </MotionBtn>
  );
}

export type RowActionVariant = "view" | "edit" | "delete";

const ACTION_META: Record<
  RowActionVariant,
  { label: string; Icon: typeof Visibility; className: string }
> = {
  view: { label: "عرض", Icon: Visibility, className: "action-btn--view" },
  edit: { label: "تعديل", Icon: Edit, className: "action-btn--edit" },
  delete: { label: "حذف", Icon: DeleteOutline, className: "action-btn--delete" },
};

type RowActionButtonProps = {
  variant: RowActionVariant;
  onClick: () => void;
  disabled?: boolean;
};

export function RowActionButton({ variant, onClick, disabled }: RowActionButtonProps) {
  const { label, Icon, className } = ACTION_META[variant];
  return (
    <MotionBtn
      className={cn("action-btn", className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="action-btn__icon" aria-hidden>
        <Icon sx={{ fontSize: 15 }} />
      </span>
      <span className="action-btn__label">{label}</span>
    </MotionBtn>
  );
}

type RowActionBarProps = {
  children: ReactNode;
};

export function RowActionBar({ children }: RowActionBarProps) {
  return <div className="row-action-bar">{children}</div>;
}
