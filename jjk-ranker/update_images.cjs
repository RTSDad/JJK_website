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
  
  // Extract all URLs from the line (splitting by commas doesn't matter if we just match http)
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
  else if (namePart === 'inumaki') matchName = 'Toge Inumaki';
  else if (namePart === 'todo') matchName = 'Aoi Todo';
  else if (namePart === 'kechizu') matchName = 'Kechizu';
  else if (namePart === 'choso') matchName = 'Choso';
  else if (namePart === 'yuta') matchName = 'Yuta Okkotsu';
  else if (namePart === 'eso') matchName = 'Eso';
  else if (namePart === 'rika') matchName = 'Rika Orimoto';
  else if (namePart === 'hanami') matchName = 'Hanami';
  else if (namePart === 'dagon') matchName = 'Dagon';
  else if (namePart === 'panda') matchName = 'Panda';
  else if (namePart === 'mahito') matchName = 'Mahito';
  else if (namePart === 'maki') matchName = 'Maki Zenin';
  else if (namePart === 'hakari') matchName = 'Kinji Hakari';
  else if (namePart === 'kashimo') matchName = 'Hajime Kashimo';
  else if (namePart === 'mechamaru') matchName = 'Ultimate Mechamaru';
  else if (namePart === 'huguruma') matchName = 'Hiromi Higuruma';
  else if (namePart === 'kamo') matchName = 'Noritoshi Kamo';
  else if (namePart === 'momo') matchName = 'Momo Nishimiya';
  else if (namePart === 'miwa') matchName = 'Kasumi Miwa';

  if (matchName && urls.length > 0) {
    updates[matchName] = {
      image: urls[0],
      gallery: urls
    };
  }
}

let charContent = fs.readFileSync(charPath, 'utf8');
let jsonStr = charContent.replace('export const characters = ', '').trim();
if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1);
}

const characters = JSON.parse(jsonStr);

// Find max ID so we don't duplicate when appending
let nextId = Math.max(...characters.map(c => c.id)) + 1;

Object.keys(updates).forEach(name => {
  const existing = characters.find(c => c.name === name);
  if (existing) {
    existing.image = updates[name].image;
    existing.gallery = updates[name].gallery;
  } else {
    // Append completely new characters!
    characters.push({
      id: nextId++,
      name: name,
      tag: name.toLowerCase().replace(/ /g, '_'),
      description: `A powerful combatant in the Jujutsu Kaisen universe.`,
      narrative: `More information about ${name} will be added soon.`,
      image: updates[name].image,
      gallery: updates[name].gallery,
      votes: 0
    });
  }
});

const newContent = 'export const characters = ' + JSON.stringify(characters, null, 2) + ';\n';
fs.writeFileSync(charPath, newContent, 'utf8');
console.log("Updated images and added completely new characters successfully!");
