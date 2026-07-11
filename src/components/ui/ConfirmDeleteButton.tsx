import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import toast from "react-hot-toast";

type ConfirmDeleteButtonProps = Omit<IconButtonProps, "onClick"> & {
  label?: string;
  confirmMessage: string;
  onConfirm: () => Promise<void> | void;
  successMessage?: string;
};

export const ConfirmDeleteButton = ({
  label = "حذف",
  confirmMessage,
  onConfirm,
  successMessage = "تم الحذف",
  size = "small",
  color = "error",
  ...rest
}: ConfirmDeleteButtonProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!window.confirm(confirmMessage)) return;

    const toastId = toast.loading("جاري الحذف...");
    try {
      await onConfirm();
      toast.success(successMessage, { id: toastId });
    } catch {
      toast.error("تعذّر الحذف. حاول مرة أخرى.", { id: toastId });
    }
  };

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        size={size}
        color={color}
        onClick={handleClick}
        {...rest}
      >
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
