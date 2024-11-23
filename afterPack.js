// afterUnpack.js
const { exec } = require('child_process');
const path = require('path');

module.exports = async (ctx) => {
    
  const filePath = path.join(`./dist/nsis-web`);
  exec(`mv custom.nsi ${filePath}`)
 console.error("Dont use default executable in nsis-web folder. If you want to use web installer compile custom installer scrtip which is located nsis-web/custom.nsi")
};