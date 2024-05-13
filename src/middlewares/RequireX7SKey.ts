import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const RequireX7SKey = (req: Request, res: Response, next: NextFunction): void => {

    if (req.headers.authorization === process.env.X7S_SECRET_TOKEN) {
        next();
    }else{
        res.status(401).send('Fuck off!');
    }

}

export default RequireX7SKey;
