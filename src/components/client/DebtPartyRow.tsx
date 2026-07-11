import { Business, ChevronLeft, Person, Store } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { formatCurrency } from "@/utils/calculations";
import type { DebtParty } from "@/types";

export type PartyWithStats = DebtParty & {
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  debtCount: number;
};

type DebtPartyRowProps = {
  party: PartyWithStats;
  onClick: () => void;
};

const partyTypeLabel = (type: DebtParty["type"]) => {
  if (type === "company") return "شركة";
  if (type === "shop") return "محل";
  return "شخص";
};

function PartyTypeIcon({ type }: { type: DebtParty["type"] }) {
  const sx = { fontSize: 20, color: "primary.main" };
  if (type === "company") return <Business sx={sx} />;
  if (type === "shop") return <Store sx={sx} />;
  return <Person sx={sx} />;
}

export const DebtPartyRow = ({ party, onClick }: DebtPartyRowProps) => (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="surface-panel pressable"
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: 1.5,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PartyTypeIcon type={party.type} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {party.name}
          </Typography>
          <Chip label={partyTypeLabel(party.type)} size="small" sx={{ height: 20, fontSize: "0.625rem" }} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {party.debtCount} دين · مدفوع {formatCurrency(party.totalPaid)}
        </Typography>
        <Typography variant="subtitle2" fontWeight={800} className="num" color="warning.main" sx={{ mt: 0.5 }}>
          متبقي {formatCurrency(party.totalRemaining)}
        </Typography>
      </Box>
      <ChevronLeft sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />
    </Box>
  );
