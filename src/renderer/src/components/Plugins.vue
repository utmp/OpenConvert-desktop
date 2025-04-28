<script setup>
import { ref } from 'vue'

const plugins = ref([
  {
    id: 'pandoc',
    name: 'Pandoc Document Converter',
    publisher: 'OpenConvert',
    summary: 'Universal document converter supporting Markdown, HTML, LaTeX, DOCX, PDF and many more formats',
    github: 'https://github.com/jgm/pandoc',
    version: '3.1.11',
    fileSize: '23.4 MB',
    installed: false,
    formats: {
      input: ['markdown', 'html', 'latex', 'docx', 'odt', 'epub'],
      output: ['pdf', 'docx', 'html', 'markdown', 'epub', 'latex'] 
    }
  }
])

async function installPlugin(pluginId) {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (!plugin) return

  try {
    // Here we would normally call the electron API to install the plugin
    // For now just simulate installation
    plugin.installed = true
  } catch (error) {
    console.error('Failed to install plugin:', error)
  }
}

async function uninstallPlugin(pluginId) {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (!plugin) return

  try {
    // Here we would normally call the electron API to uninstall the plugin
    plugin.installed = false 
  } catch (error) {
    console.error('Failed to uninstall plugin:', error)
  }
}
</script>
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-200 mb-6">Plugins</h2>
    
    <div class="w-full">
      <!-- Plugin list -->
      <div v-for="plugin in plugins" 
           :key="plugin.id" 
           class="p-4 flex relative m-4 items-center gap-4 border-5 border-midnight rounded-lg hover:border-indigo-500 group">
        
        <!-- Plugin Icon (maybe in future releases)-->
        <div class="flex-shrink-0">
          <div class="bg-gray-600 h-32 w-32 rounded flex items-center justify-center">
<img src="https://pandoc.org/pandoc-cartoon.svgz">

          </div>
        </div>

        <!-- Main Plugin Info -->
        <div class="w-1/2 flex flex-col justify-between">
          <div class="text-sm text-gray-300 space-y-2">
            <!-- Name and Publisher -->
            <h3 class="text-lg font-semibold">{{ plugin.name }}</h3>
            <p class="text-gray-400">by {{ plugin.publisher }}</p>
            <!-- Summary -->
            <p class="text-gray-400 text-sm ">{{ plugin.summary }}</p>
          </div>
        </div>

        <!-- Plugin Details -->
        <div class="w-1/3 flex flex-col text-sm text-gray-400 space-y-2">
          <div class="flex items-center gap-2">
            <img src="../assets/github.svg" class="w-4 h-4" alt="GitHub">
            <a :href="plugin.github" 
               target="_blank"
               class="hover:text-gray-200">GitHub</a>
          </div>
          <div class="flex items-center gap-2">
            <img src="../assets/filetype.svg" class="w-5 h-5" alt="Version">
            <span>v{{ plugin.version }}</span>
          </div>
          <div class="flex items-center gap-2">
            <img src="../assets/filesize.svg" class="w-4 h-4" alt="Size">
            <span>{{ plugin.fileSize }}</span>
          </div>
        </div>

        <!-- Install/Uninstall Button -->
        <div class="flex-shrink-0 ml-auto">
          <button 
            @click="plugin.installed ? uninstallPlugin(plugin.id) : installPlugin(plugin.id)"
            class="btn btn-sm"
            :class="plugin.installed ? 'btn-error' : 'btn-primary'"
          >
            {{ plugin.installed ? 'Uninstall' : 'Install' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>