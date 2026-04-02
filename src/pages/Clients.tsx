import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, MapPin, Phone, Mail, UserCheck, Edit2 } from 'lucide-react';

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
import PageTitle from '../components/PageTitle';
import './Clients.css';

const Clients: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'prospects'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(data);
    } catch (error) {
      console.error('Error fetching prospects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentUser]);

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
      </section>

      {loading ? (
        <div className="loading">Buscando prospects...</div>
      ) : (
        <div className="clients-grid">
          {clients.length === 0 ? (
            <p className="empty-state">Nenhum prospect cadastrado.</p>
          ) : (
            clients.map(client => (
              <div key={client.id} className="client-card layer-2">
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
                  <div className="stage-badge" style={{ backgroundColor: stageColors[client.stage] || '#6b7280' }}>
                    {stageLabels[client.stage] || client.stage}
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