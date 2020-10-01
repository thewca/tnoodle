const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        ['/frontend', '/version', '/wcif'],
        createProxyMiddleware({
            target: 'http://localhost:2014',
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
        })
    );
};
