import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: ["android/app/src/main/assets/public/**"],
  },
  ...nextVitals,
];

export default eslintConfig;
