const sqlite3 = require('sqlite3').verbose();
const fs = require("node:fs");
const path = require('node:path')
function writeData(datatime,fileSize,filename,fileDir){
    //create data.db if not exists
    if(!fs.existsSync(path.join(__dirname,'data.db'))){fs.writeFileSync("data.db",'')}
    const db = new sqlite3.Database('data.db',(err)=>{
        if(err){console.log(err)}
    })
    //create table if its not exists
    
    db.run(`CREATE TABLE IF NOT EXISTS temp
(
    "file-id"            integer
        constraint temp_pk
            primary key autoincrement,
    datatime             TEXT not null,
    fileSize          integer not null,
    filename             TEXT    not null,
    fileDir TEXT not null
);
`,(err)=>{if(err){console.log(err)}})
    db.run(`INSERT INTO temp(datatime,fileSize,filename,fileDir) VALUES('${datatime}',${fileSize},'${filename}','${fileDir}')`)
    db.close()
}
module.exports = {writeData};