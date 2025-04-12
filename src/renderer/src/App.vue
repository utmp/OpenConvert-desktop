<script setup>
import Sidebar from './components/Sidebar.vue'
import Upload from './components/Upload.vue';

</script>

<template>
  <div class="flex h-screen">
    <Sidebar />
    <div class="flex-grow flex flex-col p-4 ml-16 h-full overflow-hidden"> <!-- Added h-full and overflow-hidden -->
      <!-- New space on top with a button -->
      <div class="mb-4 flex justify-between items-center shrink-0"> <!-- Reduced margin and added shrink-0 -->
        <h2 class="text-xl font-semibold text-gray-200">File Converter</h2>
        <button class="btn btn-active btn-primary">➕ Add files</button>

      </div>
      
      <!-- Upload component with flex-grow to take remaining space -->
      <div class="flex-grow overflow-auto">
        <Upload />
      </div>
    </div>
  </div>
</template>
