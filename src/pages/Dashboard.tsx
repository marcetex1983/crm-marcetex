import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, FileText } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    proposals: 0,
    closedSales: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // In a real app, these would be separate calls or a single aggregated query if possible
        const clientsQuery = query(collection(db, 'clients'), where('userId', '==', currentUser.uid));
        const projectsQuery = query(collection(db, 'projects'), where('userId', '==', currentUser.uid));
        
        const clientsSnap = await getDocs(clientsQuery);
        const projectsSnap = await getDocs(projectsQuery);
        
        const projects = projectsSnap.docs.map(doc => doc.data());
        const closed = projects.filter(p => p.status === 'aprovado');
        const inProgress = projects.filter(p => p.status !== 'aprovado' && p.status !== 'perdido');
        const totalValue = projects.reduce((acc, p) => acc + (Number(p.value) || 0), 0);

        setStats({
          clients: clientsSnap.size,
          proposals: inProgress.length,
          closedSales: closed.length,
          totalValue
        });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (loading) return <div className="loading">Carregando painel...</div>;

  return (
    <div className="dashboard">
      <header className="page-header">
        <span className="label-md">Visão Geral</span>
        <h1 className="headline-lg">Dashboard</h1>
        <p>Bem-vindo, {currentUser?.email?.split('@')[0]}</p>
      </header>

      {/* Hero Metric Section */}
      <section className="hero-metric layer-2">
        <div className="hero-content">
          <span className="label-md">Valor em Negociação</span>
          <h2 className="display-lg">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
          </h2>
          <div className="hero-trend up">
            <TrendingUp size={18} />
            <span>+12.5% em relação ao mês anterior</span>
          </div>
        </div>
        <div className="hero-action">
          <button className="btn-primary">Nova Proposta</button>
        </div>
      </section>

      <div className="asymmetric-layout">
        <div className="main-stats">
          <div className="stats-grid">
            <div className="stat-item layer-2">
              <span className="label-md">Clientes</span>
              <div className="stat-row">
                <span className="headline-md">{stats.clients}</span>
                <Users size={20} className="stat-icon" />
              </div>
            </div>
            
            <div className="stat-item layer-2">
              <span className="label-md">Propostas</span>
              <div className="stat-row">
                <span className="headline-md">{stats.proposals}</span>
                <FileText size={20} className="stat-icon" />
              </div>
            </div>

            <div className="stat-item layer-2">
              <span className="label-md">Vendas</span>
              <div className="stat-row">
                <span className="headline-md">{stats.closedSales}</span>
                <Briefcase size={20} className="stat-icon" />
              </div>
            </div>
          </div>

          <div className="pipeline-view layer-2">
            <h3 className="headline-md">Pipeline por Status</h3>
            <div className="bar-chart-sim">
              <div className="bar-group">
                <div className="bar" style={{ height: '40%', backgroundColor: 'var(--primary-container)' }}></div>
                <span className="label-md">Lead</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '70%', backgroundColor: '#4d4fc6' }}></div>
                <span className="label-md">Orçam.</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '90%', backgroundColor: '#898cff' }}></div>
                <span className="label-md">Negoc.</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '55%', backgroundColor: '#c0c1ff' }}></div>
                <span className="label-md">Aprov.</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="secondary-info layer-2">
          <h3 className="headline-md">Atividades Recentes</h3>
          <ul className="activity-list">
            <li>
              <div className="activity-marker"></div>
              <div className="activity-content">
                <p>Novo cliente adicionado: <strong>Arquiteta Juliana</strong></p>
                <span className="label-md">Há 2 horas</span>
              </div>
            </li>
            <li>
              <div className="activity-marker"></div>
              <div className="activity-content">
                <p>Proposta atualizada: <strong>Vidro Temperado 10mm</strong></p>
                <span className="label-md">Há 5 horas</span>
              </div>
            </li>
            <li>
              <div className="activity-marker"></div>
              <div className="activity-content">
                <p>Reunião marcada com <strong>Escritório XP</strong></p>
                <span className="label-md">Ontem</span>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
