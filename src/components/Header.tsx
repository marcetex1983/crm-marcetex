import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { Calendar, Clock, User, LogOut, ChevronDown } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Usuário';
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-datetime">
        <div className="datetime-item">
          <Calendar size={16} />
          <span>{formatDate(currentTime)}</span>
        </div>
        <div className="datetime-divider" />
        <div className="datetime-item">
          <Clock size={16} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="header-user">
        <button 
          className="user-trigger"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="user-avatar">
            <User size={16} />
          </div>
          <span className="user-name">{getUserDisplayName()}</span>
          <ChevronDown size={16} className={`chevron ${showUserMenu ? 'open' : ''}`} />
        </button>

        {showUserMenu && (
          <div className="user-dropdown">
            <div className="dropdown-header">
              <span className="dropdown-email">{currentUser?.email}</span>
            </div>
            <div className="dropdown-divider" />
            <button className="dropdown-item logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;