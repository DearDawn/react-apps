const { createProxyMiddleware } = require("http-proxy-middleware");
const useLocal = false;

module.exports =  function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: useLocal ? "http://localhost:7020/" : "https://www.dododawn.com:7020/",
      pathRewrite: {
        "/api": "",
      },
      changeOrigin: true
    })
  );
};