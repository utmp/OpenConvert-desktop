<script setup>
import { ref, onMounted } from 'vue'

const { ipcRenderer } = window.electron
const conversions = ref([])
const isLoading = ref(false)
// Function to fetch history data
const refreshHistory = async () => {
  isLoading.value = true
  try {
    const result = await ipcRenderer.invoke('db:get-data')
    if (result.success) {
      conversions.value = result.conversions
    } else {
      console.error('Failed to load conversions:', result.error)
    }
  } catch (error) {
    console.error('Error loading conversion history:', error)
  } finally {
    isLoading.value = false
  }
}
onMounted(async () => {
  await refreshHistory()
})
</script>

<template>
   <div class="mt-2 flex justify-end">
      <button 
        class="btn btn-sm btn-primary btn-outline" 
        @click="refreshHistory" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Loading...' : 'Refresh History' }}
      </button>
    </div>
  <div class="container p-4">
    <div v-if="isLoading" class="w-full">
      <div class="skeleton h-8 w-full mb-4"></div>
      <div class="skeleton h-8 w-full mb-2"></div>
      <div class="skeleton h-8 w-full mb-2"></div>
      <div class="skeleton h-8 w-full mb-2"></div>
    </div>

    <div v-else class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 max-h-[calc(100vh-9rem)] overflow-y-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Format</th>
            <th>Resolution</th>
            <th>Size</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="conversions.length === 0">
            <td colspan="5" class="text-center py-4">No conversion history found</td>
          </tr>
          <tr v-for="conv in conversions" :key="conv.id" class="hover:bg-base-200">
            <td>{{ conv.filename }}</td>
            <td>{{ conv.format?.toUpperCase() }}</td>
            <td>{{ conv.resolution || 'N/A' }}</td>
            <td>{{ conv.size }}</td>
            <td>{{ new Date(conv.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>