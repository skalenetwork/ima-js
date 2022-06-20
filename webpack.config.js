const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        ima: "./src/index.ts",
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map",
        })
    ],
    resolve: {
        fallback: {
            // make sure you `npm install path-browserify` to use this
            path: require.resolve('path-browserify'),
            os: "os-browserify/browser",
            "fs": false
        },
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            // To avoid blotting up the `bn.js` library all over the packages 
            // use single library instance. 
            "bn.js": path.resolve(__dirname, 'node_modules/bn.js')
        }
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ],
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "dist"),
        library: "IMA-JS",
        libraryTarget: "umd",
    },
};