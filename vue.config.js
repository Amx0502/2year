const webpack = require('webpack')
module.exports = {

    devServer: {
        host: '0.0.0.0',
        // https:true,
        client: {
            webSocketURL: 'ws://0.0.0.0:52041/ws',
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    },
    chainWebpack: config => {
        //引入ProvidePlugin
        config.plugin("provide").use(webpack.ProvidePlugin, [{
            $: "jquery",
            jquery: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        },]);
    },
    lintOnSave: false,
    transpileDependencies: true,
}
