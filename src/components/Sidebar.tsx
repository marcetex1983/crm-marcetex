import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Briefcase, CheckSquare, User, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import { auth } from '../firebase';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Prospects', path: '/clients', icon: Users },
    { name: 'Projetos', path: '/projects', icon: Briefcase },
    { name: 'Pipeline', path: '/pipeline', icon: FolderKanban },
    { name: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { name: 'Perfil', path: '/profile', icon: User },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/crm_marcetex.png" alt="Marcetex Logo" className="logo" />
        {!collapsed && <h1 className="brand-name">Marcetex</h1>}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.name : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={onToggle} 
          className="toggle-btn"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          {!collapsed && <span>Recolher</span>}
        </button>
        
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;