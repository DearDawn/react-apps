import './styles.less';
import ReactDOM from 'react-dom';
import { App } from './App';
import { handleTalk, handleType } from './pixi';

ReactDOM.render(
  <App onTyping={handleType} talk={handleTalk} />,
  document.getElementById('app')
);
