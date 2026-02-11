import { useState } from 'react';
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
  Dashboard,
  People,
  Receipt,
  Payment,
  AccountBalance,
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BackupDialog } from './BackupDialog';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user, logout } = useAuthStore();

  const menuItems = [
    { text: 'لوحة التحكم', icon: <Dashboard />, path: '/' },
    { text: 'العملاء', icon: <People />, path: '/clients' },
    { text: 'الفواتير', icon: <Receipt />, path: '/invoices' },
    { text: 'المدفوعات', icon: <Payment />, path: '/payments' },
    { text: 'الديون', icon: <AccountBalance />, path: '/debts' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="logo"
            sx={{ width: 36, height: 36 }}
          />
          <Box>
            <Typography variant="body2" noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'text.primary', letterSpacing: 0.2 }}>
              م. محمد سالم التركي
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#c9a54e', fontWeight: 600, fontSize: '0.72rem' }}>
              إنشاءات وتعهدات
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.08)' : 'rgba(26, 58, 92, 0.06)' }} />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2.5,
                mx: 1,
                py: 1.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a3a5c' : '#1a3a5c',
                  color: 'white',
                  boxShadow: '0 4px 14px -3px rgba(26, 58, 92, 0.35)',
                  '&:hover': {
                    backgroundColor: '#0e2440',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover:not(.Mui-selected)': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.06)' : 'rgba(26, 58, 92, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? 'white' 
                    : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  textAlign: 'right',
                  '& .MuiTypography-root': { fontWeight: location.pathname === item.path ? 700 : 500 },
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ marginLeft: '16px', display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            نظام إدارة الإنشاءات والفواتير
          </Typography>

          <Tooltip title="النسخ الاحتياطي">
            <IconButton 
              color="inherit" 
              onClick={() => setBackupDialogOpen(true)} 
              sx={{ marginLeft: '8px' }}
            >
              <Icon icon="mdi:database-export" width={24} height={24} />
            </IconButton>
          </Tooltip>

          <Tooltip title={themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ marginLeft: '8px' }}>
              {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <IconButton color="inherit" onClick={handleMenuClick} sx={{ marginLeft: '8px' }}>
            <Avatar sx={{ 
              width: 34, 
              height: 34, 
              bgcolor: 'rgba(201, 165, 78, 0.15)', 
              color: '#c9a54e',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1.5px solid rgba(201, 165, 78, 0.25)',
            }}>
              {user?.displayName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled sx={{ display: 'flex', gap: 2 }}>
              <AccountCircle />
              <Typography variant="body2">{user?.displayName || user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ display: 'flex', gap: 2 }}>
              <Logout />
              تسجيل الخروج
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>

      {/* Backup Dialog */}
      <BackupDialog 
        open={backupDialogOpen} 
        onClose={() => setBackupDialogOpen(false)} 
      />
    </Box>
  );
};

