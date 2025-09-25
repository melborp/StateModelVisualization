const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: './src/App.tsx',
      stateDiagramDialog: './src/StateDiagramDialog.tsx',
      stateDiagramWitButton: './src/StateDiagramWitButton.tsx',
      printGraph: './src/PrintGraph.tsx'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js?v=[contenthash:8]',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk"),
        "VSSUI": path.resolve(__dirname, "node_modules/azure-devops-ui")
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/templates/App.html',
        filename: 'App.html',
        chunks: ['app'],
      }),
      new HtmlWebpackPlugin({
        template: './src/templates/StateDiagramDialog.html',
        filename: 'StateDiagramDialog.html',
        chunks: ['stateDiagramDialog'],
      }),
      new HtmlWebpackPlugin({
        template: './src/templates/StateDiagramWitButton.html',
        filename: 'StateDiagramWitButton.html',
        chunks: ['stateDiagramWitButton'],
      }),
      new HtmlWebpackPlugin({
        template: './src/templates/PrintGraph.html',
        filename: 'PrintGraph.html',
        chunks: ['printGraph'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'images'),
            to: 'images',
            globOptions: {
              ignore: ['**/*.svg']
            }
          },
          {
            from: path.resolve(__dirname, 'overview.md'),
            to: '../overview.md'
          },
          {
            from: path.resolve(__dirname, 'License.txt'),
            to: '../License.txt'
          },
          {
            from: path.resolve(__dirname, 'ThirdPartyNotice.txt'),
            to: '../ThirdPartyNotice.txt'
          }
        ],
      }),
    ],
    // Tree shaking and optimization
    mode: isProduction ? 'production' : 'development',
    optimization: {
      usedExports: true, // Enable tree shaking
      sideEffects: false, // Mark all modules as side-effect free
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    // Source maps: inline for development, separate files for production
    devtool: isProduction ? 'source-map' : 'inline-source-map',

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
        publicPath: '/dist',
      },
      server: "https",
      port: 8888,
      hot: true,
      allowedHosts: 'all'
    },
  };
};
