// 生成一个随机的 clientId
const generateRandomId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const clientId = generateRandomId();

export { clientId };
