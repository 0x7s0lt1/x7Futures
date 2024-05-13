import { schedule, ScheduledTask } from "node-cron";
import dotenv from "dotenv";
import CronJobType from "CronJobType";
import USDMFutureService from "../services/binance/USDMFutureService";

dotenv.config();

/**
 * Checks the ROI (Return on Investment) for a given USDMFutureService instance.
 *
 * @param {USDMFutureService} futures - The USDMFutureService instance to check the ROI for.
 * @return {Promise<ScheduledTask>} A promise that resolves to a ScheduledTask representing the cron job that checks the ROI.
 */
const checkROI: CronJobType = async (futures: USDMFutureService): Promise<ScheduledTask> => {

    return schedule('* * * * *', async () => {

        try{

            const positions = await futures.getPositionInformation();

           if(Array.isArray(positions)){

               const openPositions = positions.filter((position: any) => {
                   return Number(position.positionAmt) > 0;
               });

               // for (const position of openPositions) {
               //     if(position.unRealizedProfit > 0){
               //             console.log(position);
               //     }
               //
               //}

           }

        }catch (error) {
            console.log(error);
        }

    });
}

export default checkROI;