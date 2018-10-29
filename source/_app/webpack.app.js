const webpack = require("webpack");
const {getIfUtils} = require("webpack-config-utils");
const {resolve} = require("path");
const globby = require("globby");
const plConfig = require("../../patternlab-config.json");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = env => {
  const {ifProduction, ifDevelopment} = getIfUtils(env);
  const appNamespace = plConfig.app.namespace
                       ? `$ns:${plConfig.app.namespace};`
                       : ``;
  const app = {
    entry: {
      "css/uikit-marvel": globby.sync([
        resolve(`${plConfig.paths.source.css}uikit-marvel.scss`)
      ]).map(function(filePath) {
        return filePath;
      }),

      // "js/uikit-marvel": globby.sync([
      //     resolve(`${plConfig.paths.source.patterns}**/*.js`),
      //     "!**/*.test.js"
      //   ], {gitignore: true}
      // )
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            chunks: "initial",
            name: "js/uikit-marvel-vendor",
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
      })
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
                url: false,
                minimize: {
                  safe: ifProduction()
                },
                sourceMap: ifDevelopment(),
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
