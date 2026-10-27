<script setup>
import { ref, onMounted } from 'vue'

const cities = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('http://192.168.3.186:8000/api/cities', {
      headers: { Accept: 'application/json' },
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = JSON.parse(text)
    cities.value = Array.isArray(json) ? json : json.data
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Şäherler</h2>

    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
    </div>

    <p v-else-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-red-600">
      Ýalňyşlyk: {{ error }}
    </p>

    <p v-else-if="!cities.length" class="text-gray-500">
      Sanaw boş
    </p>

    <ul v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <li
        v-for="city in cities"
        :key="city.id"
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-indigo-300"
      >
        <p class="font-semibold text-gray-800">{{ city.name }}</p>
        <p class="text-sm text-gray-400">{{ city.slug }}</p>
      </li>
    </ul>
  </div>
</template>