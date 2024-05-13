module.exports = {
    "up": "ALTER TABLE `apis` ADD COLUMN `telegram_user_id` VARCHAR(255) DEFAULT NULL, ADD `telegram_chat_id` VARCHAR(255) DEFAULT NULL;",
    "down": "ALTER TABLE `apis` DROP COLUMN `telegram_id`, `telegram_chat_id` ;"
}