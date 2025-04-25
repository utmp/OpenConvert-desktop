<script setup>
import { ref } from 'vue'

const categories = ref([
  'Documents',
  'Images',
  'Audio',
  'Video',
  'Archives'
])
</script>

<template>
  <img src="../assets/not-ready.svg" alt="">
  <h2 class="text-orange-600">Categories Under construction</h2>
</template>