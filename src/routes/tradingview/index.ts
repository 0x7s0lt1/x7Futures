import {Request, Response, Router} from "express";
import TradingViewSignalPayload, {isTradingViewSignalPayload} from "../../types/TradingView/TradingViewSignalPayload";
import {SignalBroadcastService} from "../../services/SignalBroadcastService";
import {logger, Sentry} from "../../utils/utils";
// import TradingViewIpGuard from "../../middlewares/TradingViewIpGuard";
import {NoteType} from "../../types/TradingView/NoteType";
import SignalProcessingProvider from "../../messages/provider/SignalProcessingProvider";

const router = Router();

// if(!TEST_MODE){
//     router.use('/', TradingViewIpGuard);
// }

router.post('/signal', async (req: Request, res: Response) => {

    try{

        Object.keys(req.body).forEach(key =>{
            if(typeof req.body[key] === "string"){
                req.body[key] = req.body[key].toUpperCase();
            }
        });

    }catch (e){
        Sentry.captureException(e);
        console.log(e);
        return res.status(400).send("Invalid payload");
    }

    logger(req.body);

    if(!isTradingViewSignalPayload(req.body)) {
        return res.status(400).send("Invalid payload");
    }

    if(req.body.note !== NoteType.DEBUG){

        try{

            await new SignalProcessingProvider().sendMessage(JSON.stringify(req.body));

        }catch (e){
            Sentry.captureException(e);
            console.log(e);
        }

    }

    try{

        await SignalBroadcastService.processSignal(req.body as TradingViewSignalPayload);
        
    }catch (e){
        Sentry.captureException(e);
        console.log(e);
    }

    res.status(200).send("");

});


export default router;