
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import Layout from './components/Layout';
import RtDetailPage from './pages/ZeetDetailPage';
import VerificationPage from './pages/VerificationPage';
import AdminPage from './pages/AdminPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
import NewGroupPage from './pages/NewGroupPage';
import EditProfilePage from './pages/EditProfilePage';

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

const OwnerProtectedRoute: React.FC = () => {
    const { currentUser, isOwner } = useAuth();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    if (!isOwner) {
        return <Navigate to="/" replace />;
    }
    return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </DataProvider>
  );
};

const Router: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-purple-dark">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/rt/:rtId" element={<RtDetailPage />} />
                    <Route path="/verification" element={<VerificationPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/messages/new" element={<NewGroupPage />} />
                    <Route path="/messages/:conversationId" element={<ConversationPage />} />
                </Route>
                <Route element={<OwnerProtectedRoute />}>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/user/:userId" element={<AdminUserDetailPage />} />
                </Route>
                <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />} />
            </Routes>
        </HashRouter>
    );
};


export default App;