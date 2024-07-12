// 生成一个随机的 clientId
const generateRandomId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const storageID = localStorage.getItem('SSE_CLIENT_ID');

const clientId = storageID || generateRandomId();

if (!storageID) {
  localStorage.setItem('SSE_CLIENT_ID', clientId);
}

export { clientId };
