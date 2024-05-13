import { OrderSide } from "../types/Binance/USDMFutures/OrderSide";
import SignalBotType from "../types/SignalBotType";
import FETUSDT from "../rules/FETUSDT";
import LDOUSDT from "../rules/LDOUSDT";
import BTCUSDT from "../rules/BTCUSDT";
import AAVEUSDT from "../rules/AAVEUSDT";
import API3USDT from "../rules/API3USDT";

const symbolRuleMatches = async (bot: SignalBotType): Promise<boolean> => {

    switch (bot.signal.symbol) {
        case "FETUSDT":
            return bot.signal.side === OrderSide.BUY ? await FETUSDT.buy(bot.buy_state) : await FETUSDT.sell(bot.sell_state);
        case "LDOUSDT":
            return bot.signal.side === OrderSide.BUY ? await LDOUSDT.buy(bot.buy_state) : await LDOUSDT.sell(bot.sell_state);
        case "BTCUSDT":
            return bot.signal.side === OrderSide.BUY ? await BTCUSDT.buy(bot.buy_state) : await BTCUSDT.sell(bot.sell_state);
        case "AAVEUSDT":
            return bot.signal.side === OrderSide.BUY ? await AAVEUSDT.buy(bot.buy_state) : await AAVEUSDT.sell(bot.sell_state);
        case "API3USDT":
            return bot.signal.side === OrderSide.BUY ? await API3USDT.buy(bot.buy_state) : await API3USDT.sell(bot.sell_state);
        default:
            return true;
    }

}

export default symbolRuleMatches;