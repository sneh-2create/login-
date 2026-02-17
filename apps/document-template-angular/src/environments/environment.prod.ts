export const environment = {
    production: true,
    // Production - API server
    apiUrl: 'https://staging.odpay.in/api',
    // Login URL (React app)
    loginUrl: 'https://login.odpay.in/login',
    // Angular app deployed to S3 at https://templates.odpay.in
    browserDomain: window.location.origin,
    allowedOrigins: [
        'https://admission.oderp.in',  // Production React app
        'https://login.oderp.in'
    ]
};
