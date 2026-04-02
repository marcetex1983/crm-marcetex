import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, Timestamp, query, where, getDocs, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Calendar, Briefcase, MessageSquare, Send, Trash2, Paperclip, File, Download, X } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thermometerRef = useRef<HTMLDivElement>(null);

  const temperatureLevels = ['gelado', 'frio', 'morno', 'quente', 'fogo'];
  
  const temperatureConfig: Record<string, { label: string; emoji: string; color: string }> = {
    gelado: { label: 'Gelado', emoji: '❄️', color: '#94a3b8' },
    frio: { label: 'Frio', emoji: '🧊', color: '#3b82f6' },
    morno: { label: 'Morno', emoji: '🌡️', color: '#22c55e' },
    quente: { label: 'Quente', emoji: '🔥', color: '#f59e0b' },
    fogo: { label: 'Fogo', emoji: '💥', color: '#ef4444' }
  };

  const currentTempIndex = temperatureLevels.indexOf(prospect?.temperature || 'gelado');

  const handleTemperatureDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!thermometerRef.current) return;
    
    const rect = thermometerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percent * (temperatureLevels.length - 1));
    const newTemp = temperatureLevels[newIndex];
    
    if (newTemp !== prospect?.temperature) {
      handleTemperatureChange(newTemp);
    }
  };

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
    if ((!newInteraction.trim() && !selectedFile) || !id || !currentUser) return;
    setIsAddingInteraction(true);
    
    let fileData = null;
    
    try {
      if (selectedFile) {
        setIsUploading(true);
        const fileRef = ref(storage, `interactions/${id}/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        fileData = {
          url: downloadURL,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        };
      }

      await addDoc(collection(db, 'interactions'), {
        prospectId: id,
        userId: currentUser.uid,
        description: newInteraction,
        file: fileData,
        createdAt: Timestamp.now()
      });
      
      setNewInteraction('');
      setSelectedFile(null);
      fetchInteractions();
    } catch (error) {
      console.error('Error adding interaction', error);
      alert('Erro ao salvar interação ou arquivo.');
    } finally {
      setIsAddingInteraction(false);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!id) return;
    const firstConfirm = window.confirm('Tem certeza que deseja excluir este prospect? Esta ação não pode ser desfeita.');
    if (firstConfirm) {
      const secondConfirm = window.confirm('Você tem CERTEZA ABSOLUTA? O prospect será excluído permanentemente.');
      if (secondConfirm) {
        try {
          await deleteDoc(doc(db, 'prospects', id));
          navigate('/clients');
        } catch (error) {
          console.error('Error deleting prospect', error);
        }
      }
    }
  };

  const handleTemperatureChange = async (temp: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'prospects', id), { temperature: temp });
      setProspect((prev: any) => ({ ...prev, temperature: temp }));
    } catch (error) {
      console.error('Error updating temperature', error);
    }
  };

  const stages = [
    { value: 'prospeccao', label: 'Prospecção', color: '#6b7280' },
    { value: 'qualificado', label: 'Qualificado', color: '#3b82f6' },
    { value: 'proposta', label: 'Proposta', color: '#f59e0b' },
    { value: 'declinado', label: 'Declinado / Perdido', color: '#ef4444' },
    { value: 'fechado', label: 'Fechado', color: '#22c55e' }
  ];

  const getStageColor = (stageValue: string) => {
    const stage = stages.find(s => s.value === stageValue);
    return stage?.color || '#6b7280';
  };

  const getStageLabel = (stageValue: string) => {
    const stage = stages.find(s => s.value === stageValue);
    return stage?.label || stageValue;
  };

  /* Removed redundant formatDate function */

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
          <button className="delete-btn" onClick={handleDelete} title="Excluir prospect">
            <Trash2 size={18} />
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

            <div className="temperature-display">
              <div 
                className="thermometer-container"
                ref={thermometerRef}
                onMouseDown={(e) => handleTemperatureDrag(e)}
                onTouchStart={(e) => handleTemperatureDrag(e)}
              >
                <div className="thermometer-track">
                  <div 
                    className="thermometer-fill"
                    style={{ 
                      width: `${(currentTempIndex / (temperatureLevels.length - 1)) * 100}%`,
                      backgroundColor: temperatureConfig[prospect?.temperature]?.color
                    }}
                  />
                </div>
                <div className="thermometer-labels">
                  {temperatureLevels.map((temp, index) => (
                    <div 
                      key={temp}
                      className={`thermometer-dot ${index <= currentTempIndex ? 'active' : ''}`}
                      style={{ 
                        left: `${(index / (temperatureLevels.length - 1)) * 100}%`,
                        backgroundColor: index <= currentTempIndex ? temperatureConfig[temp]?.color : 'var(--outline-variant)'
                      }}
                    >
                      <span className="thermometer-emoji">{temperatureConfig[temp]?.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="thermometer-info">
                <span 
                  className="thermometer-current-label"
                  style={{ color: temperatureConfig[prospect?.temperature]?.color }}
                >
                  {temperatureConfig[prospect?.temperature]?.emoji} {temperatureConfig[prospect?.temperature]?.label}
                </span>
                <span className="thermometer-hint">Arraste para mudar</span>
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
                placeholder="Descreva a interação ou anexe um arquivo..."
                rows={3}
              />
              
              <div className="interaction-extras">
                <div className="file-upload-zone">
                  <input
                    type="file"
                    id="interaction-file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {!selectedFile ? (
                    <button 
                      type="button" 
                      className="btn-attach"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={18} />
                      <span>Anexar Arquivo</span>
                    </button>
                  ) : (
                    <div className="selected-file-badge">
                      <File size={16} />
                      <span className="file-name">{selectedFile.name}</span>
                      <button type="button" className="btn-remove-file" onClick={removeFile}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  className="btn-primary" 
                  onClick={handleAddInteraction}
                  disabled={isAddingInteraction || isUploading || (!newInteraction.trim() && !selectedFile)}
                >
                  <Send size={18} />
                  <span>{isUploading ? 'Enviando...' : isAddingInteraction ? 'Salvando...' : 'Registrar Interação'}</span>
                </button>
              </div>
            </div>

            <div className="interactions-list">
              {interactions.length === 0 ? (
                <p className="no-interactions">Nenhuma interação registrada ainda.</p>
              ) : (
                interactions.map(interaction => (
                  <div key={interaction.id} className="interaction-card">
                    <p>{interaction.description}</p>
                    
                    {interaction.file && (
                      <div className="interaction-file-attachment">
                        <div className="file-info">
                          <File size={16} />
                          <span>{interaction.file.name}</span>
                        </div>
                        <a 
                          href={interaction.file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-download"
                          title="Baixar arquivo"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    )}

                    <div className="interaction-footer">
                      <span className="interaction-date">
                        {interaction.createdAt?.toDate().toLocaleString('pt-BR')}
                      </span>
                    </div>
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