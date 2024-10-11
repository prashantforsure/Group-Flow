module.exports = {
    extends: [
      'next/core-web-vitals',
      // other extends...
    ],
    rules: {
      'react-hooks/exhaustive-deps': 'warn', // Downgrade to warning
      // or to disable completely:
      // 'react-hooks/exhaustive-deps': 'off',
    },
  };