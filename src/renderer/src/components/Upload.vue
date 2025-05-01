<script setup>
import { onMounted, ref } from 'vue'
// Import electron API from preload
const { ipcRenderer } = window.electron
const supportedFormats = ref({
  input: [],
  output: []
})
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
      const ext = file.name.split('.').pop().toLowerCase()
      if (supportedFormats.value.input.includes(ext)) {
        previewUrls.value.push({
          name: file.name,
          url: null,
          size: formatFileSize(file.size),
          type: file.type || `document/${ext}`,
          resolution: 'N/A'
        })

        // Initialize options for document
        fileOptions.value.push({
          format: supportedFormats.value.output[0]
        })
      } else {
        console.warn(`Unsupported document format: ${ext}`)
      }
    }
  })
  showUploadArea.value = false
}

// Get default target format based on input format
function getTargetFormat(mimeType) {
  if (mimeType.startsWith('image/')) {
    return 'webp'
  }
  return mimeType.split('/')[1]
}
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
function resetOptions(index) {
  const preview = previewUrls.value[index]
  if (preview.url) {
    // Reset image options
    fileOptions.value[index] = {
      width: preview.originalWidth,
      height: preview.originalHeight,
      quality: 90,
      keepAspectRatio: true,
      format: getTargetFormat(preview.type)
    }
  } else {
    // Reset document options
    fileOptions.value[index] = {
      format: supportedFormats.value.output[0]
    }
  }
}
// Process files using Sharp
async function processFiles() {
  if (files.value.length === 0) return
  isProcessing.value = true
  processedFiles.value = []
  try {
    const savePath = await ipcRenderer.invoke('dialog:selectDirectory')
    if (!savePath) {
      isProcessing.value = false
      return
    }

    // Process each file one by one
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      const filepath = files.value[i].path
      const options = fileOptions.value[i]
      if (file.type.startsWith('image/')) {
        // Handle image files with Sharp
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
        })

        processedFiles.value.push({
          name: file.name,
          success: result.success,
          message: result.message,
          outputPath: result.outputPath
        })
        if (result.success) {
          await ipcRenderer.invoke('db:save-history', {
            filename: file.name,
            format: options.format,
            resolution: `${options.width}x${options.height}`,
            size: formatFileSize(file.size) 
          })
        }
      } else {
        try {
          const r = await ipcRenderer.invoke('document:convert',{
            filename: file.name.split('.')[0],
            inputPath: filepath,
            outputPath: savePath,
            options:{
              format: fileOptions.value[i].format
            }
          })
          processedFiles.value.push({
            name: file.name,
            success: r.success,
            message: r.message,
            outputPath: r.outputPath
          })
          if (r.success) {
            await ipcRenderer.invoke('db:save-history', {
              filename: file.name,
              format: fileOptions.value[i].format,
              size: formatFileSize(file.size)
            })
          }
        } catch (error) {
          processedFiles.value.push({
            name: file.name,
            success: false,
            message: error.message
          })
        }
      }
    }
  } catch (error) {
    console.error('Error processing files:', error)
  } finally {
    isProcessing.value = false
  }
}

