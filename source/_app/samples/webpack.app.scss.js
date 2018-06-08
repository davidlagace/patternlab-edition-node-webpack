/**
 * NOTE: THIS IS A SAMPLE, THIS SHOULD BE webpack.app.js one level higher to be used in your project.
 * Add new dependencies like so:
 * "yarn add autoprefixer import-glob-loader css-loader node-sass postcss-loader postcss-flexbugs-fixes MiniCssExtractPlugin sass-loader style-loader --dev"
 * or
 * "npm install autoprefixer import-glob-loader css-loader node-sass postcss-loader postcss-flexbugs-fixes MiniCssExtractPlugin sass-loader style-loader --save-dev"
 */


const webpack = require("webpack");
const { getIfUtils } = require("webpack-config-utils");
const { resolve } = require("path");
const globby = require("globby");
const plConfig = require("../../patternlab-config.json");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = env => {
    const { ifProduction, ifDevelopment } = getIfUtils(env);
    const appNamespace = plConfig.app.namespace
        ? `$ns:${plConfig.app.namespace};`
        : ``;
    const app = {
        entry: {
            "js/sample-project": globby.sync(
                [
                    resolve(`${plConfig.paths.source.css}scss/*.scss`),
                    resolve(`${plConfig.paths.source.patterns}**/*.js`),
                    "!**/*.test.js"
                ],
                {
                    gitignore: true
                }
            ).map(function (filePath) {
                return filePath;
            })
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: "initial",
                        name: "js/sample-project-vendor",
                        priority: 10,
                        enforce: true
                    }
                }
            }
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
                disable: ifDevelopment()
            }),
            new webpack.DefinePlugin({
                NAMESPACE: appNamespace
            }),
            new webpack.debug.ProfilingPlugin()
        ],
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: ifDevelopment(
                                "style-loader",
                                MiniCssExtractPlugin.loader
                            )

                        },
                        {
                            loader: "css-loader",
                            options: {
                                minimize: ifProduction()
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: ifDevelopment(),
                                plugins: loader => [
                                    // eslint-disable-line no-unused-vars
                                    require("autoprefixer"),
                                    require("postcss-flexbugs-fixes")
                                ]
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                precision: 3,
                                sourceMap: ifDevelopment(),
                                outputStyle: ifProduction(
                                    "compressed",
                                    "expanded"
                                ),
                                data: appNamespace
                            }
                        },
                        {
                            loader: "import-glob-loader"
                        }
                    ]
                }
            ]
        }
    };
    return app;
};
