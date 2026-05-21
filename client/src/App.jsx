import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import RequireRole from "./components/auth/RequireRole.jsx";
import BuyerLayout from "./components/layout/BuyerLayout.jsx";
import BuyerDashboard from "./pages/buyer/BuyerDashboard.jsx";
import BuyerHome from "./pages/buyer/BuyerHome.jsx";
import BuyerCart from "./pages/buyer/BuyerCart.jsx";
import BuyerOrders from "./pages/buyer/BuyerOrders.jsx";
import BuyerQuotes from "./pages/buyer/BuyerQuotes.jsx";
import BuyerProductDetail from "./pages/buyer/BuyerProductDetail.jsx";
import BuyerReturns from "./pages/buyer/BuyerReturns.jsx";
import BuyerProfile from "./pages/buyer/BuyerProfile.jsx";
import SupplierLayout from "./components/layout/SupplierLayout.jsx";
import SupplierOverview from "./pages/supplier/SupplierOverview.jsx";
import SupplierAnalytics from "./pages/supplier/SupplierAnalytics.jsx";
import SupplierCatalog from "./pages/supplier/SupplierCatalog.jsx";
import SupplierOrders from "./pages/supplier/SupplierOrders.jsx";
import SupplierQuotes from "./pages/supplier/SupplierQuotes.jsx";
import SupplierPayouts from "./pages/supplier/SupplierPayouts.jsx";
import SupplierReturns from "./pages/supplier/SupplierReturns.jsx";
import SupplierProfile from "./pages/supplier/SupplierProfile.jsx";
import StockAlerts from "./pages/supplier/StockAlerts.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SupplierVerification from "./pages/admin/SupplierVerification.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminQuotes from "./pages/admin/AdminQuotes.jsx";
import AdminReturns from "./pages/admin/AdminReturns.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import ChatBot from "./components/ui/ChatBot.jsx";
import ThemeToggle from "./components/ui/ThemeToggle.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Buyer Routes */}
        <Route element={<RequireRole allowedRoles={["buyer"]} />}>
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="home" element={<BuyerHome />} />
            <Route path="cart" element={<BuyerCart />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="quotes" element={<BuyerQuotes />} />
            <Route path="products/:id" element={<BuyerProductDetail />} />
            <Route path="returns" element={<BuyerReturns />} />
            <Route path="settings" element={<BuyerProfile />} />
          </Route>
        </Route>
        
        {/* Supplier Routes */}
        <Route element={<RequireRole allowedRoles={["supplier"]} />}>
          <Route path="/supplier/dashboard" element={<SupplierLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<SupplierOverview />} />
            <Route path="analytics" element={<SupplierAnalytics />} />
            <Route path="catalog" element={<SupplierCatalog />} />
            <Route path="orders" element={<SupplierOrders />} />
            <Route path="quotes" element={<SupplierQuotes />} />
            <Route path="payouts" element={<SupplierPayouts />} />
            <Route path="returns" element={<SupplierReturns />} />
            <Route path="alerts" element={<StockAlerts />} />
            <Route path="settings" element={<SupplierProfile />} />
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route element={<RequireRole allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="verification" element={<SupplierVerification />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="announcements" element={<AdminNotifications />} />
          </Route>
        </Route>
      </Routes>
      <ThemeToggle />
      <ChatBot />
    </>
  );
}

export default App;