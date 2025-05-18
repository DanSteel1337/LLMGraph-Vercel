module.exports = {
  extends: ["next/core-web-vitals", "plugin:import/recommended", "plugin:import/typescript"],
  plugins: ["import"],
  rules: {
    // Detect circular dependencies
    "import/no-cycle": ["error", { maxDepth: 10 }],

    // Enforce import order
    "import/order": [
      "warn",
      {
        groups: [
          "builtin", // Node.js built-in modules
          "external", // npm packages
          "internal", // Absolute imports (using @/)
          ["parent", "sibling"], // Relative imports
          "index", // index imports
          "object", // object imports
          "type", // Type imports
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
      },
    ],

    // Prevent importing from non-existent files
    "import/no-unresolved": "error",

    // Prevent unnecessary path segments
    "import/no-useless-path-segments": "warn",

    // Prevent importing the same module multiple times
    "import/no-duplicates": "warn",

    // Ensure all imports are used
    "import/no-unused-modules": [
      "warn",
      {
        unusedExports: true,
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
}
