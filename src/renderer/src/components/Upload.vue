<script setup>
import { onMounted, ref } from 'vue'
// Import electron API from preload
const { ipcRenderer } = window.electron

const isDragging = ref(false)
const files = ref([])
const previewUrls = ref([])
const showUploadArea = ref(true)
const isProcessing = ref(false)
const processedFiles = ref([])

// Options for each file
const fileOptions = ref([])

// Handle files whether from drop or file picker
function handleFiles(eventFiles) {
  if (!eventFiles || eventFiles.length === 0) return

  // Convert FileList to array and store
  const fileArray = Array.from(eventFiles)
  files.value = [...files.value, ...fileArray]
  // console.log(fileArray[0]);
  // Generate preview URLs for images
  fileArray.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Create an image element to get dimensions
        const img = new Image()
        img.onload = () => {
          const index = previewUrls.value.length
          previewUrls.value.push({
            name: file.name,
            url: e.target.result,
            size: formatFileSize(file.size),
            type: file.type,
            resolution: `${img.width}×${img.height}`,
            originalWidth: img.width,
            originalHeight: img.height
          })

          // Initialize options for this file
          fileOptions.value.push({
            width: img.width,
            height: img.height,
            quality: 90,
            keepAspectRatio: true,
            format: getTargetFormat(file.type) // Default output format
          })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } else {
      // For non-image files, just add file info
      const index = previewUrls.value.length
      previewUrls.value.push({
        name: file.name,
        url: null,
        size: formatFileSize(file.size),
        type: file.type,
        resolution: 'N/A'
      })

      // Initialize options for this file
      fileOptions.value.push({
        width: null,
        height: null,
        quality: 90,
        keepAspectRatio: true,
        format: getTargetFormat(file.type) // Default output format
      })
    }
  })

  // Hide the upload area when files are present
  showUploadArea.value = false
}

// Get default target format based on input format
function getTargetFormat(mimeType) {
  // Default to webp for images
  if (mimeType.startsWith('image/')) {
    return 'webp'
  }
  // Keep original format for other file types
  return mimeType.split('/')[1]
}

// Toggle options popup for a file


// Update dimensions while maintaining aspect ratio
function updateDimensions(index, dimension, value) {
  const options = fileOptions.value[index]
  const preview = previewUrls.value[index]

  if (preview.url && options.keepAspectRatio) {
    const aspectRatio = preview.originalWidth / preview.originalHeight

    if (dimension === 'width') {
      options.width = parseInt(value) || 0
      options.height = Math.round(options.width / aspectRatio)
    } else {
      options.height = parseInt(value) || 0
      options.width = Math.round(options.height * aspectRatio)
    }
  } else {
    options[dimension] = parseInt(value) || 0
  }
}

// Format file size in KB, MB, etc.
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Handle file input change event
function onFilePicked(e) {
  handleFiles(e.target.files)
}
// Add with other refs at the top of the script
const fileInputRef = ref(null)

// Add the clickInput function
function clickInput() {
  fileInputRef.value?.click()
}
// Clear all files
function clearFiles() {
  files.value = []
  previewUrls.value = []
  fileOptions.value = []
  processedFiles.value = []
  // Show upload area again when all files are cleared
  showUploadArea.value = true
}

// Remove a specific file
function removeFile(index) {
  files.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
  fileOptions.value.splice(index, 1)


  // If no files remain, show upload area again
  if (files.value.length === 0) {
    showUploadArea.value = true
  }
}

// Show upload area again
function showUploader() {
  showUploadArea.value = true
}

