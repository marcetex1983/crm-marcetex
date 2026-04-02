import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Calendar, Briefcase, MessageSquare, Send } from 'lucide-react';
import './ProspectDetail.css';

const ProspectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [newInteraction, setNewInteraction] = useState('');
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);

  const stages = [
    { value: 'prospeccao', label: 'Prospecção', color: '#6b7280' },
    { value: 'qualificado', label: 'Qualificado', color: '#3b82f6' },
    { value: 'proposta', label: 'Proposta', color: '#f59e0b' },
    { value: 'declinado', label: 'Declinado / Perdido', color: '#ef4444' },
    { value: 'fechado', label: 'Fechado', color: '#22c55e' }
  ];

  const fetchProspect = async () => {
    if (!id || !currentUser) return;
    try {
      setLoading(true);
      const docRef = doc(db, 'prospects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProspect({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching prospect', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractions = async () => {
    if (!id) return;
    try {
      const q = query(
        collection(db, 'interactions'),
        where('prospectId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching interactions', error);
    }
  };

  useEffect(() => {
    fetchProspect();
    fetchInteractions();
  }, [id, currentUser]);

  const handleAddInteraction = async () => {
    if (!newInteraction.trim() || !id || !currentUser) return;
    setIsAddingInteraction(true);
    try {
      await addDoc(collection(db, 'interactions'), {
        prospectId: id,
        userId: currentUser.uid,
        description: newInteraction,
        createdAt: Timestamp.now()
      });
      setNewInteraction('');
      fetchInteractions();
    } catch (error) {
      console.error('Error adding interaction', error);
    } finally {
      setIsAddingInteraction(false);
    }
  };

  const getStageColor = (stageValue: string) => {
    const stage = stages.find(s => s.value === stageValue);
    return stage?.color || '#6b7280';
  };

  const getStageLabel = (stageValue: string) => {
    const stage = stages.find(s => s.value === stageValue);
    return stage?.label || stageValue;
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate ? date.toDate().toLocaleDateString('pt-BR') : '-';
  };

  if (loading) {
    return <div className="prospect-detail-page"><div className="loading">Carregando...</div></div>;
  }

  if (!prospect) {
    return <div className="prospect-detail-page"><div className="loading">Prospect não encontrado</div></div>;
  }

  return (
    <div className="prospect-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/clients')}>
          <ArrowLeft size={20} />
          <span>Voltar para Prospects</span>
        </button>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Edit2 size={18} />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="detail-content">
        <main className="detail-main">
          <section className="prospect-info-card">
            <div className="prospect-header">
              <div className="prospect-avatar">
                {prospect.name?.charAt(0).toUpperCase()}
              </div>
              <div className="prospect-header-text">
                <h1>{prospect.name}</h1>
                <p className="company-name">{prospect.company}</p>
              </div>
              <div className="stage-badge" style={{ backgroundColor: getStageColor(prospect.stage) }}>
                {getStageLabel(prospect.stage)}
              </div>
            </div>

            <div className="prospect-details-grid">
              <div className="detail-item">
                <Mail size={16} />
                <span>{prospect.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{prospect.phone}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{prospect.city}</span>
              </div>
              <div className="detail-item">
                <Briefcase size={16} />
                <span style={{ textTransform: 'capitalize' }}>{prospect.type}</span>
              </div>
              {prospect.birthday && (
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Aniversário: {prospect.birthday}</span>
                </div>
              )}
            </div>
          </section>

          <section className="interactions-section">
            <div className="section-header">
              <h2>
                <MessageSquare size={20} />
                Interações
              </h2>
              <span className="interaction-count">{interactions.length}</span>
            </div>

            <div className="add-interaction">
              <textarea
                value={newInteraction}
                onChange={e => setNewInteraction(e.target.value)}
                placeholder="Descreva a interação com o prospect..."
                rows={3}
              />
              <button 
                className="btn-primary" 
                onClick={handleAddInteraction}
                disabled={!newInteraction.trim() || isAddingInteraction}
              >
                <Send size={16} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="interactions-list">
              {interactions.length === 0 ? (
                <p className="no-interactions">Nenhuma interação registrada ainda.</p>
              ) : (
                interactions.map(interaction => (
                  <div key={interaction.id} className="interaction-card">
                    <p>{interaction.description}</p>
                    <span className="interaction-date">
                      {formatDate(interaction.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProspectDetail;