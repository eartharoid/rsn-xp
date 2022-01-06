-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(19) NOT NULL,
    `currentMessages` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `currentPoints` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `currentVoiceTime` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `level` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `totalMessages` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `totalPoints` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `totalVoiceTime` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;