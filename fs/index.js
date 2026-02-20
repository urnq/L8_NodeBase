const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

async function ensureDirectoryExistenceAsync(filePath) {
    const dirname = path.dirname(filePath);
    try {
        await fsPromises.access(dirname);
        return true;
    } catch {
        await fsPromises.mkdir(dirname, { recursive: true });
        return true;
    }
}

const sync = {
    writeFile: (filePath, data) => {
        try {
            ensureDirectoryExistence(filePath);
            fs.writeFileSync(filePath, data, 'utf8');
            console.log(`[Sync] Файл ${filePath} успешно записан.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка записи файла ${filePath}:`, err.message);
            return false;
        }
    },

    readFile: (filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`[Sync] Файл ${filePath} не существует.`);
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf8');
            console.log(`[Sync] Файл ${filePath} успешно прочитан.`);
            return data;
        } catch (err) {
            console.error(`[Sync] Ошибка чтения файла ${filePath}:`, err.message);
            return null;
        }
    },

    updateFile: (filePath, newData) => {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`[Sync] Файл ${filePath} не существует. Создание нового файла.`);
            }
            return sync.writeFile(filePath, newData);
        } catch (err) {
            console.error(`[Sync] Ошибка обновления файла ${filePath}:`, err.message);
            return false;
        }
    },

    deleteFile: (filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`[Sync] Файл ${filePath} не существует, удаление не требуется.`);
                return false;
            }
            fs.unlinkSync(filePath);
            console.log(`[Sync] Файл ${filePath} успешно удален.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка удаления файла ${filePath}:`, err.message);
            return false;
        }
    },

    cleanFile: (filePath) => {
        try {
            const content = sync.readFile(filePath);
            if (!content) {
                console.log(`[Sync] Не удалось очистить файл ${filePath} - файл не найден или пуст.`);
                return false;
            }
            
            const cleanedContent = content.replace(/[0-9]/g, '').toLowerCase();
            
            sync.writeFile(filePath, cleanedContent);
            console.log(`[Sync] Файл ${filePath} успешно очищен от шума.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка очистки файла ${filePath}:`, err.message);
            return false;
        }
    },

    copyFile: (sourcePath, destPath) => {
        try {
            if (!fs.existsSync(sourcePath)) {
                console.log(`[Sync] Исходный файл ${sourcePath} не найден.`);
                return false;
            }
            
            ensureDirectoryExistence(destPath);
            fs.copyFileSync(sourcePath, destPath);
            console.log(`[Sync] Файл успешно скопирован из ${sourcePath} в ${destPath}.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка копирования файла:`, err.message);
            return false;
        }
    },

    createDirectory: (dirPath) => {
        try {
            if (fs.existsSync(dirPath)) {
                console.log(`[Sync] Директория ${dirPath} уже существует.`);
                return true;
            }
            
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`[Sync] Директория ${dirPath} успешно создана.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка создания директории ${dirPath}:`, err.message);
            return false;
        }
    },

    deleteDirectory: (dirPath) => {
        try {
            if (!fs.existsSync(dirPath)) {
                console.log(`[Sync] Директория ${dirPath} не существует.`);
                return false;
            }
            
            const files = fs.readdirSync(dirPath);
            if (files.length > 0) {
                console.log(`[Sync] Директория ${dirPath} не пуста. Удаление отменено.`);
                return false;
            }
            
            fs.rmdirSync(dirPath);
            console.log(`[Sync] Директория ${dirPath} успешно удалена.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка удаления директории ${dirPath}:`, err.message);
            return false;
        }
    },

    deleteDirectoryRecursive: (dirPath) => {
        try {
            if (!fs.existsSync(dirPath)) {
                console.log(`[Sync] Директория ${dirPath} не существует.`);
                return false;
            }
            
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`[Sync] Директория ${dirPath} и всё её содержимое успешно удалены.`);
            return true;
        } catch (err) {
            console.error(`[Sync] Ошибка рекурсивного удаления директории ${dirPath}:`, err.message);
            return false;
        }
    },

    getAllFiles: (dirPath = '.', arrayOfFiles = [], ignorePatterns = ['node_modules', '.git', '.env']) => {
        try {
            const files = fs.readdirSync(dirPath);
            
            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                
                if (ignorePatterns.some(pattern => fullPath.includes(pattern))) {
                    return;
                }
                
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    sync.getAllFiles(fullPath, arrayOfFiles, ignorePatterns);
                } else {
                    arrayOfFiles.push(fullPath);
                }
            });
            
            return arrayOfFiles;
        } catch (err) {
            console.error(`[Sync] Ошибка получения списка файлов:`, err.message);
            return [];
        }
    },

    cleanProject: (dirPath = '.', protectPatterns = ['node_modules', '.git', '.env', '.gitignore']) => {
        try {
            console.warn('[Sync] Функция cleanProject запущена. Назад дороги нет!');
            
            const files = fs.readdirSync(dirPath);
            let deletedCount = 0;
            let skippedCount = 0;
            
            files.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                
                if (protectPatterns.some(pattern => fullPath.includes(pattern) || file === pattern)) {
                    console.log(`[Sync] Защищенный элемент пропущен: ${file}`);
                    skippedCount++;
                    return;
                }
                
                const stat = fs.statSync(fullPath);
                
                try {
                    if (stat.isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        console.log(`[Sync] Удалена директория: ${fullPath}`);
                    } else {
                        fs.unlinkSync(fullPath);
                        console.log(`[Sync] Удален файл: ${fullPath}`);
                    }
                    deletedCount++;
                } catch (err) {
                    console.error(`[Sync] Ошибка удаления ${fullPath}:`, err.message);
                }
            });
            
            console.log(`[Sync] Очистка проекта завершена. Удалено: ${deletedCount}, пропущено (защищено): ${skippedCount}`);
            return { deleted: deletedCount, skipped: skippedCount };
        } catch (err) {
            console.error(`[Sync] Ошибка очистки проекта:`, err.message);
            return { deleted: 0, skipped: 0, error: err.message };
        }
    }
};

