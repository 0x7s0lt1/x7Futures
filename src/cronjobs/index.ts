import CronJobType from "CronJobType";
import checkROI from "./checkROI";
import USDMFutureService from "../services/binance/USDMFutureService";

/**
 * Initializes cron jobs by executing a list of predefined jobs and handling any errors that occur.
 *
 * @return {Promise<void>} A promise that resolves when all jobs have been executed or rejects if an error occurs.
 */
const initCronJobs = async ( futureService: USDMFutureService ): Promise<void> => {

    const JOBS: CronJobType[] = [
        checkROI,
    ];

    for (const job of JOBS) {
        try{
            await job(futureService);
        }catch (error) {
            console.log(error);
        }
    }

}

export default initCronJobs;