export const environment = {
    production: false,
    // Development - use local proxy
    apiUrl: '/api',
    loginUrl: 'http://localhost:3000/login',
    browserDomain: 'http://localhost:4200',
    allowedOrigins: [
        'http://localhost:3000',  // Shell app
        'http://localhost:3001'   // Admission CRM
    ]
};
