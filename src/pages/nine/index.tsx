import './styles.less';
import { createRoot } from 'react-dom/client';
import '@/utils/init';
import { App } from './App';
import { handleTalk, handleType } from './pixi';

const root = createRoot(document.getElementById('app'));
root.render(<App onTyping={handleType} talk={handleTalk} />);