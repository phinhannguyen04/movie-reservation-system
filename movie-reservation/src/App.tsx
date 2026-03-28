/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { Booking } from './pages/Booking';
import { MyTickets } from './pages/MyTickets';
import { Profile } from './pages/Profile';
import { Schedule } from './pages/Schedule';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './components/ui/Toast';

// Admin imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMovies } from './pages/admin/AdminMovies';
import { AdminCinemas } from './pages/admin/AdminCinemas';
import { AdminShowtimes } from './pages/admin/AdminShowtimes';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="movies" element={<Movies />} />
                <Route path="movies/:id" element={<MovieDetails />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="booking/:id" element={<Booking />} />
                <Route path="tickets" element={<MyTickets />} />
                <Route path="profile" element={<Profile />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="movies" element={<AdminMovies />} />
                <Route path="cinemas" element={<AdminCinemas />} />
                <Route path="showtimes" element={<AdminShowtimes />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
