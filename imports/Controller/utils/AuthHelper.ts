import { Request } from 'express';
export const getUserId = (req: Request): number | null => {
    const user = (req as any).user; 
    return user && user.id ? user.id : null;
};