onMounted(async() => {
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
  try{
    const formats = await ipcRenderer.invoke('document:get-formats')
    supportedFormats.value = formats
  }catch(error){
    console.error("Failed to get supported formats: ",error)
  }
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
  <input type="radio" name="my_tabs_6" class="tab" :aria-label="`Files (${files.length})`" checked/>
  <div class="tab-content bg-base-100 border-base-300 p-6 max-h-[calc(100vh-9rem)] overflow-y-auto">
     <!-- File list -->
            <div
        v-for="(preview, index) in previewUrls"
        :key="index"
        class=" p-4 flex relative m-4 items-center gap-4 border-5 border-midnight rounded-lg hover:border-indigo-500 group"
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
        <button class="hidden group-hover:flex btn btn-sm btn-circle absolute right-2 top-0.5 text-gray-400 hover:bg-transparent hover:text-red-400 hover:border-red-400"
        @click="removeFile(index)"
        >✕</button>
        <div class="flex-shrink-0 flex flex-col gap-5 ml-auto pt-2">
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
              <!-- Image Options -->
              <template v-if="preview.url">
                <!-- Format selection for images -->
                <div class="form-control">
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
                    <option value="tiff">TIFF</option>
                    <option value="heif">HEIF</option>
                    <option value="jxl">JXL</option>
                    <option value="tile">Tile</option>
                  </select>
                </div>
        
                <!-- Image specific options -->
                <div class="form-control">
                  <label class="label p-0">
                    <span class="label-text text-xs text-gray-400">Width (px)</span>
                  </label>
                  <input
                    type="number"
                    v-model="fileOptions[index].width"
                    @input="(e) => updateDimensions(index, 'width', e.target.value)"
                    class="input input-sm input-bordered w-full bg-gray-700"
                  />
                </div>
        
                <div class="form-control">
                  <label class="label p-0">
                    <span class="label-text text-xs text-gray-400">Height (px)</span>
                  </label>
                  <input
                    type="number"
                    v-model="fileOptions[index].height"
                    @input="(e) => updateDimensions(index, 'height', e.target.value)"
                    class="input input-sm input-bordered w-full bg-gray-700"
                  />
                </div>
        
                <div class="form-control">
                  <label class="label p-0">
                    <span class="label-text text-xs text-gray-400">Quality: {{ fileOptions[index].quality }}%</span>
                  </label>
                  <input
                    type="range"
                    v-model="fileOptions[index].quality"
                    min="1"
                    max="100"
                    class="range range-xs range-primary"
                  />
                </div>
        
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-2 p-0">
                    <input
                      type="checkbox"
                      v-model="fileOptions[index].keepAspectRatio"
                      class="checkbox checkbox-xs checkbox-primary"
                    />
                    <span class="label-text text-xs text-gray-400">Maintain aspect ratio</span>
                  </label>
                </div>
              </template>
        
              <!-- Document Options -->
              <template v-else>
                <div class="form-control">
                  <label class="label p-0">
                    <span class="label-text text-xs text-gray-400">Output Format</span>
                  </label>
                  <select
                    v-model="fileOptions[index].format"
                    class="select select-sm select-bordered w-full bg-gray-700"
                  >
                    <option v-for="format in supportedFormats.output" 
                            :key="format" 
                            :value="format">
                      {{ format.toUpperCase() }}
                    </option>
                  </select>
                </div>
              </template>
        
              <!-- Reset, Save buttons -->
              <div class="flex justify-end space-x-3">
                <button
                  :onclick="`document.getElementById('close-modal${index}').click()`"
                  class="btn btn-xs btn-outline btn-success"
                >
                  Save
                </button>
                <button
                  @click="resetOptions(index)"
                  class="btn btn-xs btn-outline btn-warning"
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
            class="absolute inset-0 bg-midnight bg-opacity-0 rounded-lg flex flex-col items-center justify-center"
          >
            <div v-if="processedFiles[index].success" class="text-success mb-2">
              <img src="../assets/success.svg" class="h-10 w-10">
              <p class="text-sm mt-1">Successfully processed</p>
            </div>
            <div v-else class="text-error mb-2">
              <img src="../assets/error.svg" class="h-10 w-10">
              <p class="text-sm mt-1">{{ processedFiles[index].message }}</p>
            </div>
          </div>
      </div>
  </div>

  <input type="radio" name="my_tabs_6" class="tab" :aria-label="`Completed ${processedFiles.length > 0 ? ( processedFiles.length ): ''}`" />
  <div class="tab-content bg-base-100 border-base-300 p-6 max-h-[calc(100vh-9rem)]">
     <!-- Results summary -->
      <div v-if="processedFiles.length > 0" class="mt-6 border-3 border-midnight rounded-lg p-4">
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
      <div v-else>
        <p class="text-sm">No files have been converted yet</p>
        <p class="text-xs mt-2">Convert some files to see results here</p>
</div>
    </div>
</div>
    </div>
  </div>
</template>