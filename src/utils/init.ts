import VConsole from 'vconsole';
import { changeShareInfo } from './web';
import { initWxSDK } from './wx';
import { action } from './action';
import { HOST } from './fetch';

const urlParams = new URLSearchParams(window.location.search);
const testParam = urlParams.get('test');

if (testParam === '1') {
  new VConsole();
}

action.config({ url: `${HOST}/action/add` });
action.visit();

initWxSDK();
changeShareInfo({});

console.log(
  `%c[react-apps] 构建时间%c${process.env.BUILD_TIME}`,
  'background: #b2f2bb;padding: 4px 8px;',
  'background: #bbb2f2; padding: 4px 8px;'
);
console.log(
  `%c[react-apps] 构建版本%c${process.env.APP_VERSION}`,
  'background: #b2f2bb;padding: 4px 8px;',
  'background: #bbb2f2; padding: 4px 8px;'
);