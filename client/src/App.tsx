import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/common/NavBar';
import { Timeline } from './components/feed/Timeline';
import { ProfilePage } from './components/profile/ProfilePage';

const CURRENT_HANDLE = (import.meta.env.VITE_DEV_USER_HANDLE as string | undefined) ?? 'ada';

export const App = (): JSX.Element => (
  <BrowserRouter>
    <NavBar currentHandle={CURRENT_HANDLE} />
    <Routes>
      <Route path="/" element={<Timeline />} />
      <Route path="/u/:handle" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
