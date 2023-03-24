/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  productionSourceMap: false,
  // publicPath: '/insdot-web/dist/',
  publicPath: '/chatee/dist/',
  // publicPath: '/chatee/dist/',
  devServer: {
    https: true,
    // port: 8088,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

}
