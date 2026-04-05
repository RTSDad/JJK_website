const fs = require('fs');
const charPath = 'c:/Users/oxili/OneDrive/Documents/JJK_website/jjk-ranker/src/data/characters.js';

let charContent = fs.readFileSync(charPath, 'utf8');
let jsonStr = charContent.replace('export const characters = ', '').trim();
if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1);
}

const characters = JSON.parse(jsonStr);

characters.forEach(char => {
  char.votes = 0;
});

const newContent = 'export const characters = ' + JSON.stringify(characters, null, 2) + ';\n';
fs.writeFileSync(charPath, newContent, 'utf8');
console.log("Reset all votes to 0!");
