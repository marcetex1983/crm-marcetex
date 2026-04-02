import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, MapPin, Phone, Mail, UserCheck, Edit2, LayoutGrid, List } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import './Clients.css';

const stageColors: Record<string, string> = {
  prospeccao: '#6b7280',
  qualificado: '#3b82f6',
  proposta: '#f59e0b',
  declinado: '#ef4444',
  fechado: '#22c55e'
};

const stageLabels: Record<string, string> = {
  prospeccao: 'Prospecção',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  declinado: 'Declinado',
  fechado: 'Fechado'
};

const temperatureLabels: Record<string, { label: string; emoji: string; color: string }> = {
  gelado: { label: 'Gelado', emoji: '❄️', color: '#94a3b8' },
  frio: { label: 'Frio', emoji: '🧊', color: '#3b82f6' },
  morno: { label: 'Morno', emoji: '🌡️', color: '#22c55e' },
  quente: { label: 'Quente', emoji: '🔥', color: '#f59e0b' },
  fogo: { label: 'Fogo', emoji: '💥', color: '#ef4444' }
};

const Clients: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [stageFilter, setStageFilter] = useState<string>('');

  useEffect(() => {
    const stage = searchParams.get('stage');
    setStageFilter(stage || '');
  }, [searchParams]);

  const fetchClients = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      let q = query(collection(db, 'prospects'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      if (stageFilter) {
        data = data.filter((client: any) => client.stage === stageFilter);
      }
      
      setClients(data);
    } catch (error) {
      console.error('Error fetching prospects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentUser, stageFilter]);

  return (
    <div className="clients-page">
      <PageTitle icon={UserCheck} title="Prospects" subtitle="Gerencie sua base de prospects e parceiros." />
      
      <header className="page-header">
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          <Plus size={20} />
          <span>Novo Prospect</span>
        </button>
      </header>

      <section className="clients-toolbar">
        <div className="search-bar layer-2">
          <Search size={18} />
          <input type="text" placeholder="Buscar prospects ou parceiros..." />
        </div>
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Visualização em cards"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Visualização em lista"
          >
            <List size={18} />
          </button>
        </div>
      </section>

      {loading ? (
        <div className="loading">Buscando prospects...</div>
      ) : (
        <div className={`clients-${viewMode}`}>
          {clients.length === 0 ? (
            <p className="empty-state">Nenhum prospect cadastrado.</p>
          ) : (
            clients.map(client => (
              <div key={client.id} className={`client-card layer-2 ${viewMode}`} onClick={() => navigate(`/clients/${client.id}`)}>
                <div className="card-top-row">
                  <div 
                    className="stage-indicator" 
                    style={{ backgroundColor: stageColors[client.stage] || '#6b7280' }}
                  />
                  <button 
                    className="card-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client.id}`);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="client-card-header" onClick={() => navigate(`/clients/${client.id}`)}>
                  <div className="card-badges">
                    <div className="stage-badge" style={{ backgroundColor: stageColors[client.stage] || '#6b7280' }}>
                      {stageLabels[client.stage] || client.stage}
                    </div>
                    {client.temperature && temperatureLabels[client.temperature] && (
                      <div className="temperature-badge" style={{ backgroundColor: temperatureLabels[client.temperature].color }}>
                        {temperatureLabels[client.temperature].emoji} {temperatureLabels[client.temperature].label}
                      </div>
                    )}
                  </div>
                  <span className="label-md">{client.type}</span>
                  <h3 className="headline-md">{client.name}</h3>
                  <p className="client-company">{client.company}</p>
                </div>
                
                <div className="client-details">
                  <div className="detail-item"><Mail size={14} /> <span>{client.email}</span></div>
                  <div className="detail-item"><Phone size={14} /> <span>{client.phone}</span></div>
                  <div className="detail-item"><MapPin size={14} /> <span>{client.city}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Clients;