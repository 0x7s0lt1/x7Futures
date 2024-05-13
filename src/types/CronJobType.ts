import { ScheduledTask } from "node-cron";

type CronJobType = (futures : any) => Promise<ScheduledTask> | ScheduledTask;

export default CronJobType;