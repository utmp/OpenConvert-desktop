<script setup>
import Sidebar from './components/Sidebar.vue'

</script>
<template>
  <div class="flex h-screen">
    <Sidebar class="z-10"/>
    <div class="flex-grow flex flex-col p-4 ml-16 h-full overflow-hidden">
      <!-- New space on top with a button -->
      <!-- <div class="mb-4 flex justify-between items-center shrink-0">
        <h2 class="text-xl font-semibold text-gray-200">File Converter</h2>
      </div> -->
      <!-- Upload component with flex-grow to take remaining space -->
      <div class="flex-grow overflow-auto">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
