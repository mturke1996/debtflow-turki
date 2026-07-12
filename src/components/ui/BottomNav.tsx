import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import {
  BOTTOM_NAV_ITEMS,
  MORE_NAV_ITEMS,
  isMoreSectionActive,
  navIsActive,
} from "@/constants/navConfig";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeIndex = useMemo(() => {
    if (isMoreSectionActive(location.pathname)) return 4;
    const idx = BOTTOM_NAV_ITEMS.findIndex((item) => {
      if (item.path === "__more__") return false;
      return navIsActive(location.pathname, item.path);
    });
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  const handleChange = (_: unknown, idx: number) => {
    const item = BOTTOM_NAV_ITEMS[idx];
    if (item.path === "__more__") {
      setMoreOpen(true);
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      <Paper
        component="nav"
        aria-label="التنقل السفلي"
        elevation={0}
        className="bottom-nav-shell"
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          pb: "env(safe-area-inset-bottom, 0px)",
          pl: "env(safe-area-inset-left, 0px)",
          pr: "env(safe-area-inset-right, 0px)",
        }}
      >
        <BottomNavigation
          value={activeIndex}
          onChange={handleChange}
          showLabels
          sx={{
            height: 64,
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              py: 1,
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main" },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.65rem",
              fontWeight: 600,
              "&.Mui-selected": { fontSize: "0.65rem" },
            },
          }}
        >
          {BOTTOM_NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={<item.icon sx={{ fontSize: 22 }} />}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            pb: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            maxHeight: "calc(85dvh - env(safe-area-inset-top, 0px))",
          },
        }}
      >
        <Box className="sheet-grabber" aria-hidden />
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            المزيد
          </Typography>
          <Typography variant="caption" color="text.secondary">
            مصروفات، فواتير، ونسخ احتياطي
          </Typography>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {MORE_NAV_ITEMS.map((item) => {
            const active = navIsActive(location.pathname, item.path);
            return (
              <ListItemButton
                key={item.path}
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setMoreOpen(false);
                }}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? "primary.main" : "text.secondary" }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 800 : 600, fontSize: "0.9rem" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
};
