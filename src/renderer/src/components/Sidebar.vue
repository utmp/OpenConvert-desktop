<script setup>
import { ref, onMounted } from 'vue'
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
function toggleTheme(event) {
  const isChecked = event.target.checked
  const theme = isChecked ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
  isDarkMode.value = isChecked
}
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
  isDarkMode.value = savedTheme === 'dark'
})
</script>

<template>
    <div class="fixed top-0 left-0 flex h-screen w-16 flex-col justify-between border-e bg-[#000000] border-gray-800">
      <div>
        <div class="inline-flex size-16 items-center justify-center">
          
           <img src="../assets/logo.svg" class="grid size-10 place-content-center rounded-lg"
           >
        </div>
  
        <div class="border-t border-gray-800">
          <div class="px-2">
             <ul class="space-y-3  pt-4">
              <li>
                <a
                  href="#"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                  :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/' }"
                  >
                  <div class="tooltip tooltip-right" data-tip="Convert">
                    <img src="../assets/convert.svg" class="size-6">
                  </div>
                </a>
              </li>
              <li>
                <router-link
                  to="/plugins"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                  :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/plugins' }"

                >
                <div class="tooltip tooltip-right" data-tip="Plugins">
                  <img src="../assets/plugins.svg" class="size-7">
                </div>
                  
                </router-link>
              </li>
              <li>
                <router-link 
                to="/history"
                class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/history' }"

>
<div class="tooltip tooltip-right" data-tip="History">
               <img src="../assets/history.svg" class="size-6">
                  </div>
                </router-link>
              </li>
            </ul> 
          </div>
        </div>
      </div>
      <div class="tooltip tooltip-right" data-tip="switch theme">
         <div class="sticky inset-x-0 bottom-0 border-t border-gray-800 bg-base-400 p-2 flex justify-center">
        <label class="swap swap-rotate">
  <!-- this hidden checkbox controls the state -->
  <input type="checkbox" 
  class="theme-controller" 
  :checked="isDarkMode"
  @change="toggleTheme" 
  />
  <svg
    class="swap-on h-9 w-9"
    fill="#fff"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24">
    <path
      d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>
  <svg
    class="swap-off h-9 w-9"
    fill="#fff"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24">
    <path
      d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
  </svg>
</label>
      </div>
      </div>
     
    </div>
</template>