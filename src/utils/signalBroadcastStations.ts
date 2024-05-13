import dotenv from "dotenv";
import * as process from "process";
import StationType from "../types/StationType";

dotenv.config();
export const SignalBroadcastStations: StationType[] = [
    {
        url: "https://zsoltfehervari.dev/api/tg/signalpoolbot/",
        headers: {
            'x-x7s-secret': process.env.X7S_SECRET_TOKEN,
            'Content-Type': 'application/json'
        },
    }
];
