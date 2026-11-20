import { User } from '../Model/User';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const authController = {
    register: async(req: Request, res: Response) => {
        const {email, username, password} = req.body;
        if (!email || !username || !password)
            return res.status(400).json({message: 'Vui lòng điền đầy đủ: Email, Username, Password'});
        
        const newUser = await User.createUser(email, username, password);
        if (!newUser) return res.status(409).json({message: 'Email đã được sử dụng'});
        return res.status(201).json({
            user: newUser.toJson()
        })
    },

    login: async (req: Request, res: Response) => {
        const {email, password} = req.body;
        if (!email || !password)
            return res.status(400).json({message: 'Vui lòng nhập Email và Password'});
        const user = await User.login(email, password);
        if (!user)
            return res.status(401).json({message: 'Email hoặc Password không chính xác'});
        const token = jwt.sign(
            user.toJson(), JWT_SECRET, {expiresIn: '24h'}
        )
        return res.status(200).json({
            token,
            user: user.toJson()
        })
    }
}