import { createRoot } from 'react-dom/client';
import './global.less';
import { App } from './App';

const app = document.getElementById('app');
const root = createRoot(app);
root.render(<App />);
console.log('[dodo] ', '12312321', 12312321);