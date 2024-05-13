export const TEST_MODE = true;

export const API_KEY_QUERY = "SELECT `api`.`id` AS `id`, `api`.`exchange` AS `exchange`, `api`.`testnet` AS `testnet`, `api`.`public_key` AS `public_key`, `api`.`private_key` AS `private_key`, `api`.`extra` AS `extra`, `api`.`telegram_chat_id` AS `telegram_chat_id`, `api`.`telegram_user_id` AS `telegram_user_id` " +
                                                    "FROM `apis` AS `api` " +
                                                    "WHERE " +
                                                    "`api`.`status` = 'ACTIVE' AND " +
                                                    "`api`.`exchange` = ? AND " +
                                                    "`api`.`testnet` = ? AND " +
                                                    "`api`.`telegram_user_id` = ? "
                                                    ;
export const SIGNAL_BOT_BY_SYMBOL_QUERY = "SELECT `ss`.`quote_amount` AS `quote_amount`, `ss`.`leverage` AS `leverage`, `ss`.`initial_capital` AS `initial_capital`," +
                                                "`st`.`buy_state` AS `buy_state`, `st`.`sell_state` AS `sell_state`, " +
                                                "`api`.`id` AS `api_id`, `api`.`exchange` AS `exchange`, `api`.`testnet` AS `testnet`, `api`.`public_key` AS `public_key`, `api`.`private_key` AS `private_key`, `api`.`extra` AS `extra` " +
                                                "FROM `symbol_settings` AS `ss` " +
                                                "LEFT JOIN `symbol_states` AS `st` ON `ss`.`api_id` = `st`.`id` AND `ss`.`symbol` = `st`.`symbol` " +
                                                "LEFT JOIN `apis` AS `api` ON `ss`.`api_id` = `api`.`id` " +
                                                "WHERE " +
                                                    "`api`.`status` = 'ACTIVE' AND " +
                                                    "`api`.`exchange` = ? AND " +
                                                    "`api`.`testnet` = ? AND " +
                                                    "`ss`.`symbol` = ? AND " +
                                                    "`ss`.`status` = 'ACTIVE'"
                                                    ;