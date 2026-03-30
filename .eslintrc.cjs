module.exports = {
  root: true,
  extends: ["react-app"],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ["node_modules/", "dist/", "coverage/"],
  overrides: [
    {
      files: ["**/*.test.js", "**/*.test.jsx", "src/test/**/*.js"],
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
  ],
};
