const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    entry: './src/sketch.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: "> 0.25%, not dead, last 10 chrome versions",
                                    useBuiltIns: 'entry',
                                },
                            ],
                        ],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            '@babel/plugin-transform-regenerator',
                        ],
                    },
                },
            },
            // {
            //     test: /\.rs$/,
            //     use: [{
            //         loader: 'wasm-loader'
            //     }, {
            //         loader: 'rust-native-wasm-loader',
            //         options: {
            //             release: true
            //         }
            //     }]
            // }
        ],
    },
    plugins: [new NodePolyfillPlugin()],
    resolve: {
        fallback: {
            fs: false,
            readline: false,
        },
    },
};
