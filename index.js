require('dotenv').config(); 

console.log('Информация из .env файла:');
console.log('Имя:', process.env.MY_NAME);
console.log('Фамилия:', process.env.MY_SURNAME);
console.log('Группа:', process.env.MY_GROUP);
console.log('Номер по списку:', process.env.MY_LIST_NUMBER);
console.log('Режим доступа:', process.env.MODE);