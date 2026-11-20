
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log("Middleware: No token found in header!");
        return res.status(401).json({ message: "Unauthorized: Token Missing" });
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.error("Middleware: Token verify failed:", err.message);
            return res.status(403).json({ message: "Forbidden: Invalid Token" });
        }
        
        (req as any).user = user;
        next();
    });
};