const async = {
    writeFile: async (filePath, data) => {
        try {
            await ensureDirectoryExistenceAsync(filePath);
            await fsPromises.writeFile(filePath, data, 'utf8');
            console.log(`[Async] Файл ${filePath} успешно записан.`);
            return true;
        } catch (err) {
            console.error(`[Async] Ошибка записи файла ${filePath}:`, err.message);
            return false;
        }
    },

    readFile: async (filePath) => {
        try {
            await fsPromises.access(filePath);
            const data = await fsPromises.readFile(filePath, 'utf8');
            console.log(`[Async] Файл ${filePath} успешно прочитан.`);
            return data;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[Async] Файл ${filePath} не существует.`);
            } else {
                console.error(`[Async] Ошибка чтения файла ${filePath}:`, err.message);
            }
            return null;
        }
    },

    updateFile: async (filePath, newData) => {
        try {
            try {
                await fsPromises.access(filePath);
            } catch {
                console.log(`[Async] Файл ${filePath} не существует. Будет создан новый.`);
            }
            
            return await async.writeFile(filePath, newData);
        } catch (err) {
            console.error(`[Async] Ошибка обновления файла ${filePath}:`, err.message);
            return false;
        }
    },

    deleteFile: async (filePath) => {
        try {
            await fsPromises.access(filePath);
            await fsPromises.unlink(filePath);
            console.log(`[Async] Файл ${filePath} успешно удален.`);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[Async] Файл ${filePath} не существует, удаление не требуется.`);
            } else {
                console.error(`[Async] Ошибка удаления файла ${filePath}:`, err.message);
            }
            return false;
        }
    },


    cleanFile: async (filePath) => {
        try {
            const content = await async.readFile(filePath);
            if (!content) {
                console.log(`[Async] Не удалось очистить файл ${filePath} - файл не найден или пуст.`);
                return false;
            }
            
            const cleanedContent = content.replace(/[0-9]/g, '').toLowerCase();
            
            return await async.writeFile(filePath, cleanedContent);
        } catch (err) {
            console.error(`[Async] Ошибка очистки файла ${filePath}:`, err.message);
            return false;
        }
    },

    copyFile: async (sourcePath, destPath) => {
        try {
            await fsPromises.access(sourcePath);
            await ensureDirectoryExistenceAsync(destPath);
            await fsPromises.copyFile(sourcePath, destPath);
            console.log(`[Async] Файл успешно скопирован из ${sourcePath} в ${destPath}.`);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[Async] Исходный файл ${sourcePath} не найден.`);
            } else {
                console.error(`[Async] Ошибка копирования файла:`, err.message);
            }
            return false;
        }
    },

    createDirectory: async (dirPath) => {
        try {
            await fsPromises.mkdir(dirPath, { recursive: true });
            console.log(`[Async] Директория ${dirPath} успешно создана (или уже существует).`);
            return true;
        } catch (err) {
            console.error(`[Async] Ошибка создания директории ${dirPath}:`, err.message);
            return false;
        }
    },

    deleteDirectory: async (dirPath) => {
        try {
            await fsPromises.access(dirPath);
            
            const files = await fsPromises.readdir(dirPath);
            if (files.length > 0) {
                console.log(`[Async] Директория ${dirPath} не пуста. Удаление отменено.`);
                return false;
            }
            
            await fsPromises.rmdir(dirPath);
            console.log(`[Async] Директория ${dirPath} успешно удалена.`);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[Async] Директория ${dirPath} не существует.`);
            } else {
                console.error(`[Async] Ошибка удаления директории ${dirPath}:`, err.message);
            }
            return false;
        }
    },

    deleteDirectoryRecursive: async (dirPath) => {
        try {
            await fsPromises.access(dirPath);
            await fsPromises.rm(dirPath, { recursive: true, force: true });
            console.log(`[Async] Директория ${dirPath} и всё её содержимое успешно удалены.`);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[Async] Директория ${dirPath} не существует.`);
            } else {
                console.error(`[Async] Ошибка рекурсивного удаления директории ${dirPath}:`, err.message);
            }
            return false;
        }
    },

    getAllFiles: async (dirPath = '.', arrayOfFiles = [], ignorePatterns = ['node_modules', '.git', '.env']) => {
        try {
            const files = await fsPromises.readdir(dirPath);
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file);
                
                if (ignorePatterns.some(pattern => fullPath.includes(pattern))) {
                    continue;
                }
                
                const stat = await fsPromises.stat(fullPath);
                
                if (stat.isDirectory()) {

                    await async.getAllFiles(fullPath, arrayOfFiles, ignorePatterns);
                } else {
                    arrayOfFiles.push(fullPath);
                }
            }
            
            return arrayOfFiles;
        } catch (err) {
            console.error(`[Async] Ошибка получения списка файлов:`, err.message);
            return [];
        }
    },

    cleanProject: async (dirPath = '.', protectPatterns = ['node_modules', '.git', '.env', '.gitignore']) => {
        try {
            console.warn('[Async] Функция cleanProject запущена. Назад дороги нет!');
            
            const files = await fsPromises.readdir(dirPath);
            let deletedCount = 0;
            let skippedCount = 0;
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file);

                if (protectPatterns.some(pattern => fullPath.includes(pattern) || file === pattern)) {
                    console.log(`[Async] Защищенный элемент пропущен: ${file}`);
                    skippedCount++;
                    continue;
                }
                
                const stat = await fsPromises.stat(fullPath);
                
                try {
                    if (stat.isDirectory()) {
                        await fsPromises.rm(fullPath, { recursive: true, force: true });
                        console.log(`[Async] Удалена директория: ${fullPath}`);
                    } else {
                        await fsPromises.unlink(fullPath);
                        console.log(`[Async] Удален файл: ${fullPath}`);
                    }
                    deletedCount++;
                } catch (err) {
                    console.error(`[Async] Ошибка удаления ${fullPath}:`, err.message);
                }
            }
            
            console.log(`[Async] Очистка проекта завершена. Удалено: ${deletedCount}, пропущено (защищено): ${skippedCount}`);
            return { deleted: deletedCount, skipped: skippedCount };
        } catch (err) {
            console.error(`[Async] Ошибка очистки проекта:`, err.message);
            return { deleted: 0, skipped: 0, error: err.message };
        }
    }
};

module.exports = {
    sync,
    async
};