// ⚠️  This file is in .gitignore — never commit real credentials.
// In CI/CD: write this file from secrets before running `npm run build`.
export const environment = {
  production: true,
  apiUrl: '/api',
  firebase: {
    apiKey: 'AIzaSyAv5A5OXS6eVWBvDaWHuh3C0bFKhyWQrVc',
    authDomain: 'seflow-fe7d6.firebaseapp.com',
    projectId: 'seflow-fe7d6',
    storageBucket: 'seflow-fe7d6.firebasestorage.app',
    messagingSenderId: '190569552842',
    appId: '1:190569552842:web:86b76768dd7f9fb8c88d33',
  },
};
