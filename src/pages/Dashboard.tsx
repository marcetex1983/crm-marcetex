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
        <h1>Dashboard</h1>
        <p>Bem-vindo, {currentUser?.email?.split('@')[0]}</p>
      </header>

      <section className="kpi-grid">
        <Card title="Total de Clientes" className="kpi">
          <div className="kpi-data">
            <div className="icon-box blue"><Users size={24} /></div>
            <span className="kpi-value">{stats.clients}</span>
          </div>
          <div className="kpi-trend up"><TrendingUp size={14} /> +12% este mês</div>
        </Card>

        <Card title="Propostas em Andamento" className="kpi">
          <div className="kpi-data">
            <div className="icon-box purple"><FileText size={24} /></div>
            <span className="kpi-value">{stats.proposals}</span>
          </div>
          <div className="kpi-trend up"><TrendingUp size={14} /> +5% este mês</div>
        </Card>

        <Card title="Vendas Fechadas" className="kpi">
          <div className="kpi-data">
            <div className="icon-box green"><Briefcase size={24} /></div>
            <span className="kpi-value">{stats.closedSales}</span>
          </div>
          <div className="kpi-trend up"><TrendingUp size={14} /> +2% este mês</div>
        </Card>

        <Card title="Valor em Negociação" className="kpi">
          <div className="kpi-data">
            <div className="icon-box gold"><DollarSign size={24} /></div>
            <span className="kpi-value">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
            </span>
          </div>
          <div className="kpi-trend down"><TrendingDown size={14} /> -1.5%</div>
        </Card>
      </section>

      <section className="dashboard-charts">
        <Card title="Pipeline por Status" className="chart-placeholder">
          <div className="bar-chart-sim">
            <div className="bar" style={{ height: '40%', backgroundColor: '#191497' }}><span>Lead</span></div>
            <div className="bar" style={{ height: '70%', backgroundColor: '#4d4fc6' }}><span>Orçam.</span></div>
            <div className="bar" style={{ height: '90%', backgroundColor: '#898cff' }}><span>Negoc.</span></div>
            <div className="bar" style={{ height: '55%', backgroundColor: '#c0c1ff' }}><span>Aprov.</span></div>
          </div>
        </Card>
        
        <Card title="Últimas Atividades" className="recent-activity">
          <ul className="activity-list">
            <li>Novo cliente adicionado: <strong>Arquiteta Juliana</strong></li>
            <li>Proposta atualizada para: <strong>Vidro Temperado 10mm</strong></li>
            <li>Reunião marcada com <strong>Escritório XP</strong></li>
          </ul>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
