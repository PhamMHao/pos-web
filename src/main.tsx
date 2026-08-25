import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './core/contexts/AuthContext.tsx';
import { MasterDataProvider } from './core/contexts/MasterDataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MasterDataProvider>
        <App />
      </MasterDataProvider>
    </AuthProvider>
  </StrictMode>,
);
