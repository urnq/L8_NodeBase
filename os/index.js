
const os = require('os');

function getBasicOSInfo() {
    console.log('--- Основная информация об ОС ---');
    console.log('Платформа:', os.platform());
    console.log('Свободная память:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
    console.log('Главная директория:', os.homedir());
    console.log('Имя хоста:', os.hostname());
    console.log('Сетевые интерфейсы:', os.networkInterfaces());
    console.log('-----------------------------------');
}

function isFreeMemoryMoreThan4GB() {
    const freeMemGB = os.freemem() / 1024 / 1024 / 1024;
    const isMore = freeMemGB > 4;
    console.log(`Свободной памяти (${freeMemGB.toFixed(2)} GB) больше 4GB?`, isMore);
    return isMore;
}

function getOSInfoByMode(modeFromEnv) {
    console.log(`Попытка доступа. Режим из .env: ${modeFromEnv}`);
    if (modeFromEnv === 'admin') {
        console.log('Доступ разрешен (admin).');
        getBasicOSInfo();
    } else {
        console.log('Доступ запрещен. Требуется режим admin.');
    }
}


module.exports = {
    getBasicOSInfo,
    isFreeMemoryMoreThan4GB,
    getOSInfoByMode
};