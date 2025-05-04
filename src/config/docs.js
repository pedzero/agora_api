export const jsdocOptions = {
    info: {
        version: '1.0.0',
        title: 'Agora API',
        description: 'API documentation for the Agora platform',
    },
    baseDir: './src',
    filesPattern: './modules/**/*.routes.js',
    swaggerUIPath: '/docs',
    exposeSwaggerUI: true,
    exposeApiDocs: false,
    notRequiredAsNullable: false,
    swaggerUiOptions: {},
    security: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
        },
    },
};
