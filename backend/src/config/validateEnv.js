const Joi = require('joi');

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5001),
    MONGODB_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    ALLOWED_ORIGINS: Joi.string().required(),
    // Optional
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_REDIRECT_URI: Joi.string().optional(),
    GITHUB_CLIENT_ID: Joi.string().optional(),
    GITHUB_CLIENT_SECRET: Joi.string().optional(),
    GITHUB_REDIRECT_URI: Joi.string().optional(),
    SENDGRID_API_KEY: Joi.string().optional(),
    SENDGRID_FROM_EMAIL: Joi.string().optional(),
    OLLAMA_BASE_URL: Joi.string().optional(),
    OPENROUTER_API_KEY: Joi.string().optional(),
    GROQ_API_KEY: Joi.string().optional(),
}).unknown(true);

function validateEnv() {
    const { error } = envSchema.validate(process.env);
    if (error) {
        console.error('❌ Environment validation failed:');
        console.error(error.details.map(d => d.message).join('\n'));
        process.exit(1);
    }
    console.log('✓ Environment variables validated');
}

module.exports = validateEnv;
