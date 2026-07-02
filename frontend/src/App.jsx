import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import SuperAdminLayout  from './pages/SuperAdmin/Layout';
import SADashboard       from './pages/SuperAdmin/Dashboard';
import SAManageAdmins      from './pages/SuperAdmin/ManageAdmins';
import SAManageShops       from './pages/SuperAdmin/ManageShops';
import SAManageOrders      from './pages/SuperAdmin/ManageOrders';
import SAManageUsers       from './pages/SuperAdmin/ManageUsers';
import SAManageCategories  from './pages/SuperAdmin/ManageCategories';

import AdminLayout       from './pages/Admin/Layout';
import AdminDashboard    from './pages/Admin/Dashboard';
import ManageShop        from './pages/Admin/ManageShop';
import ManageProducts    from './pages/Admin/ManageProducts';
import AdminOrders       from './pages/Admin/AdminOrders';
import AdminProfile      from './pages/Admin/Profile';

import UserLayout        from './pages/User/Layout';
import Home              from './pages/User/Home';
import ShopDetail        from './pages/User/ShopDetail';
import Cart              from './pages/User/Cart';
import MyOrders          from './pages/User/MyOrders';
import OrderDetail       from './pages/User/OrderDetail';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && !role.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (user.role === 'admin')      return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<RoleRedirect />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Super Admin */}
        <Route path="/superadmin" element={
          <ProtectedRoute role={['superadmin']}><SuperAdminLayout /></ProtectedRoute>
        }>
          <Route index          element={<SADashboard />} />
          <Route path="admins"      element={<SAManageAdmins />} />
          <Route path="shops"       element={<SAManageShops />} />
          <Route path="orders"      element={<SAManageOrders />} />
          <Route path="users"       element={<SAManageUsers />} />
          <Route path="categories"  element={<SAManageCategories />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute role={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>
        }>
          <Route index           element={<AdminDashboard />} />
          <Route path="shop"     element={<ManageShop />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="profile"  element={<AdminProfile />} />
        </Route>

        {/* User */}
        <Route path="/" element={<ProtectedRoute role={['user']}><UserLayout /></ProtectedRoute>}>
          <Route path="home"              element={<Home />} />
          <Route path="shop/:id"          element={<ShopDetail />} />
          <Route path="cart"              element={<Cart />} />
          <Route path="my-orders"         element={<MyOrders />} />
          <Route path="order/:orderId"    element={<OrderDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
