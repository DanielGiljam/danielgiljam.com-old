module.exports = {
  async exportPathMap(defaultPathMap) {
    return defaultPathMap
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      loader: "svg-inline-loader",
    })
    return config
  },
}
