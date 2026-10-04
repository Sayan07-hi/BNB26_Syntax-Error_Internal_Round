import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import HowItWorks from '../pages/HowItWorks';
import Eligibility from '../pages/Eligibility';
import FAQ from '../pages/FAQ';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Verification from '../pages/Verification';
import MyAllocation from '../pages/MyAllocation';
import Allocations from '../pages/Allocations';
import TransparencyAnalytics from '../pages/TransparencyAnalytics';
import Simulation from '../pages/Simulation';
import NotFound from '../pages/NotFound';

import AdminLayout from '../layouts/AdminLayout';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminApplications from '../pages/admin/AdminApplications';
import AdminMonitoring from '../pages/admin/AdminMonitoring';
import AdminPlaceholder from '../pages/admin/AdminPlaceholder';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="eligibility" element={<Eligibility />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="verification" element={<Verification />} />
        <Route path="my-allocation" element={<MyAllocation />} />
        <Route path="allocations" element={<Allocations />} />
        <Route path="reports" element={<TransparencyAnalytics />} />
        <Route path="transparency" element={<TransparencyAnalytics />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="verification" element={<AdminPlaceholder title="Verification Management" />} />
        <Route path="allocation" element={<AdminPlaceholder title="Allocation Management" />} />
        <Route path="users" element={<AdminPlaceholder title="User Management" />} />
        <Route path="queue" element={<AdminMonitoring />} />
        <Route path="reports" element={<TransparencyAnalytics />} />
        <Route path="system" element={<AdminMonitoring />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="settings" element={<AdminPlaceholder title="Admin Settings" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
