import { registerSchema, loginSchema } from "./auth.schema.js";
import * as AuthService from "./auth.service.js";
import { blacklistToken } from "../../lib/blacklist.js";
import { getTokenFromHeader } from "../../utils/token.js";

export async function register(request, response, next) {
    try {
        const validatedData = registerSchema.parse(request.body);
        validatedData.profilePicture = request.file;
        const result = await AuthService.register(validatedData);
        return response.status(201).json(result);
    } catch (error) {
        if (error.name === "ZodError") {
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
        if (error.name === "ZodError") {
            return response.status(400).json({ errors: error.errors });
        }
        return next(error);
    }
}

export async function logout(request, response, next) {
    try {
        const token = getTokenFromHeader(request);
        if (token) {
            await blacklistToken(token);
        }

        return response.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return next(error);
    }
}