// Process files using Sharp
async function processFiles() {
  if (files.value.length === 0) return
  isProcessing.value = true
  processedFiles.value = []

  try {
    // Ask user for save directory
    const savePath = await ipcRenderer.invoke('dialog:selectDirectory')

    if (!savePath) {
      isProcessing.value = false
      return // User cancelled
    }

    // Process each file one by one
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      const filepath = files.value[i].path
      const options = fileOptions.value[i]
      const preview = previewUrls.value[i]

      // Skip if not an image
      if (!file.type.startsWith('image/')) {
        processedFiles.value.push({
          name: file.name,
          success: false,
          message: 'Only image files can be processed'
        })
        continue
      }
      // console.log(filepath)
    // Send to main process for processing with Sharp
    const result = await ipcRenderer.invoke('process:image', {
      filepath, 
      name: file.name,
      options: {
        width: options.width,
        height: options.height,
        quality: options.quality,
        format: options.format
      },
      savePath
    });

      processedFiles.value.push({
        name: file.name,
        success: result.success,
        message: result.message,
        outputPath: result.outputPath
      })
    }
  } catch (error) {
    console.error('Error processing files:', error)
  } finally {
    isProcessing.value = false
  }
}

// process one 
async function processOne(){
  if(files.value.length === 0) return;
  isProcessing.value = true
  processedFiles.value = []
  try {
    
  } catch (error) {
    
  }finally{
    isProcessing.value = false
  }
}
onMounted(() => {
  const dropArea = document.querySelector('.drop-area')
  const folderIcon = document.querySelector('.folder-icon')
  const defPath = folderIcon.src

  // Handle hover effects
  dropArea.addEventListener('mouseover', () => {
    folderIcon.src = new URL('../assets/h-folder.svg', import.meta.url).href
  })

  dropArea.addEventListener('mouseleave', () => {
    if (!isDragging.value) {
      folderIcon.src = defPath
    }
  })

  // Prevent default behaviors
  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  })

  // Handle drag states
  ;['dragenter', 'dragover'].forEach((eventName) => {
    dropArea.addEventListener(eventName, () => {
      isDragging.value = true
      folderIcon.src = new URL('../assets/h-folder.svg', import.meta.url).href
      dropArea.classList.add('border-primary')
    })
  })

  ;['dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, () => {
      isDragging.value = false
      folderIcon.src = defPath
      dropArea.classList.remove('border-primary')
    })
  })

  // Handle drop
  dropArea.addEventListener('drop', (e) => {
    const droppedFiles = e.dataTransfer.files
    handleFiles(droppedFiles)
  })

  // Add click listener to handle closing popups
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <!-- Drop area - only show when no files or explicitly requested -->
     <input id="dropzone-file" type="file" ref="fileInputRef" class="hidden" @change="onFilePicked" multiple />
    <div v-if="showUploadArea" class="drop-area flex items-center justify-center min-h-screen">
      <label
        for="dropzone-file"
        class="flex flex-col items-center justify-center w-4/5 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
        :class="{ 'border-primary': isDragging }"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <img src="../assets/folder.svg" alt="folder" class="folder-icon size-24" />
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Files will be processed here</p>
        </div>
      </label>
    </div>

    <!-- File preview section -->
    <div v-if="files.length > 0" class="w-full">
      <div class="flex justify-between items-center mb-4">
<button
            @click="clickInput"
            class="btn btn-sm btn-outline btn-primary"
          ><img src="../assets/plus.svg" class="w-5 h-5">
            Add More Files
          </button>
        <div class="flex gap-2">
          
           
      <!-- Process button -->
        <button @click="processFiles" class="btn btn-primary btn-outline btn-sm" :disabled="isProcessing">
          <span v-if="isProcessing" class="loading loading-spinner"></span>
          {{ isProcessing ? 'Processing...' : 'Convert All' }}
        </button>
          <button @click="clearFiles" class="btn btn-sm btn-outline btn-error">Clear All</button>
        </div>
      </div>

      <!-- Tab group -->
       <!-- name of each tab group should be unique -->
