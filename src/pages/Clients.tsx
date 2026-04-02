import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
// import Card from '../components/Card'; // Removed as it is now unused in favor of layer-2 divs
import { Plus, Search, MapPin, Phone, Mail } from 'lucide-react';
import './Clients.css';

const Clients: React.FC = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    type: 'empresa', // arquiteto, empresa, parceiro
    notes: ''
  });

  const fetchClients = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'clients'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentUser]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'clients'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: Timestamp.now()
      });
      setShowModal(false);
      setFormData({ name: '', company: '', phone: '', email: '', city: '', type: 'empresa', notes: '' });
      fetchClients();
    } catch (error) {
      console.error('Error adding client', error);
    }
  };

  return (
    <div className="clients-page">
      <header className="page-header">
        <div className="header-text">
          <span className="label-md">CRM base</span>
          <h1 className="headline-lg">Clientes</h1>
          <p>Gerencie sua base de contatos e parceiros.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </header>

      <section className="clients-toolbar">
        <div className="search-bar layer-2">
          <Search size={18} />
          <input type="text" placeholder="Buscar clientes ou parceiros..." />
        </div>
      </section>

      {loading ? (
        <div className="loading">Buscando clientes...</div>
      ) : (
        <div className="clients-grid">
          {clients.length === 0 ? (
            <p className="empty-state">Nenhum cliente cadastrado.</p>
          ) : (
            clients.map(client => (
              <div key={client.id} className="client-card layer-2">
                <div className="client-card-header">
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Novo Cliente</h2>
            <form onSubmit={handleAddClient} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Juliana Silva" />
                </div>
                <div className="form-group">
                  <label>Empresa</label>
                  <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Ex: Escritório de Arquitetura" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="empresa">Empresa</option>
                    <option value="arquiteto">Arquiteto</option>
                    <option value="parceiro">Parceiro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="save-btn">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
