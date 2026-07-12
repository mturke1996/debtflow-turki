import { useState, useMemo, useCallback } from 'react';

import {

  AppBar,

  Box,

  Drawer,

  IconButton,

  List,

  ListItem,

  ListItemButton,

  ListItemIcon,

  ListItemText,

  Toolbar,

  Typography,

  useMediaQuery,

  useTheme,

  Avatar,

  Menu,

  MenuItem,

  Divider,

  Tooltip,

} from '@mui/material';

import {

  Menu as MenuIcon,

  HomeOutlined,

  People,

  Receipt,

  Payment,

  AccountBalance,

  ReceiptLong,

  Brightness4,

  Brightness7,

  Logout,

  AccountCircle,

  Backup,

} from '@mui/icons-material';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import { useThemeStore } from '@/store/useThemeStore';

import { useAuthStore } from '@/store/useAuthStore';

import { CompanyLogo } from '@/components/ui/CompanyLogo';

import { BottomNav } from '@/components/ui/BottomNav';

import { ExpenseFab } from '@/components/expense/ExpenseFab';

import { QuickExpenseSheet } from '@/components/expense/QuickExpenseSheet';

import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS, SYSTEM_NAV_ITEMS, getPageTitle, navIsActive } from '@/constants/navConfig';

import { APP_BAR_TOTAL, BOTTOM_NAV_TOTAL } from '@/constants/layout';
import { COMPANY_INFO } from '@/constants/companyInfo';



const drawerWidth = 248;



