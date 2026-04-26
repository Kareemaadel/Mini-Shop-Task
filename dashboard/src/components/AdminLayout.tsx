import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import {
  ChartBarIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { authService } from '../services/auth';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
  { name: 'Products', path: '/products', icon: CubeIcon },
  { name: 'Orders', path: '/orders', icon: ClipboardDocumentListIcon },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.clearSession();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <CubeIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Mini Shop</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-sidebar-text md:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-active text-sidebar-text-active'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-active"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-surface-border bg-surface px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-text-muted hover:bg-slate-100 md:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 border-l border-surface-border pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-main">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-sm font-semibold text-primary-700 dark:text-primary-300 shadow-sm border border-primary-200 dark:border-primary-800">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
