import { useState } from 'react';
import { AppBar, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Menu from '../Menu.tsx';
import SettingsDialog from '../dialogs/SettingsDialog.tsx';
import UserDialog from '../dialogs/UserDialog.tsx';
import { useAuth } from '../../auth';
import { useTranslation } from 'react-i18next';
import HeaderBranding from './HeaderBranding.tsx';
import DesktopSearchBar from '../search/DesktopSearchBar.tsx';
import MobileSearchBar from '../search/MobileSearchBar.tsx';
import HeaderActions from './HeaderActions.tsx';
import { useLocation } from 'react-router';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const auth = useAuth();
  const { t } = useTranslation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleMobileSearchUIClose = () => {
    setSearchActive(false);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            minHeight: { xs: '64px' },
          }}
        >
          {isMobile && searchActive ? (
            <MobileSearchBar
              onCloseRequest={handleMobileSearchUIClose}
              placeholder={t('search.searchPlaceholder')}
            />
          ) : (
            <>
              <HeaderBranding />
              {!isHomePage && !isMobile && (
                <DesktopSearchBar placeholder={t('search.searchPlaceholder')} />
              )}
              <HeaderActions
                isMobile={isMobile}
                isHomePage={isHomePage}
                onSearchIconClick={isHomePage ? () => {} : () => setSearchActive(true)}
                onUserIconClick={() => (auth.isAuthenticated ? setUserOpen(true) : auth.login())}
                onSettingsIconClick={() => setSettingsOpen(true)}
                onMenuIconClick={() => setDrawerOpen(o => !o)}
                isAuthenticated={auth.isAuthenticated}
              />
            </>
          )}
        </Toolbar>
      </AppBar>

      <Menu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <UserDialog
        open={userOpen}
        onLogout={() =>
          auth
            .logout({ returnTo: `${window.location.origin}${import.meta.env.BASE_URL}` })
            .then(() => {
              setUserOpen(false);
            })
        }
        onClose={() => setUserOpen(false)}
      />
    </>
  );
}