<div class="tabs tabs-box">
  <input type="radio" name="my_tabs_6" class="tab" aria-label="Files" checked="checked"/>
  <div class="tab-content bg-base-100 border-base-300 p-6 max-h-[calc(100vh-9rem)] overflow-y-auto">
     <!-- File list -->
            <div
        v-for="(preview, index) in previewUrls"
        :key="index"
        class=" p-4 flex relative m-4 items-center gap-4 border-5 border-midnight rounded-lg hover:border-indigo-500"
      >
        <!-- Image preview -->
        <div class="flex-shrink-0">
          <img
            :src="preview.url"
            alt="preview"
            class="h-32 object-contain rounded"
            v-if="preview.url"
            :onclick="`document.getElementById('image_preview_${index}').showModal()`"
            />
          <div
            v-else
            class="bg-gray-600 h-32 w-32 rounded flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      <!-- Image preview modal -->

      <dialog :id="`image_preview_${index}`" class="modal">
    <div class="modal-box max-w-5xl bg-gray-800 p-0">
      <form method="dialog">
        <button class="btn btn-sm btn-circle absolute right-2 top-2 text-white">✕</button>
      </form>
      <figure>
        <img 
          :src="preview.url" 
          alt="preview"
          class="w-full h-full object-contain max-h-[80vh]"
        />
      </figure>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

        <!-- File info -->
        <div class="w-1/3 flex flex-col justify-between">
          <div class="text-sm text-gray-300 space-y-2">
            <div class="flex items-center gap-2">
              <img src="../assets/file.svg" class="w-5 h-5" alt="File Icon" />
              <p class="truncate" :title="preview.name">{{ preview.name }}</p>
            </div>
            <div v-if="preview.resolution" class="flex items-center gap-2">
              <img src="../assets/resolution.svg" class="w-4 h-4" alt="Resolution Icon" />
              <p>{{ preview.resolution }}</p>
            </div>
            <div class="flex items-center gap-2">
              <img src="../assets/filesize.svg" class="w-4 h-4" alt="File Size Icon" />
              <p>{{ preview.size }}</p>
            </div>
            <div class="flex items-center gap-2">
              <img src="../assets/filetype.svg" class="w-5 h-5" alt="File Type Icon" />
              <p>{{ preview.type }}</p>
            </div>
          </div>
          
        </div>
        <div class="flex items-start">
          <img src="../assets/arrow.svg" class="w-14 rotate-180">
        </div>
      <!-- convert file info's -->
      <div class="w-1/3 ml-12 flex flex-col text-xs text-gray-400 space-y-2">
  <div class="flex items-center gap-2">
    <img src="../assets/output.svg" class="w-5 h-5" alt="">
    <span>{{ fileOptions[index].format.toUpperCase() }}</span>
  </div>
  <div class="flex items-center gap-2" v-if="preview.url">
    <img src="../assets/resolution.svg" class="w-4 h-4" alt="">
    <span>{{ fileOptions[index].width }}×{{ fileOptions[index].height }}px</span>
  </div>
  <div class="flex items-center gap-2" v-if="preview.url">
    <img src="../assets/star.svg" class="w-5 h-5" alt="">
    <span>{{ fileOptions[index].quality }}%</span>
  </div>
