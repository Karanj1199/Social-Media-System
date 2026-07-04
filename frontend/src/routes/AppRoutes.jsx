import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import PeoplePage from "../pages/PeoplePage";
import ChatPage from "../pages/ChatPage";
import NotificationsPage from "../pages/NotificationsPage";
import SearchPage from "../pages/SearchPage";
import TrendingPage from "../pages/TrendingPage";
import RecommendationsPage from "../pages/RecommendationsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layout/AppLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;