import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Briefcase, CheckSquare, User, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import './Sidebar.css';

const Sidebar: React.FC = () => {
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
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Projetos', path: '/projects', icon: Briefcase },
    { name: 'Pipeline', path: '/pipeline', icon: FolderKanban },
    { name: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { name: 'Perfil', path: '/profile', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/crm_marcetex.png" alt="Marcetex Logo" className="logo" />
        <h1 className="brand-name">Marcetex</h1>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;
