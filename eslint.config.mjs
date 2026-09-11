import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: ["android/**", "webview-shell/**"],
  },
  ...nextVitals,
];

export default eslintConfig;
