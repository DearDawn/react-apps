import VConsole from 'vconsole';

const urlParams = new URLSearchParams(window.location.search);
const testParam = urlParams.get('test');

if (testParam === '1') {
  new VConsole();
}

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
