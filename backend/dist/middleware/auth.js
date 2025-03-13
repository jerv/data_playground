"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        console.log(`Auth middleware triggered for path: ${req.method} ${req.path}`);
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Missing or invalid authorization header');
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.',
            });
        }
        const token = authHeader.split(' ')[1];
        console.log('Token found in request header');
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        console.log(`Token decoded successfully, user id: ${decoded.id}`);
        // Find user by id
        const user = await user_1.User.findById(decoded.id);
        if (!user) {
            console.log(`User not found for id: ${decoded.id}`);
            return res.status(401).json({
                success: false,
                message: 'User not found or token is invalid.',
            });
        }
        console.log(`User found: ${user.username} (${user._id})`);
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed. Invalid token.',
        });
    }
};
exports.authenticate = authenticate;