export const Layout = () => {

  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));



  const [mobileOpen, setMobileOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);



  const themeMode = useThemeStore((state) => state.mode);

  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const { user, logout } = useAuthStore();



  const isNavActive = useCallback(

    (path: string) => navIsActive(location.pathname, path),

    [location.pathname]

  );



  const menuItems = useMemo(

    () => MAIN_NAV_ITEMS.map((item) => ({

      text: item.label,

      icon: <item.icon fontSize="small" />,

      path: item.path,

    })),

    []

  );



  const systemItems = useMemo(

    () => SYSTEM_NAV_ITEMS.map((item) => ({

      text: item.label,

      icon: <item.icon fontSize="small" />,

      path: item.path,

    })),

    []

  );



  const moreSidebarItems = useMemo(

    () => MORE_NAV_ITEMS.filter((i) => i.path !== '/backup').map((item) => ({

      text: item.label,

      icon: <item.icon fontSize="small" />,

      path: item.path,

    })),

    []

  );



  const allNavItems = useMemo(() => [...menuItems, ...moreSidebarItems, ...systemItems], [menuItems, moreSidebarItems, systemItems]);



  const currentPage =

    getPageTitle(location.pathname) ?? COMPANY_INFO.companyName;



  const drawer = (

    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <Toolbar sx={{ py: 2.5, px: 2, minHeight: 72, pt: 'calc(12px + env(safe-area-inset-top, 0px))' }}>

        <CompanyLogo variant="sidebar" />

      </Toolbar>

      <Divider />

      <List sx={{ px: 1.25, py: 2, flex: 1 }} component="nav" aria-label="التنقل الرئيسي">

        {menuItems.map((item) => {

          const active = isNavActive(item.path);

          return (

            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>

              <ListItemButton

                selected={active}

                onClick={() => {

                  navigate(item.path);

                  if (isMobile) setMobileOpen(false);

                }}

                sx={{

                  borderRadius: 1,

                  py: 1.1,

                  px: 1.5,

                  borderInlineStart: '3px solid',

                  borderColor: active ? 'primary.main' : 'transparent',

                  bgcolor: active

                    ? theme.palette.mode === 'dark'

                      ? 'rgba(45, 212, 191, 0.08)'

                      : 'rgba(15, 118, 110, 0.06)'

                    : 'transparent',

                  '&.Mui-selected': {

                    bgcolor:

                      theme.palette.mode === 'dark'

                        ? 'rgba(45, 212, 191, 0.08)'

                        : 'rgba(15, 118, 110, 0.06)',

                    color: 'text.primary',

                    '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.08)' },

                  },

                  '&:hover:not(.Mui-selected)': {

                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.03)',

                  },

                }}

              >

                <ListItemIcon

                  sx={{

                    color: active ? 'primary.main' : 'text.secondary',

                    minWidth: 36,

                  }}

                >

                  {item.icon}

                </ListItemIcon>

                <ListItemText

                  primary={item.text}

                  primaryTypographyProps={{

                    fontWeight: active ? 700 : 500,

                    fontSize: '0.875rem',

                  }}

                />

              </ListItemButton>

            </ListItem>

          );

        })}

        <Divider sx={{ mx: 1.5, my: 1.5 }} />

        <Typography

          variant="caption"

          color="text.secondary"

          fontWeight={700}

          sx={{ px: 2, mb: 0.5, display: 'block', letterSpacing: '0.04em' }}

        >

          المزيد

        </Typography>

        {moreSidebarItems.map((item) => {

          const active = isNavActive(item.path);

          return (

            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>

              <ListItemButton

                selected={active}

                onClick={() => {

                  navigate(item.path);

                  if (isMobile) setMobileOpen(false);

                }}

                sx={{

                  borderRadius: 1,

                  py: 1.1,

                  px: 1.5,

                  borderInlineStart: '3px solid',

                  borderColor: active ? 'primary.main' : 'transparent',

                  bgcolor: active

                    ? theme.palette.mode === 'dark'

                      ? 'rgba(45, 212, 191, 0.08)'

                      : 'rgba(15, 118, 110, 0.06)'

                    : 'transparent',

                  '&.Mui-selected': {

                    bgcolor:

                      theme.palette.mode === 'dark'

                        ? 'rgba(45, 212, 191, 0.08)'

                        : 'rgba(15, 118, 110, 0.06)',

                    color: 'text.primary',

                    '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.08)' },

                  },

                  '&:hover:not(.Mui-selected)': {

                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.03)',

                  },

                }}

              >

                <ListItemIcon

                  sx={{

                    color: active ? 'primary.main' : 'text.secondary',

                    minWidth: 36,

                  }}

                >

                  {item.icon}

                </ListItemIcon>

                <ListItemText

                  primary={item.text}

                  primaryTypographyProps={{

                    fontWeight: active ? 700 : 500,

                    fontSize: '0.875rem',

                  }}

                />

              </ListItemButton>

            </ListItem>

          );

        })}

        <Divider sx={{ mx: 1.5, my: 1.5 }} />

        <Typography

          variant="caption"

          color="text.secondary"

          fontWeight={700}

          sx={{ px: 2, mb: 0.5, display: 'block', letterSpacing: '0.04em' }}

        >

          النظام

        </Typography>

        {systemItems.map((item) => {

          const active = isNavActive(item.path);

          return (

            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>

              <ListItemButton

                selected={active}

                onClick={() => {

                  navigate(item.path);

                  if (isMobile) setMobileOpen(false);

                }}

                sx={{

                  borderRadius: 1,

                  py: 1.1,

                  px: 1.5,

                  borderInlineStart: '3px solid',

                  borderColor: active ? 'primary.main' : 'transparent',

                  bgcolor: active

                    ? theme.palette.mode === 'dark'

                      ? 'rgba(45, 212, 191, 0.08)'

                      : 'rgba(15, 118, 110, 0.06)'

                    : 'transparent',

                  '&.Mui-selected': {

                    bgcolor:

                      theme.palette.mode === 'dark'

                        ? 'rgba(45, 212, 191, 0.08)'

                        : 'rgba(15, 118, 110, 0.06)',

                    color: 'text.primary',

                    '&:hover': { bgcolor: 'rgba(15, 118, 110, 0.08)' },

                  },

                  '&:hover:not(.Mui-selected)': {

                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.03)',

                  },

                }}

              >

                <ListItemIcon

                  sx={{

                    color: active ? 'primary.main' : 'text.secondary',

                    minWidth: 36,

                  }}

                >

                  {item.icon}

                </ListItemIcon>

                <ListItemText

                  primary={item.text}

                  primaryTypographyProps={{

                    fontWeight: active ? 700 : 500,

                    fontSize: '0.875rem',

                  }}

                />

              </ListItemButton>

            </ListItem>

          );

        })}

      </List>

      <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'divider' }}>

        <Typography variant="caption" color="text.secondary" display="block">

          {COMPANY_INFO.engineerName}

        </Typography>

        <Typography variant="caption" color="text.secondary" className="num-ltr" dir="ltr">

          {COMPANY_INFO.phones[0]}

        </Typography>

      </Box>

    </Box>

  );



  return (

    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>

      <AppBar

        position="fixed"

        elevation={0}

        sx={{

          width: { md: `calc(100% - ${drawerWidth}px)` },

          ml: { md: `${drawerWidth}px` },

        }}

      >

        <Toolbar sx={{ minHeight: 56, px: { xs: 1.5, sm: 2 }, gap: 1 }}>

          <IconButton

            color="inherit"

            edge="start"

            onClick={() => setMobileOpen(true)}

            aria-label="فتح القائمة"

            sx={{ marginLeft: '4px', display: { md: 'none' } }}

          >

            <MenuIcon />

          </IconButton>



          <Typography variant="body1" noWrap sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.9375rem' }}>

            {currentPage}

          </Typography>



          <Tooltip title={themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>

            <IconButton color="inherit" onClick={toggleTheme} aria-label="تبديل السمة">

              {themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}

            </IconButton>

          </Tooltip>



          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="حساب المستخدم">

            <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.selected', fontSize: '0.8rem', fontWeight: 700 }}>

              {user?.displayName?.charAt(0) || user?.email.charAt(0).toUpperCase()}

            </Avatar>

          </IconButton>



          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>

            <MenuItem disabled sx={{ gap: 1.5, opacity: 1 }}>

              <AccountCircle fontSize="small" />

              <Typography variant="body2">{user?.displayName || user?.email}</Typography>

            </MenuItem>

            <Divider />

            <MenuItem onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }} sx={{ gap: 1.5 }}>

              <Logout fontSize="small" />

              تسجيل الخروج

            </MenuItem>

          </Menu>

        </Toolbar>

      </AppBar>



      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>

        <Drawer

          variant="temporary"

          open={mobileOpen}

          onClose={() => setMobileOpen(false)}

          ModalProps={{ keepMounted: true }}

          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}

        >

          {drawer}

        </Drawer>

        <Drawer

          variant="permanent"

          sx={{

            display: { xs: 'none', md: 'block' },

            '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 0, borderLeft: 1, borderColor: 'divider' },

          }}

          open

        >

          {drawer}

        </Drawer>

      </Box>



      <Box

        component="main"

        id="main-content"

        sx={{

          flexGrow: 1,

          px: { xs: 2, sm: 3 },

          py: { xs: 2.5, sm: 3 },

          width: { md: `calc(100% - ${drawerWidth}px)` },

          mt: APP_BAR_TOTAL,

          minHeight: `calc(100dvh - ${APP_BAR_TOTAL})`,

          pb: { xs: `calc(${BOTTOM_NAV_TOTAL} + 8px)`, md: 3 },

          maxWidth: { lg: 960, xl: 1080 },

        }}

      >

        <Outlet />

      </Box>



      <ExpenseFab onClick={() => setQuickExpenseOpen(true)} />

      <QuickExpenseSheet

        open={quickExpenseOpen}

        onClose={() => setQuickExpenseOpen(false)}

      />

      <BottomNav />

    </Box>

  );

};


