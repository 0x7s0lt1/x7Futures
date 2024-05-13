import {Request, Response, NextFunction} from "express";
import {isTradingViewIp} from "../types/TradingView/TradingViewIP";

/**
 * A middleware function that checks if the client's IP address is allowed.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware chain.
 * @return {void} This function does not return anything.
 */
const tradingViewIpGuard = (req: Request, res: Response, next: NextFunction) => {


    if( isTradingViewIp(req.ip) ) {
        next();
    }else{
        return res.status(403).send();
    }

    next();

}

export default tradingViewIpGuard;