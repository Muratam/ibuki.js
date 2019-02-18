module.exports = {
  mode: 'development',
  // mode: "production",
  entry: {
    'main': './src/main.ts'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  node: {
    fs: 'empty'
  }
};
