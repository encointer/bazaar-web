module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(?:@polkadot|@encointer)/)"
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
};
