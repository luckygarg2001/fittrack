import { Outlet, NavLink } from 'react-router-dom';
import { Home, Edit3, History, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-surface border-t border-slate-700 flex justify-around items-center p-2 z-50">
        <NavItem to="/" icon={<Home size={24} />} label="Home" />
        <NavItem to="/history" icon={<History size={24} />} label="History" />
        <NavItem to="/plan-editor" icon={<Edit3 size={24} />} label="Plan" />
        <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center p-2 ${
          isActive ? 'text-primary' : 'text-text-muted hover:text-text'
        }`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
}
