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
import SupplierLayout   from "./components/layout/SupplierLayout.jsx";
import SupplierOverview from "./pages/supplier/SupplierOverview.jsx";
import SupplierCatalog  from "./pages/supplier/SupplierCatalog.jsx";
import SupplierOrders   from "./pages/supplier/SupplierOrders.jsx";
import SupplierQuotes   from "./pages/supplier/SupplierQuotes.jsx";
import SupplierPayouts  from "./pages/supplier/SupplierPayouts.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route element={<RequireRole allowedRoles={["buyer"]} />}>
        <Route path="/buyer" element={<BuyerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BuyerDashboard />} />
          <Route path="home" element={<BuyerHome />} />
          <Route path="cart" element={<BuyerCart />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="quotes" element={<BuyerQuotes />} />
          <Route path="products/:id" element={<BuyerProductDetail />} />
        </Route>
      </Route>
      <Route element={<RequireRole allowedRoles={["supplier"]} />}>
        <Route path="/supplier/dashboard" element={<SupplierLayout />}>
          <Route index element={<SupplierOverview />} />
          <Route path="overview" element={<SupplierOverview />} />
          <Route path="catalog" element={<SupplierCatalog />} />
          <Route path="orders" element={<SupplierOrders />} />
          <Route path="quotes" element={<SupplierQuotes />} />
          <Route path="payouts" element={<SupplierPayouts />} />
        </Route>
      </Route>
      <Route element={<RequireRole allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
