const webpack = require('webpack')
module.exports = {
    chainWebpack: config => {
        //引入ProvidePlugin
        config.plugin("provide").use(webpack.ProvidePlugin, [{
            $: "jquery",
            jquery: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }, ]);
    },
}
