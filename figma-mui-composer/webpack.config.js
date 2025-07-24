const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

class InlineChunkHtmlPlugin {
  constructor(htmlWebpackPlugin, patterns) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.patterns = patterns;
  }

  apply(compiler) {
    const publicPath = compiler.options.output.publicPath || '';

    compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', (compilation) => {
      const hooks = this.htmlWebpackPlugin.getHooks(compilation);

      hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', (assets) => {
        assets.headTags = this.getInlinedTags(publicPath, assets.headTags, compilation);
        assets.bodyTags = this.getInlinedTags(publicPath, assets.bodyTags, compilation);
      });
    });
  }

  getInlinedTags(publicPath, tags, compilation) {
    return tags.map((tag) => {
      if (!(tag.tagName === 'script' && tag.attributes && tag.attributes.src)) {
        return tag;
      }

      const scriptName = tag.attributes.src.replace(publicPath, '');

      if (!this.patterns.some((pattern) => scriptName.match(pattern))) {
        return tag;
      }

      const asset = compilation.getAsset(scriptName);
      if (asset == null) {
        return tag;
      }

      return {
        tagName: 'script',
        innerHTML: asset.source.source(),
        closeTag: true,
      };
    });
  }
}

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  
  entry: {
    ui: './src/ui-minimal.tsx',
    code: './src/code.ts',
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
        test: /\.(png|jpg|gif|webp|svg)$/,
        type: 'asset/inline',
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      cache: false,
      scriptLoading: 'blocking',
      inject: 'body',
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui\.js$/]),
  ],
});