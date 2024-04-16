import { createRoot } from 'react-dom/client';
import '@/utils/init'
import { App } from './App';

const app = document.getElementById('app');
const root = createRoot(app);
root.render(<App />);
