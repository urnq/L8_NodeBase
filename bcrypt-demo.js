const bcrypt = require('bcrypt');

async function hashPasswords() {
    const passwords = [];
    for (let i = 1; i <= 13; i++) {
        passwords.push(`password${i}`);
    }

    console.log('Начинаем хеширование 13 паролей...');
    for (let i = 0; i < passwords.length; i++) {
        const start = Date.now();
        const hash = await bcrypt.hash(passwords[i], 10); 
        const end = Date.now();
        const time = end - start;
        console.log(`Пароль ${i+1} захеширован за ${time}мс`);
    }
    console.log('\nВывод: Время хеширования может варьироваться. bcrypt специально разработан так, чтобы быть медленным (это защита от брутфорса). Параметр "salt rounds" (10) задает количество итераций (2^10 = 1024 итерации), что напрямую влияет на время выполнения. Первые хеши могут быть медленнее из-за инициализации модуля.бла бла бла');
}

hashPasswords();