import { registerSchema, loginSchema } from './auth.schema.js';
import * as AuthService from './auth.service.js';

export async function register(request, response, next) {
  try {
    const validatedData = registerSchema.parse(request.body);
    const result = await AuthService.register(validatedData);
    return response.status(201).json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return response.status(400).json({ errors: error.errors });
    }
    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const validatedData = loginSchema.parse(request.body);
    const result = await AuthService.login(validatedData);
    return response.status(200).json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return response.status(400).json({ errors: error.errors });
    }
    return next(error);
  }
}
