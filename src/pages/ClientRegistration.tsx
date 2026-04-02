import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Phone, User, FileText, ChevronRight, ChevronLeft, Check, ArrowLeft, PenTool, HardHat, Briefcase } from 'lucide-react';
import './Clients.css';

const ClientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    type: 'arquiteto',
    birthday: '',
    stage: 'prospeccao',
    notes: ''
  });

  const stages = [
    { value: 'prospeccao', label: 'Prospecção' },
    { value: 'qualificado', label: 'Qualificado' },
    { value: 'proposta', label: 'Proposta' },
    { value: 'declinado', label: 'Declinado / Perdido' },
    { value: 'fechado', label: 'Fechado' }
  ];

  const steps = [
    { id: 1, title: 'Identificação', icon: User, fields: ['name', 'company', 'birthday', 'type', 'stage'] },
    { id: 2, title: 'Contato', icon: Phone, fields: ['email', 'phone', 'city'] },
    { id: 3, title: 'Detalhes', icon: FileText, fields: ['notes'] }
  ];

  const handleNext = () => {
    // Explicitly check required fields: name (step 1) and phone (step 2)
    let canProceed = true;
    if (currentStep === 1 && (!formData.name || formData.name.trim() === '')) {
      canProceed = false;
    }
    if (currentStep === 2 && (!formData.phone || formData.phone.trim() === '')) {
      canProceed = false;
    }
    
    if (canProceed && currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Por favor, preencha o Nome e o Telefone para salvar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'prospects'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: Timestamp.now()
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error adding prospect', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-registration-page">
      <header className="registration-header">
        <button className="back-btn" onClick={() => navigate('/clients')}>
          <ArrowLeft size={20} />
          <span>Voltar para Prospects</span>
        </button>
        <div className="header-center">
          <h1 className="headline-md">Novo Prospect</h1>
          <p>Preencha as informações para cadastrar um novo prospect.</p>
        </div>
      </header>

      <div className="registration-container">
        <aside className="registration-sidebar">
          <div className="sidebar-progress">
            <div className="progress-text">
              <span className="label-md">Progresso</span>
              <span className="progress-percent">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }} />
            </div>
          </div>

          <nav className="step-nav">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  className={`nav-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                >
                  <div className="nav-step-indicator">
                    {currentStep > step.id ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <div className="nav-step-content">
                    <span className="nav-step-title">{step.title}</span>
                    <span className="nav-step-desc">
                      {step.id === 1 && 'Nome, empresa e tipo'}
                      {step.id === 2 && 'Contato'}
                      {step.id === 3 && 'Observações'}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-tip">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <strong>Dica</strong>
              <p>Você pode salvar um prospect parcialmente preenchido e continuar depois.</p>
            </div>
          </div>
        </aside>

        <main className="registration-main">
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-panel">
              {currentStep === 1 && (
                <div className="form-step animate-step">
                  <div className="step-header">
                    <div className="step-icon-large">
                      <User size={28} />
                    </div>
                    <div>
                      <h2>Quem é este prospect?</h2>
                      <p>Informe o nome e o tipo de prospect.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Nome Completo</label>
                    <input
                      id="name"
                      autoFocus
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Juliana Silva"
                      className="input-large"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Empresa <span className="optional">(opcional)</span></label>
                    <input
                      id="company"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      placeholder="Nome da empresa ou escritório"
                      className="input-large"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthday">Data de Aniversário <span className="optional">(opcional)</span></label>
                    <input
                      id="birthday"
                      type="text"
                      value={formData.birthday}
                      onChange={e => setFormData({...formData, birthday: e.target.value})}
                      placeholder="dd/mm/aaaa"
                      className="input-large"
                      maxLength={10}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Cliente</label>
                    <div className="type-selector-horizontal">
                      {[
                        { value: 'arquiteto', label: 'Arquiteto', icon: PenTool },
                        { value: 'engenheiro', label: 'Engenheiro', icon: HardHat },
                        { value: 'diretor', label: 'Diretor', icon: Briefcase }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          className={`type-card ${formData.type === value ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, type: value})}
                        >
                          <Icon size={24} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stage">Etapa da Negociação</label>
                    <select
                      id="stage"
                      value={formData.stage}
                      onChange={e => setFormData({...formData, stage: e.target.value})}
                      className="input-large"
                    >
                      {stages.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step animate-step">
                  <div className="step-header">
                    <div className="step-icon-large">
                      <Phone size={28} />
                    </div>
                    <div>
                      <h2>Como entrar em contato?</h2>
                      <p>Forneça os dados de contato do prospect.</p>
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label htmlFor="email">E-mail <span className="optional">(opcional)</span></label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Telefone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">Cidade <span className="optional">(opcional)</span></label>
                    <input
                      id="city"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="Cidade - Estado"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-step animate-step">
                  <div className="step-header">
                    <div className="step-icon-large">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2>Últimos detalhes</h2>
                      <p>Adicione informações complementares.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Observações <span className="optional">(opcional)</span></label>
                    <textarea
                      id="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      placeholder="Anotações sobre o prospect..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft size={18} />
                <span>Voltar</span>
              </button>

              <div className="actions-right">
                <span className="step-counter">{currentStep} de 3</span>
                {currentStep < 3 ? (
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    <span>Continuar</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" className="save-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span>Salvando...</span>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Salvar Prospect</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ClientRegistration;