</div>
        <!-- Buttons -->
        <div class="flex-shrink-0 flex flex-col gap-5 ml-auto">
          <button
            class="btn btn-sm btn-primary"
            :onclick="`document.getElementById('options_modal_${index}').showModal()`"

          >
            Options
          </button>
          <button
            class="btn btn-sm btn-primary"
            @click="processFiles"
          >
            Convert
          </button>
        </div>
        <!-- Open options popup-->
        <dialog :id="`options_modal_${index}`" class="modal">
          <div class="modal-box bg-gray-800">
            <form method="dialog">
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
            </form>
            <h3 class="font-bold text-lg text-gray-200 mb-4">Output Options</h3>
            
            <div class="space-y-3">
              <!-- Format selection -->
              <div class="form-control" v-if="preview.url">
                <label class="label p-0">
                  <span class="label-text text-xs text-gray-400">Format</span>
                </label>
                <select
                  v-model="fileOptions[index].format"
                  class="select select-sm select-bordered w-full bg-gray-700"
                >
                  <option value="webp">WebP</option>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="avif">AVIF</option>
                  <option value="gif">GIF</option>
                  <option value="jp2">JP2</option>
                  <option value="tiff">TIFF</option>
                  <option value="heif">HEIF</option>
                  <option value="jxl">JXL</option>
                  <option value="tile">Tile</option>
                  <option value="raw">Raw (base64)</option>
                </select>
              </div>
        
              <!-- Width input -->
              <div class="form-control">
                <label class="label p-0">
                  <span class="label-text text-xs text-gray-400">Width (px)</span>
                </label>
                <input
                  type="number"
                  v-model="fileOptions[index].width"
                  @input="(e) => updateDimensions(index, 'width', e.target.value)"
                  class="input input-sm input-bordered w-full bg-gray-700"
                  :disabled="!preview.url"
                />
              </div>
        
              <!-- Height input -->
              <div class="form-control">
                <label class="label p-0">
                  <span class="label-text text-xs text-gray-400">Height (px)</span>
                </label>
                <input
                  type="number"
                  v-model="fileOptions[index].height"
                  @input="(e) => updateDimensions(index, 'height', e.target.value)"
                  class="input input-sm input-bordered w-full bg-gray-700"
                  :disabled="!preview.url"
                />
              </div>
        
              <!-- Quality slider -->
              <div class="form-control">
                <label class="label p-0">
                  <span class="label-text text-xs text-gray-400"
                    >Quality: {{ fileOptions[index].quality }}%</span
                  >
                </label>
                <input
                  type="range"
                  v-model="fileOptions[index].quality"
                  min="1"
                  max="100"
                  class="range range-xs range-primary"
                  :disabled="!preview.url"
                />
              </div>
        
              <!-- Aspect ratio toggle -->
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-2 p-0">
                  <input
                    type="checkbox"
                    v-model="fileOptions[index].keepAspectRatio"
                    class="checkbox checkbox-xs checkbox-primary"
                    :disabled="!preview.url"
                  />
                  <span class="label-text text-xs text-gray-400">Maintain aspect ratio</span>
                </label>
              </div>
        
              <!-- Reset,Save buttons -->
              <div class="flex justify-end space-x-3">
                   <button
                  :onclick="`document.getElementById('close-modal${index}').click()`"
                  class="btn btn-xs btn-outline btn-success"
                  :disabled="!preview.url"
                >
                  Save
                </button> 
                <button
                  @click="
                    fileOptions[index] = {
                      width: preview.originalWidth,
                      height: preview.originalHeight,
                      quality: 90,
                      keepAspectRatio: true,
                      format: getTargetFormat(preview.type)
                    }
                  "
                  class="btn btn-xs btn-outline btn-warning"
                  :disabled="!preview.url"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button :id="`close-modal${index}`">close</button>
          </form>
        </dialog>

        
        <div
            v-if="processedFiles[index]"
            class="absolute inset-0 bg-gray-800 bg-opacity-80 rounded-lg flex flex-col items-center justify-center"
          >
            <div v-if="processedFiles[index].success" class="text-success mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p class="text-sm mt-1">Successfully processed</p>
            </div>
            <div v-else class="text-error mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p class="text-sm mt-1">{{ processedFiles[index].message }}</p>
            </div>
          </div>
      </div>
  </div>

  <input type="radio" name="my_tabs_6" class="tab" aria-label="Completed"  />
  <div class="indicator">
  <span class="indicator-item badge badge-secondary">{{files.length}}</span>
</div>
  <div class="tab-content bg-base-100 border-base-300 p-6 max-h-[calc(100vh-9rem)]">
     <!-- Results summary -->
      <div v-if="processedFiles.length > 0" class="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-medium text-gray-200 mb-3">Results</h3>
        <ul class="space-y-2">
          <li
            v-for="(result, index) in processedFiles"
            :key="index"
            class="flex items-center gap-2"
          >
            <span v-if="result.success" class="text-success">✓</span>
            <span v-else class="text-error">✗</span>
            <span class="text-gray-300">{{ result.name }}</span>
            <span v-if="result.success" class="text-xs text-gray-400"
              >→ {{ result.outputPath }}</span
            >
          </li>
        </ul>
      </div>
    </div>
</div>
    </div>
  </div>
</template>