<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ToggleDarkMode from '../common/ToggleDarkMode.vue'

const links = [
  { to: '/', label: 'Home' },
  { to: '/hotels', label: 'Hotels' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/about', label: 'About' },
]

const open = ref(false)
const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="sticky top-3 z-50 px-3 md:px-6">
    <nav
      class="mx-auto max-w-7xl overflow-hidden rounded-[28px] border backdrop-blur-2xl backdrop-saturate-200 transition-all duration-300"
      :class="
        scrolled
          ? 'border-white/60 bg-white/45 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-900/50'
          : 'border-white/40 bg-white/35 shadow-xl shadow-slate-900/5 dark:border-white/5 dark:bg-slate-900/35'
      "
    >
      <div class="flex items-center justify-between px-5 py-3.5 md:px-7 md:py-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3" @click="open = false">
          <span
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-xl text-white shadow-lg shadow-sky-500/30"
          >
            ✦
          </span>
          <span class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gezegen</span>
        </RouterLink>

        <!-- Desktop links -->
        <ul class="hidden items-center gap-1 rounded-full bg-black/5 p-1.5 md:flex dark:bg-white/10">
          <li v-for="l in links" :key="l.to">
            <RouterLink
              :to="l.to"
              class="block rounded-full px-6 py-2 text-base font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              active-class="!bg-white !text-sky-600 shadow-sm dark:!bg-slate-700 dark:!text-sky-300"
              exact-active-class="!bg-white !text-sky-600 shadow-sm dark:!bg-slate-700 dark:!text-sky-300"
            >
              {{ l.label }}
            </RouterLink>
          </li>
        </ul>

        <!-- Sag tarap -->
        <div class="flex items-center gap-3">
          <ToggleDarkMode />

          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5 text-slate-700 transition active:scale-90 md:hidden dark:bg-white/10 dark:text-white"
            @click="open = !open"
            aria-label="Menu"
          >
            <svg v-if="!open" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Telefon menýusy -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <ul v-if="open" class="space-y-1 border-t border-white/30 p-3 md:hidden dark:border-white/10">
          <li v-for="l in links" :key="l.to">
            <RouterLink
              :to="l.to"
              @click="open = false"
              class="block rounded-2xl px-4 py-3.5 text-lg font-semibold text-slate-700 transition dark:text-slate-200"
              active-class="!bg-white/80 !text-sky-600 dark:!bg-slate-700/80 dark:!text-sky-300"
              exact-active-class="!bg-white/80 !text-sky-600 dark:!bg-slate-700/80 dark:!text-sky-300"
            >
              {{ l.label }}
            </RouterLink>
          </li>
        </ul>
      </Transition>
    </nav>
  </header>
</template>