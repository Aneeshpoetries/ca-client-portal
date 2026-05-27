import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParticleCursor from './components/ParticleCursor';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Setup from './pages/Setup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Announcements from './pages/Announcements';
import ClientPortal from './pages/ClientPortal';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Documents from './pages/Documents';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? '#141c18' : '#fff',
          color: isDark ? '#ece9e4' : '#111827',
          border: isDark ? '1px solid rgba(32,184,154,0.18)' : '1px solid #f3f4f6',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.40)' : '0 4px 12px rgba(0,0,0,0.08)',
          borderRadius: '10px',
          padding: '10px 14px',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <BrowserRouter>
      <AuthProvider>
        <ParticleCursor />
        <ThemedToaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/portal" element={
            <ProtectedRoute><ClientPortal /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute noClient><Dashboard /></ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute noClient><Clients /></ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute noClient><ClientDetail /></ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute noClient><Documents /></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute caOnly><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute><Announcements /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
