module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
  ],
  rules: {
    /** Possible Errors */
    'no-dupe-else-if': 'error',
    'no-import-assign': 'error',

    /** Best Practices */
    'array-callback-return': 'error',
    // 'default-case-last': 'error',
    'default-param-last': 'error',
    'dot-location': ['error', 'property'],
    eqeqeq: ['error', 'always'],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'no-caller': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'warn',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-implicit-coercion': 'error',
    'no-lone-blocks': 'error',
    'no-multi-spaces': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-restricted-properties': ['error', { property: '__defineGetter__' }, { property: '__defineSetter__' }],
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-throw-literal': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-regex-literals': 'error',
    'wrap-iife': ['warn', 'inside', { functionPrototypeMethods: true }],

    /** Variables */
    'no-restricted-globals': ['error', 'event', 'name', 'parent', 'top'],
    'no-undef-init': 'warn',
    'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    'no-use-before-define': ['error', { functions: false }],

    /** Node.js and CommonJS */
    'no-buffer-constructor': 'error',
    'no-new-require': 'error',
    'no-path-concat': 'error',

    /** Stylistic Issues */
    'array-bracket-newline': ['warn', 'consistent'],
    'array-bracket-spacing': 'warn',
    'brace-style': 'warn',
    camelcase: 'error',
    'comma-dangle': ['warn', { arrays: 'always-multiline', objects: 'always-multiline', imports: 'always-multiline', exports: 'always-multiline', functions: 'only-multiline' }],
    'comma-spacing': 'warn',
    'comma-style': 'warn',
    'computed-property-spacing': 'warn',
    'eol-last': ['warn', 'always'],
    'func-call-spacing': 'warn',
    'function-call-argument-newline': ['warn', 'consistent'],
    'function-paren-newline': ['warn', 'multiline-arguments'],
    indent: ['warn', 2, { SwitchCase: 1, MemberExpression: 'off' }],
    'jsx-quotes': ['warn', 'prefer-single'],
    'key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'strict' }],
    'keyword-spacing': ['warn', { before: true, after: true }],
    'linebreak-style': 'warn',
    'new-parens': 'warn',
    'no-array-constructor': 'error',
    'no-multi-assign': 'error',
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 0, maxBOF: 0 }],
    'no-new-object': 'error',
    'no-restricted-syntax': ['error', 'ForInStatement'],
    'no-trailing-spaces': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-whitespace-before-property': 'warn',
    'nonblock-statement-body-position': ['warn', 'beside'],
    'object-curly-newline': ['warn', { consistent: true }],
    'object-curly-spacing': ['warn', 'always'],
    'one-var': ['error', 'never'],
    'operator-assignment': 'warn',
    'operator-linebreak': ['warn', 'before'],
    'quote-props': ['warn', 'as-needed'],
    quotes: ['warn', 'single', { allowTemplateLiterals: true }],
    semi: ['warn', 'never'],
    'semi-spacing': ['warn', { before: false, after: true }],
    'semi-style': ['warn', 'last'],
    'space-before-blocks': 'warn',
    'space-before-function-paren': ['warn', { named: 'never' }],
    'space-in-parens': 'warn',
    'space-infix-ops': 'warn',
    'space-unary-ops': ['warn', { words: true, nonwords: false }],
    'spaced-comment': 'warn',
    'switch-colon-spacing': ['warn', { before: false }],
    'template-tag-spacing': 'warn',
    'unicode-bom': 'warn',

    /** ECMAScript 6 */
    'arrow-spacing': 'warn',
    'no-confusing-arrow': ['error', { allowParens: true }],
    'no-duplicate-imports': 'error',
    'no-useless-computed-key': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-rename': 'warn',
    'no-var': 'error',
    'object-shorthand': ['warn', 'always'],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'rest-spread-spacing': 'warn',
    'symbol-description': 'error',
    'template-curly-spacing': 'warn',

    /** Strongly Recommended */
    'vue/attribute-hyphenation': 'error',
    'vue/html-closing-bracket-newline': 'warn',
    'vue/html-closing-bracket-spacing': ['error', { selfClosingTag: 'always' }],
    'vue/html-end-tags': 'error',
    'vue/html-indent': ['warn', 2, { alignAttributesVertically: false }],
    'vue/html-quotes': ['warn', 'double'],
    'vue/max-attributes-per-line': ['warn', { singleline: 5, multiline: { max: 1 } }],
    'vue/mustache-interpolation-spacing': ['warn', 'always'],
    'vue/name-property-casing': ['warn', 'PascalCase'],
    'vue/no-multi-spaces': 'warn',
    'vue/no-spaces-around-equal-signs-in-attribute': 'warn',
    'vue/no-template-shadow': 'error',
    'vue/require-prop-types': 'error',
    'vue/v-bind-style': 'warn',
    'vue/v-on-style': 'warn',

    /** Recommended */
    'vue/attributes-order': 'warn',
    'vue/order-in-components': 'warn',
    'vue/this-in-template': 'error',

    /** Uncategorized */
    'vue/array-bracket-spacing': 'warn',
    'vue/arrow-spacing': 'warn',
    'vue/brace-style': 'warn',
    'vue/camelcase': 'error',
    'vue/comma-dangle': ['warn', { arrays: 'always-multiline', objects: 'always-multiline', imports: 'always-multiline', exports: 'always-multiline', functions: 'only-multiline' }],
    'vue/component-name-in-template-casing': ['warn', 'kebab-case'],
    'vue/dot-location': ['error', 'property'],
    'vue/eqeqeq': ['error', 'always'],
    'vue/key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'strict' }],
    'vue/keyword-spacing': ['warn', { before: true, after: true }],
    'vue/match-component-file-name': ['error', { extensions: ['vue'] }],
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-empty-pattern': 'error',
    'vue/object-curly-spacing': ['warn', 'always'],
    'vue/space-infix-ops': 'warn',
    'vue/space-unary-ops': ['warn', { words: true, nonwords: false }],
    'vue/v-slot-style': 'error',
    // 'valid-v-bind-sync': 'error',
    'vue/valid-v-slot': 'error',
  },
}
