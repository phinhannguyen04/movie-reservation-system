import { Link } from 'react-router-dom';
import { Film, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-white/10 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-xl font-display font-bold text-white tracking-wider">
                CINEMAX
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the magic of cinema with our premium booking service. Your perfect movie night starts here.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-primary transition-colors text-sm">Now Showing</Link>
              </li>
              <li>
                <Link to="/schedule" className="text-gray-400 hover:text-primary transition-colors text-sm">Showtimes</Link>
              </li>
              <li>
                <Link to="/tickets" className="text-gray-400 hover:text-primary transition-colors text-sm">My Tickets</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-primary transition-colors text-sm">My Profile</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Refund Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Cookie Guidelines</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="text-gray-400 text-sm">
                <span className="block text-gray-500 mb-1">Email</span>
                support@cinemax.example.com
              </li>
              <li className="text-gray-400 text-sm">
                <span className="block text-gray-500 mb-1">Phone</span>
                +1 (555) 123-4567
              </li>
              <li className="text-gray-400 text-sm">
                <span className="block text-gray-500 mb-1">Address</span>
                123 Cinemax Blvd, Movie City, FL 33101
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Cinemax. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Designed for an ultimate movie experience
          </p>
        </div>
      </div>
    </footer>
  );
}
