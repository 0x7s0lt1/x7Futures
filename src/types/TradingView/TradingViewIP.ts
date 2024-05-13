export type TradingViewIP = "52.89.214.238" | "34.212.75.30" | "54.218.53.128" | "52.32.178.7";

/**
 * Checks if the provided IP is a TradingView IP.
 *
 * @param {string} ip - The IP address to check
 * @return {boolean} True if the IP is a TradingView IP, false otherwise
 */
export const isTradingViewIp = (ip: string): ip is TradingViewIP => {
    return ip === "52.89.214.238" || ip === "34.212.75.30" || ip === "54.218.53.128" || ip === "52.32.178.7";
}