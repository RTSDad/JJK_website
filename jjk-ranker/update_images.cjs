const fs = require('fs');

const csvPath = 'c:/Users/oxili/OneDrive/Documents/JJK_website/jjk-ranker/JJK Characters - Sheet1.csv';
const charPath = 'c:/Users/oxili/OneDrive/Documents/JJK_website/jjk-ranker/src/data/characters.js';

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);

const updates = {};
for (let i = 1; i < lines.length; i++) {
  const rawLine = lines[i];
  const namePart = rawLine.split(',')[0].trim().toLowerCase();
  
  if (!namePart) continue;
  
  // Extract all URLs from the line
  const urls = rawLine.split(',').map(p => p.trim()).filter(p => p.startsWith('http'));

  let matchName = '';
  if (namePart === 'gojo') matchName = 'Satoru Gojo';
  else if (namePart === 'yuji') matchName = 'Yuji Itadori';
  else if (namePart === 'sukuna') matchName = 'Ryomen Sukuna';
  else if (namePart === 'megumi') matchName = 'Megumi Fushiguro';
  else if (namePart === 'jogo') matchName = 'Jogo';
  else if (namePart === 'nobara') matchName = 'Nobara Kugisaki';
  else if (namePart === 'nanami') matchName = 'Kento Nanami';
  else if (namePart === 'toji') matchName = 'Toji Fushiguro';
  else if (namePart === 'geto') matchName = 'Suguru Geto';

  if (matchName && urls.length > 0) {
    updates[matchName] = {
      image: urls[0],   // First URL as the primary image
      gallery: urls     // All URLs as the gallery
    };
  }
}

let charContent = fs.readFileSync(charPath, 'utf8');
let jsonStr = charContent.replace('export const characters = ', '').trim();
if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1);
}

const characters = JSON.parse(jsonStr);

characters.forEach(char => {
  if (updates[char.name]) {
    char.image = updates[char.name].image;
    char.gallery = updates[char.name].gallery;
  }
});

const newContent = 'export const characters = ' + JSON.stringify(characters, null, 2) + ';\n';
fs.writeFileSync(charPath, newContent, 'utf8');
console.log("Updated images successfully!");
