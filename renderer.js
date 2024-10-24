const dropArea = document.querySelector('.drag-area');
const dragText = document.querySelector('.header');
let input = dropArea.querySelector('input');
const convertButton = document.querySelector('.convert-all');
const converted_Total = document.querySelector('.converted-total')
const convertOptions = document.querySelector('.convert-options');
const imageLog = document.querySelector('.imageLog');
const history = document.getElementById('show-history');
const settingsButton = document.getElementById('settings-button');
const displayInfo = document.getElementById('display-file-info');
displayInfo.innerHTML = '';
//you can manually add if you know output format is supported by ffmpeg or other converters\\ 
const supportedFiles = ["png","webp","jxl","avif","tiff","jpg","bmp","gif","mkv","mov","mp4","aac","webm","avi","3gp","mp3","mp4a","wav"]
let convertFileExtension;
function showSection(section) {
  const sections = document.querySelectorAll('.section');
  sections.forEach((el) => {
      el.style.display = 'none';
  });
  document.getElementById(section).style.display = 'block';
}

showSection('home');
//check file input\\
function checkInput(){
  if(input.files[0].type.split('/')[0] === "image"){
    loadImageConvertion(convertFileExtension)
  }
  else if(input.files[0].type.split('/')[0] === "video"){
    loadVideoConvertion(convertFileExtension)
  }else if(input.files[0].type.split('/')[0] === "audio"){
    loadAudioConvertion(convertFileExtension)
  }
}
function loadVideoConvertion(fileExtension){
  const fileLength = input.files.length
  for(i=0;i<input.files.length;i++){
    const videopath = webutils.showFilePath(input.files[i])
    const filename = input.files[i].name.split('.')[0]
    const filesize = input.files[i].size
    convertvideo.video({videopath,filename,filesize,fileExtension,fileLength});
  }  
}
function loadAudioConvertion(fileExtension){
  const fileLength = input.files.length
  for(i=0;i<input.files.length;i++){
    const audiopath = webutils.showFilePath(input.files[i])
    const filename = input.files[i].name.split('.')[0]
    const filesize = input.files[i].size
    convertaudio.audio({audiopath,filename,filesize,fileExtension,fileLength})
  }
}
const container = document.querySelector('.container')
let file;
// when browse\\
input.addEventListener('change', function () {
container.style.display = 'none';
dropArea.classList.add('active');
displayFileInfo(input);
});
dropArea.addEventListener('mouseover', (event) => {
const icon = dropArea.querySelector('.png');
icon.src = 'icons/archive.png';
});

dropArea.addEventListener('mouseleave', (event) => {
const icon = dropArea.querySelector('.png');
icon.src = 'icons/folder.png'; 
});
dropArea.addEventListener('dragover', (event) => {
event.preventDefault();
dropArea.classList.add('active');
dragText.textContent = 'Release to Upload';
});

// when file leave the drag area\\
dropArea.addEventListener('dragleave', () => {
dropArea.classList.remove('active');
dragText.textContent = 'Drag & Drop';
});
dropArea.addEventListener('click',()=>{
  input.click();
})
// when file is dropped\\
dropArea.addEventListener('drop', (event) => {
event.preventDefault();
container.style.display='none';
const inputFiles = event.dataTransfer.files;
const dataTransfer = new DataTransfer();
for(i=0;i<inputFiles.length;i++){
  dataTransfer.items.add(inputFiles[i]);
}
input.files = dataTransfer.files;
displayFileInfo(input);
});

function loadImageConvertion(fileExtension){
  const fileLength = input.files.length
  for(i=0;i<input.files.length;i++){
    const imagepth = webutils.showFilePath(input.files[i])
    const filename = input.files[i].name.split('.')[0]
    const filesize = input.files[i].size
    ipcRenderer.send({imagepth,filename,fileLength,filesize,fileExtension});
  }  
}
function displayFileInfo(fileList){
  for(i=0;i<fileList.files.length;i++){
    const fileName = fileList.files[i].name
    const fileSize = fileList.files[i].size
    const div = document.createElement('div')
    div.className = 'display-info';
    div.textContent = `${i+1}: ${fileName}, ${fileSize}b`;
    displayInfo.appendChild(div);
  }
}

//open settings menu \\
settingsButton.addEventListener('click',()=>{
  settings.settings()
})

convertButton.addEventListener('click',()=>{
  const inputFiles = input.files
  console.log(inputFiles)
  if(inputFiles.length == 0 || convertFileExtension == undefined){
    alert("choose file")
  }
  if(inputFiles.length > 9){
    alert('Oh you can\'t upload files more than 9')
    return;
  }
  /*
  Check file extension
  Logically that code take first selected file and extension 
  and then check others to they have same or not
  */ 
  const extension = Array.from(inputFiles).map(file=>file.name.split('.').pop().toLocaleLowerCase());
  const firstExtension = extension[0]
  if(!extension.every(ext=> ext === firstExtension)){
    alert("Oh you look like upload mixed files")
    return;
  }
  convertButton.addEventListener('click',checkInput())
  
})

//convertOptions\\
const wrapper = document.querySelector(".wrapper"),
selectBtn = wrapper.querySelector(".select-btn"),
searchInp = wrapper.querySelector("input"),
options = wrapper.querySelector(".options");

function addSelectedFileExt(selectedFile) {
    options.innerHTML = "";
    supportedFiles.forEach(files => {
        let isSelected = files == selectedFile ? "selected" : "";
        let li = `<li onclick="updateName(this)" class="${isSelected}">${files}</li>`;
        options.insertAdjacentHTML("beforeend", li);
        convertFileExtension = selectedFile;
    });
}
addSelectedFileExt();

function updateName(selectedLi) {
    searchInp.value = "";
    addSelectedFileExt(selectedLi.innerText);
    //console.log(selectedLi.textContent)//output png, jpg or whatever you select
    wrapper.classList.remove("active");
    selectBtn.firstElementChild.innerText = selectedLi.innerText;
}

searchInp.addEventListener("keyup", () => {
    let arr = [];
    let searchWord = searchInp.value.toLowerCase();
    arr = supportedFiles.filter(data => {
        return data.toLowerCase().startsWith(searchWord);
    }).map(data => {
        let isSelected = data == selectBtn.firstElementChild.innerText ? "selected" : "";
        return `<li onclick="updateName(this)" class="${isSelected}">${data}</li>`;
    }).join("");
    options.innerHTML = arr ? arr : `<p style="margin-top: 10px;">Oops! not found</p>`;
});

selectBtn.addEventListener("click", () => wrapper.classList.toggle("active"));
// byte 2 Mb
function byte2Mb(byte){
  return (byte/(1024*1024)).toFixed(2)
}
const total = convertedTotal.getTotal()
let id = convertedTotal.getId()
converted_Total.innerHTML = `You're alrady converted <b>${id}files</b>  with total size of <b>${byte2Mb(total)}mb</b>`
