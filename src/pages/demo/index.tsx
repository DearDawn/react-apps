import { createRoot } from 'react-dom/client';
import '@/assets/global.less';
import { App } from './App';

const app = document.getElementById('app');
const root = createRoot(app);
root.render(<App />);


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('/src/assets/demo-service-worker.js', import.meta.url), { type: 'module' })
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function (error) {
      console.log('Service Worker registration failed:', error);
    });
}