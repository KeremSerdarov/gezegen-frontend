<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../api'

const hotels = ref([])
const error = ref(null)
const loading = ref(true)
const search = ref('')
const starFilter = ref(0)

const filteredHotels = computed(() => {
  const query = search.value.trim().toLowerCase()
  return hotels.value.filter((h) => {
    const byStars = starFilter.value === 0 || Number(h.stars) === starFilter.value
    const byText =
      query === '' ||
      h.name?.toLowerCase().includes(query) ||
      h.address?.toLowerCase().includes(query) ||
      h.city?.name?.toLowerCase().includes(query)
    return byStars && byText
  })
})

onMounted(async () => {
  try {
    const json = await api('/hotels')
    hotels.value = Array.isArray(json) ? json : json.data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const hideBroken = (e) => {
  e.target.style.display = 'none'
}
</script>

<template>
  <!-- Esasy fon: Arassa we ýumşak reňk (Light mode) -->
  <div class="min-h-screen bg-[#f8fafc] pb-24 text-slate-800 dark:bg-[#0f172a] dark:text-slate-200">
    
    <!-- Hero Bölümi: Navbar-yň aňyrsyndan görünýän ýagty-mawy gradient -->
    <section class="relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-4 pb-32 pt-36 text-center dark:from-slate-900 dark:via-[#1e3a5f] dark:to-slate-900">
      <!-- Ýumşak reňkli yşyklar -->
      <div class="pointer-events-none absolute inset-0 opacity-50">
        <div class="absolute -left-20 top-0 h-96 w-96 rounded-full bg-sky-300/50 blur-[120px] dark:bg-sky-600/20"></div>
        <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/40 blur-[120px] dark:bg-indigo-600/20"></div>
      </div>
      
      <div class="relative z-10 mx-auto max-w-3xl">
        <span class="inline-block rounded-full border border-sky-200 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-sky-300">
          Gezegen
        </span>
        <h1 class="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl dark:text-white">
          Oteller
        </h1>
      </div>
    </section>

    <div class="relative z-20 mx-auto -mt-16 max-w-6xl px-4">
      <!-- Gözleg we Süzgüç Panel (Ak Aýna effekti) -->
      <div class="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/40">
        <div class="relative group">
          <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Otelüň ady, şäher ýa-da salgy boýunça gözle..."
            class="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
          />
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-2">
          <span class="mr-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ýyldyz</span>
          <button
            v-for="s in [0, 5, 4, 3, 2, 1]"
            :key="s"
            type="button"
            @click="starFilter = s"
            class="rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95"
            :class="
              starFilter === s
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            "
          >
            {{ s === 0 ? 'Hemmesi' : s + ' ★' }}
          </button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-72 animate-pulse rounded-[2rem] bg-slate-200/50 dark:bg-slate-800/50"></div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="mt-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Ýalňyşlyk: {{ error }}</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!filteredHotels.length"
        class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg class="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p class="mt-4 font-bold text-slate-800 dark:text-slate-200">Otel tapylmady</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Başga at ýa-da ýyldyz saýlap gör.</p>
      </div>

      <!-- Otel Kartlary -->
      <template v-else>
        <div class="mt-8 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            <span class="font-bold text-sky-600 dark:text-sky-400">{{ filteredHotels.length }}</span> otel tapyldy
          </p>
        </div>

        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="hotel in filteredHotels"
            :key="hotel.id"
            class="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700 dark:hover:shadow-black/40"
          >
            <!-- Surat bölegi -->
            <div class="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-8xl font-black text-slate-200 dark:text-white/5">{{ hotel.name?.charAt(0) }}</span>
              </div>
              <img
                v-if="hotel.image"
                :src="hotel.image"
                :alt="hotel.name"
                @error="hideBroken"
                class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              
              <span
                v-if="hotel.rating"
                class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/50 dark:text-white"
              >
                <svg class="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ hotel.rating }}
              </span>
            </div>

            <!-- Maglumat bölegi -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">{{ hotel.name }}</h3>

              <p v-if="hotel.stars" class="mt-1 text-sm tracking-widest text-amber-500">
                <span v-for="n in 5" :key="n">{{ n <= hotel.stars ? '★' : '☆' }}</span>
              </p>

              <div class="mt-4 space-y-2">
                <p v-if="hotel.city?.name" class="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <svg class="h-4 w-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ hotel.city.name }}
                </p>
                <p v-if="hotel.address" class="pl-6 truncate text-sm text-slate-500 dark:text-slate-400">
                  {{ hotel.address }}
                </p>
              </div>

              <div class="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span
                  v-if="hotel.capacity"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <svg class="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ hotel.capacity }} orun
                </span>
                <span
                  v-if="hotel.phone"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <svg class="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ hotel.phone }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>