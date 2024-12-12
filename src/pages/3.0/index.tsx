import './styles.less';
import { createRoot } from 'react-dom/client';
import '@/utils/init';
import '@/utils/initThree';
import { App } from './App';

const root = createRoot(document.getElementById('app'));
root.render(<App />);