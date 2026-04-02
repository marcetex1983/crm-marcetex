import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clients from './pages/Clients';
import ClientRegistration from './pages/ClientRegistration';
import ProspectDetail from './pages/ProspectDetail';

// Placeholder components for other pages
const Placeholder = ({ name }: { name: string }) => (
  <div>
    <h1>{name}</h1>
    <p>Página em desenvolvimento para o CRM Marcetex.</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/clients/new" 
            element={
              <ProtectedRoute>
                <AppLayout><ClientRegistration /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clients/:id" 
            element={
              <ProtectedRoute>
                <AppLayout><ProspectDetail /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clients" 
            element={
              <ProtectedRoute>
                <AppLayout><Clients /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <AppLayout><Placeholder name="Projetos" /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/pipeline" 
            element={
              <ProtectedRoute>
                <AppLayout><Placeholder name="Pipeline Kanban" /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <AppLayout><Placeholder name="Tarefas e Follow-ups" /></AppLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout><Placeholder name="Perfil do Usuário" /></AppLayout>
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
