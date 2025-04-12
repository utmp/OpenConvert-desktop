<script setup>
import { onMounted } from 'vue';
function onFilePicked (e){
    const files = e.target.files
    console.log(files)
}
onMounted(()=>{
    const dropArea = document.querySelector('.drop-area');
    const folderIcon = dropArea.querySelector('img')
    const defPath = folderIcon.src;
    dropArea.addEventListener('mouseover',(e)=>{
        folderIcon.src = new URL('../assets/h-folder.svg', import.meta.url).href;
    })
    dropArea.addEventListener('mouseleave',(e)=>{
        folderIcon.src = defPath;
    })
})

</script>
<template>
<div class="drop-area icons flex items-center justify-center w-full h-full">
    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
           <img src="../assets/folder.svg" alt="">
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
        </div>
        <input id="dropzone-file" type="file" class="hidden" @change="onFilePicked"/>
    </label>
</div> 
</template>