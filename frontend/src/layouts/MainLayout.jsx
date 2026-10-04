import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main id="main-content" className="container animate-fade-in" style={{ padding: '2.5rem var(--spacing-4)', flex: 1, width: '100%' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
