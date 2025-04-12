<script setup>
import {ref} from 'vue'
const name = ref("John Doe");
</script>

<template>
    <div class="fixed top-0 left-0 flex h-screen w-16 flex-col justify-between border-e bg-[#000000] border-gray-800">
      <div>
        <div class="inline-flex size-16 items-center justify-center">
          
           <img src="../assets/logo.svg" class="grid size-10 place-content-center rounded-lg "
           >
        </div>
  
        <div class="border-t border-gray-800">
          <div class="px-2">
             <ul class="space-y-3  pt-4">
              <li>
                <a
                  href="#"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
                >
                  <img src="../assets/convert.svg" class="size-6">
  
                  <span
                    class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    Convert
                  </span>
                </a>
              </li>
  
              <li>
                <a
                  href="#"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                >
              <img src="../assets/categories.svg" class="size-7">
  
                  <span
                    class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    Categories
                  </span>
                </a>
              </li>
  
              <li>
                <a
                  href="#"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                >
                <img src="../assets/plugins.svg" class="size-7">
                  <span
                    class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    Plugins
                  </span>
                </a>
              </li>
              <li>
                <a class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                >
               <img src="../assets/history.svg" class="size-6">
<span class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    History
                  </span>
                </a>
              </li>
            </ul> 
          </div>
        </div>
      </div>
  
      <div class="sticky inset-x-0 bottom-0 border-t border-gray-800 bg-[#000000] p-2">
        <button
          type="submit"
          class="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-5 opacity-75"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span
            class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
          >
            Settings
          </span>
        </button>
      </div>
    </div>
</template>