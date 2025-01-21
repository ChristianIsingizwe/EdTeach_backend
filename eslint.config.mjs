import globals from "globals";
import airbnbConfig from "eslint-config-airbnb";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...airbnbConfig.rules,
      "no-console": "off", // Allow console.log statements
      semi: ["error", "always"], // Enforce semicolons
    },
  },
];
