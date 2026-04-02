import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, LayoutDashboard, Users, Briefcase, FileText, UserCheck, Target, XCircle, CheckCircle } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    proposals: 0,
    closedSales: 0,
    totalValue: 0,
    funnel: {
      prospeccao: 0,
      qualificado: 0,
      proposta: 0,
      declinado: 0,
      fechado: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const prospectsQuery = query(collection(db, 'prospects'), where('userId', '==', currentUser.uid));
        const projectsQuery = query(collection(db, 'projects'), where('userId', '==', currentUser.uid));
        
        const prospectsSnap = await getDocs(prospectsQuery);
        const projectsSnap = await getDocs(projectsQuery);
        
        const prospects = prospectsSnap.docs.map(doc => doc.data());
        const funnel = {
          prospeccao: prospects.filter(p => p.stage === 'prospeccao').length,
          qualificado: prospects.filter(p => p.stage === 'qualificado').length,
          proposta: prospects.filter(p => p.stage === 'proposta').length,
          declinado: prospects.filter(p => p.stage === 'declinado').length,
          fechado: prospects.filter(p => p.stage === 'fechado').length
        };

        const projects = projectsSnap.docs.map(doc => doc.data());
        const closed = projects.filter(p => p.status === 'aprovado');
        const inProgress = projects.filter(p => p.status !== 'aprovado' && p.status !== 'perdido');
        const totalValue = projects.reduce((acc, p) => acc + (Number(p.value) || 0), 0);

        setStats({
          clients: prospectsSnap.size,
          proposals: inProgress.length,
          closedSales: closed.length,
          totalValue,
          funnel
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

  const funnelItems = [
    { label: 'PROSPECÇÃO', value: stats.funnel.prospeccao, width: '100%', color: '#3b82f6', icon: Target },
    { label: 'QUALIFICADO', value: stats.funnel.qualificado, width: '90%', color: '#a855f7', icon: UserCheck },
    { label: 'NEGOCIAÇÃO PROPOSTA', value: stats.funnel.proposta, width: '80%', color: '#f59e0b', icon: FileText },
    { label: 'DECLINADO / PERDIDO', value: stats.funnel.declinado, width: '70%', color: '#ef4444', icon: XCircle },
    { label: 'FECHADO', value: stats.funnel.fechado, width: '60%', color: '#22c55e', icon: CheckCircle },
  ];

  return (
    <div className="dashboard">
      <PageTitle icon={LayoutDashboard} title="Dashboard" subtitle={`Bem-vindo, ${currentUser?.email?.split('@')[0]}`} />

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
              <span className="label-md">Prospects</span>
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
            <h3 className="headline-md">Funil de Vendas</h3>
            <div className="sales-funnel">
              {funnelItems.map((item, index) => {
                const Icon = item.icon;
                const isZero = item.value === 0;
                return (
                  <React.Fragment key={index}>
                    <div 
                      className="funnel-step-card" 
                      style={{ 
                        width: item.width,
                        borderColor: isZero ? 'var(--outline-variant)' : item.color,
                        backgroundColor: isZero ? 'var(--surface-container-low)' : `${item.color}08`
                      }}
                    >
                      <div className="funnel-step-left">
                        <Icon size={20} style={{ color: isZero ? 'var(--outline)' : item.color }} />
                        <span className="funnel-label" style={{ color: isZero ? 'var(--outline)' : item.color }}>
                          {item.label}
                        </span>
                      </div>
                      <span className="funnel-count" style={{ color: isZero ? 'var(--outline)' : item.color }}>
                        {item.value}
                      </span>
                    </div>
                    {index < funnelItems.length - 1 && (
                      <div className="funnel-arrow">
                        <div className="arrow-down"></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
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
