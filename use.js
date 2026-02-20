require('dotenv').config(); 
const sortStrings = require('./modules/sortModule');
const fetchData = require('./modules/fetchModule');
const fileModule = require('./modules/fileModule');
const path = require('path');

async function main() {
    console.log('1. Загрузка пользователей...');
    const result = await fetchData('https://jsonplaceholder.typicode.com/users');

    if (result.error) {
        console.error('Ошибка загрузки:', result.error);
        return;
    }

    const users = result.data;
    console.log(`Загружено ${users.length} пользователей.`);

    const userNames = users.map(user => user.name);
    const sortedNames = sortStrings(userNames);
    console.log('2. Отсортированные имена (без учета пробелов):', sortedNames);

    const usersDir = path.join(__dirname, 'users');
    const namesFilePath = path.join(usersDir, 'names.txt');
    const emailsFilePath = path.join(usersDir, 'emails.txt');

    console.log('3. Создание структуры папок и файлов...');
    fileModule.sync.createDirectory(usersDir);

    const namesData = users.map(user => user.name).join('\n');
    fileModule.sync.writeFile(namesFilePath, namesData);

    const emailsData = users.map(user => user.email).join('\n');
    fileModule.sync.writeFile(emailsFilePath, emailsData);

    console.log('Готово! Проверьте папку "users".');
}

main();