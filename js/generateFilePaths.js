//getting file paths=========================
const fs = require('fs');
const path = require('path');
const folderPath = './playlist/';
const allowedExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.aac'];
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  const audioFiles = files.filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()));
  const filePaths = audioFiles.map(file => path.join(folderPath, file));
  fs.writeFile('filePaths.json', JSON.stringify(filePaths, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Audio file paths saved to filePaths.json');
    }
  });
});
