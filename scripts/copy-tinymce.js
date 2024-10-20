import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'node_modules', 'tinymce');
const targetDir = path.join(__dirname, '..', 'public', 'tinymce');

fs.ensureDirSync(targetDir);
fs.copySync(path.join(sourceDir, 'tinymce.min.js'), path.join(targetDir, 'tinymce.min.js'));
fs.copySync(path.join(sourceDir, 'themes'), path.join(targetDir, 'themes'));
fs.copySync(path.join(sourceDir, 'skins'), path.join(targetDir, 'skins'));
fs.copySync(path.join(sourceDir, 'icons'), path.join(targetDir, 'icons'));
fs.copySync(path.join(sourceDir, 'plugins'), path.join(targetDir, 'plugins'));

console.log('TinyMCE files copied successfully!');