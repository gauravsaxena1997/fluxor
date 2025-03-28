import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DataProvider } from './context/DataContext'

// Error logging setup
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '10px';
  errorDiv.style.margin = '10px';
  errorDiv.style.border = '1px solid red';
  errorDiv.textContent = 'Error: ' + (event.error ? event.error.message : event.message);
  document.body.prepend(errorDiv);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
)
