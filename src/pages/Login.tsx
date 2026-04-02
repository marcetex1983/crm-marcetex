import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = emailPrefix ? `${emailPrefix}@marcetex.com.br` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Login realizado com sucesso!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/crm_marcetex.png" alt="Marcetex Logo" className="login-logo" />
          <h1>MARCETEX</h1>
          <p>Faça login para acessar suas vendas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuário</label>
            <div className="email-input-wrapper">
              <input 
                type="text" 
                value={emailPrefix} 
                onChange={(e) => setEmailPrefix(e.target.value)} 
                placeholder="seu.usuario"
                required 
              />
              <span className="email-domain">@marcetex.com.br</span>
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Sua senha segura"
              required 
            />
          </div>

          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
