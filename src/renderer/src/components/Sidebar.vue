<script setup>
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
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                  :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/' }"
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
                <router-link
                  to="/categories"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                  :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/categories' }"

                >
              <img src="../assets/categories.svg" class="size-7">
  
                  <span
                    class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                   <router-link to="/categories"> Categories</router-link>
                  </span>
                </router-link>
              </li>
  
              <li>
                <router-link
                  to="/plugins"
                  class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                  :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/plugins' }"

                >
                <img src="../assets/plugins.svg" class="size-7">
                  <span
                    class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    Plugins
                  </span>
                </router-link>
              </li>
              <li>
                <router-link 
                to="/history"
                class="group relative flex justify-center rounded px-2 py-1.5 text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
                :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/history' }"

                >
               <img src="../assets/history.svg" class="size-6">
<span class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                  >
                    History
                  </span>
                </router-link>
              </li>
            </ul> 
          </div>
        </div>
      </div>
  
      <div class="sticky inset-x-0 bottom-0 border-t border-gray-800 bg-[#000000] p-2">
        <router-link
          to="/settings"
          class="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-[#ffffff1a] hover:text-gray-700"
          :class="{ 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': $route.path === '/settings' }"
        >
         <img src="../assets/settings.svg" class="size-7">
          <span
            class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
          >
            Settings
          </span>
        </router-link>
      </div>
    </div>
</template>