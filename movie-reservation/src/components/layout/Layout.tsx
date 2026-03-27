import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
