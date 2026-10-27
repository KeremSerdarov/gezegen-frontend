<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const airports = ref([])
const flights = ref([])
const from = ref('')
const to = ref('')
const date = ref('')

const loading = ref(false)
const searched = ref(false)
const pageError = ref('')

const selectedId = ref(null)
const passengers = ref([])
const errors = ref({})
const formMessage = ref('')
const buying = ref(false)
const success = ref([])

const emptyPassenger = () => ({ full_name: '', email: '', phone: '' })

const selectedFlight = computed(() =>
  flights.value.find((f) => f.id === selectedId.value)
)
const total = computed(() =>
  selectedFlight.value
    ? (Number(selectedFlight.value.price) * passengers.value.length).toFixed(2)
    : '0.00'
)

onMounted(async () => {
  try {
    const json = await api('/airports')
    airports.value = Array.isArray(json) ? json : json.data
    await search()
  } catch (e) {
    pageError.value = e.message
  }
})

async function search() {
  loading.value = true
  pageError.value = ''
  success.value = []
  selectedId.value = null
  try {
    const params = new URLSearchParams()
    if (from.value) params.append('from', from.value)
    if (to.value) params.append('to', to.value)
    if (date.value) params.append('date', date.value)
    const json = await api(`/flights?${params}`)
    flights.value = Array.isArray(json) ? json : json.data
    searched.value = true
  } catch (e) {
    pageError.value = e.message
  } finally {
    loading.value = false
  }
}

function swap() {
  const tmp = from.value
  from.value = to.value
  to.value = tmp
}

function selectFlight(flight) {
  if (selectedId.value === flight.id) {
    selectedId.value = null
    return
  }
  selectedId.value = flight.id
  passengers.value = [emptyPassenger()]
  errors.value = {}
  formMessage.value = ''
  success.value = []
}

function addPassenger() {
  if (passengers.value.length < (selectedFlight.value?.seats_available ?? 1)) {
    passengers.value.push(emptyPassenger())
  }
}

function removePassenger(index) {
  if (passengers.value.length > 1) passengers.value.splice(index, 1)
}

const err = (i, field) => errors.value[`passengers.${i}.${field}`]?.[0]

async function buy() {
  buying.value = true
  errors.value = {}
  formMessage.value = ''
  try {
    const json = await api('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        flight_id: selectedId.value,
        passengers: passengers.value,
      }),
    })
    const bought = Array.isArray(json) ? json : json.data
    selectedId.value = null
    await search()
    success.value = bought
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    if (e.status === 422) {
      errors.value = e.errors
      formMessage.value = e.errors.passengers?.[0] || 'Maglumatlary barlaň.'
    } else {
      formMessage.value = e.message
    }
  } finally {
    buying.value = false
  }
}

const time = (d) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const dateLabel = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function duration(a, b) {
  const m = Math.round((new Date(b) - new Date(a)) / 60000)
  return `${Math.floor(m / 60)} sag ${m % 60} min`
}

// Navbar-a laýyk täze input stili
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:bg-slate-800 dark:focus:ring-sky-900/40'
</script>

<template>
  <!-- Esasy fon: Oteller sahypasy bilen birebir sazlaşykly -->
  <div class="min-h-screen bg-[#f8fafc] pb-24 text-slate-800 dark:bg-[#0f172a] dark:text-slate-200">
    
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-4 pb-32 pt-36 text-center dark:from-slate-900 dark:via-[#1e3a5f] dark:to-slate-900">
      <div class="pointer-events-none absolute inset-0 opacity-50">
        <div class="absolute -left-20 top-0 h-96 w-96 rounded-full bg-sky-300/50 blur-[120px] dark:bg-sky-600/20"></div>
        <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/40 blur-[120px] dark:bg-indigo-600/20"></div>
      </div>
      
      <div class="relative z-10 mx-auto max-w-3xl">
        <span class="inline-block rounded-full border border-sky-200 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-sky-300">
          Gezegen
        </span>
        <h1 class="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl dark:text-white">
          Uçar biletini tap
        </h1>
      </div>
    </section>

    <div class="relative z-20 mx-auto -mt-16 max-w-5xl px-4">
      <!-- Gözleg Panel (Aýna effekti) -->
      <form
        @submit.prevent="search"
        class="grid items-end gap-4 rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-2xl md:grid-cols-[1fr_auto_1fr_1fr_auto] dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/40"
      >
        <label class="block text-sm font-bold text-slate-600 dark:text-slate-300">
          Nireden
          <select v-model="from" :class="inputClass" class="mt-2">
            <option value="">Hemmesi</option>
            <option v-for="a in airports" :key="a.id" :value="a.id">{{ a.city }} ({{ a.code }})</option>
          </select>
        </label>

        <button
          type="button"
          @click="swap"
          title="Çalyş"
          class="mx-auto mb-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-lg text-sky-600 transition hover:rotate-180 hover:bg-sky-100 dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-slate-700"
        >
          ⇄
        </button>

        <label class="block text-sm font-bold text-slate-600 dark:text-slate-300">
          Nirä
          <select v-model="to" :class="inputClass" class="mt-2">
            <option value="">Hemmesi</option>
            <option v-for="a in airports" :key="a.id" :value="a.id">{{ a.city }} ({{ a.code }})</option>
          </select>
        </label>

        <label class="block text-sm font-bold text-slate-600 dark:text-slate-300">
          Sene
          <input v-model="date" type="date" :class="inputClass" class="mt-2 dark:[color-scheme:dark]" />
        </label>

        <button
          type="submit"
          :disabled="loading"
          class="rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
        >
          {{ loading ? 'Gözlenýär...' : 'Gözle' }}
        </button>
      </form>

      <!-- Ýalňyşlyk -->
      <div
        v-if="pageError"
        class="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ pageError }}</span>
      </div>

      <!-- Üstünlik -->
      <div
        v-if="success.length"
        class="mt-6 rounded-[2rem] border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-800 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300"
      >
        <p class="flex items-center gap-3 text-lg font-bold">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">✓</span>
          Biletler üstünlikli alyndy ({{ success.length }})
        </p>
        <ul class="mt-4 space-y-2 text-sm font-medium">
          <li v-for="t in success" :key="t.id" class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Bilet #{{ t.id }} · {{ t.passenger?.full_name }} · ${{ t.price }}
          </li>
        </ul>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="mt-8 space-y-4">
        <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-[2rem] border border-slate-200/50 bg-slate-200/50 dark:border-slate-800 dark:bg-slate-800/50"></div>
      </div>

      <!-- Boş -->
      <div
        v-else-if="searched && !flights.length"
        class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <span class="text-4xl">🛫</span>
        </div>
        <p class="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Uçuş tapylmady</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Başga ugur ýa-da sene synap gör.</p>
      </div>

      <!-- Uçuş sanawy -->
      <div v-else class="mt-8 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
            <span class="font-bold text-sky-600 dark:text-sky-400">{{ flights.length }}</span> uçuş tapyldy
          </p>
        </div>

        <article
          v-for="f in flights"
          :key="f.id"
          class="overflow-hidden rounded-[2rem] border bg-white transition-all duration-300 dark:bg-slate-900"
          :class="
            selectedId === f.id
              ? 'border-sky-500 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500'
              : 'border-slate-200 shadow-sm hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg dark:border-slate-800 dark:hover:border-sky-700'
          "
        >
          <!-- Uçuş Maglumatlary -->
          <div class="flex flex-wrap items-center gap-6 p-6">
            <div class="min-w-[9rem]">
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ f.airline }}</p>
              <p class="mt-0.5 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">{{ f.flight_number }}</p>
              <span class="mt-2 inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ dateLabel(f.departure_at) }}
              </span>
            </div>

            <div class="flex min-w-[16rem] flex-1 items-center gap-4">
              <div class="text-center">
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ time(f.departure_at) }}</p>
                <p class="mt-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                  {{ f.from_airport?.code ?? f.from_airport?.city }}
                </p>
              </div>

              <div class="flex-1 text-center">
                <div class="flex items-center gap-2">
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
                  <span class="text-sm text-slate-400">✈</span>
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
                </div>
                <p class="mt-1.5 text-xs font-medium text-slate-400">{{ duration(f.departure_at, f.arrival_at) }}</p>
              </div>

              <div class="text-center">
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ time(f.arrival_at) }}</p>
                <p class="mt-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                  {{ f.to_airport?.code ?? f.to_airport?.city }}
                </p>
              </div>
            </div>

            <div class="ml-auto text-right">
              <p class="text-3xl font-black text-slate-900 dark:text-white">${{ f.price }}</p>
              <p class="text-xs font-medium text-slate-400">bir adam üçin</p>
              <p
                class="mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-bold"
                :class="f.seats_available > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'"
              >
                {{ f.seats_available > 0 ? `Boş ýer: ${f.seats_available}` : 'Ýer ýok' }}
              </p>
              <button
                @click="selectFlight(f)"
                :disabled="f.seats_available < 1"
                class="mt-3 block w-full rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                :class="selectedId === f.id ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white' : 'bg-sky-500 text-white shadow-md shadow-sky-500/30 hover:bg-sky-400'"
              >
                {{ selectedId === f.id ? 'Ýap' : 'Saýla' }}
              </button>
            </div>
          </div>

          <!-- Ýolagçy formasy (Açylýan panel) -->
          <div
            v-if="selectedId === f.id"
            class="border-t border-slate-200/60 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <h3 class="mb-5 text-lg font-bold text-slate-900 dark:text-white">Ýolagçylar</h3>

            <div
              v-for="(p, i) in passengers"
              :key="i"
              class="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div class="mb-4 flex items-center justify-between">
                <span class="flex items-center gap-2 text-sm font-bold text-sky-600 dark:text-sky-400">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs dark:bg-sky-900/50">
                    {{ i + 1 }}
                  </span>
                  Ýolagçy
                </span>
                <button
                  v-if="passengers.length > 1"
                  type="button"
                  @click="removePassenger(i)"
                  class="text-sm font-semibold text-red-500 transition hover:text-red-600 hover:underline"
                >
                  Aýyr
                </button>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div>
                  <input v-model="p.full_name" placeholder="Doly ady" :class="inputClass" />
                  <p v-if="err(i, 'full_name')" class="mt-1.5 text-xs font-medium text-red-500">{{ err(i, 'full_name') }}</p>
                </div>
                <div>
                  <input v-model="p.email" type="email" placeholder="email@mysal.com" :class="inputClass" />
                  <p v-if="err(i, 'email')" class="mt-1.5 text-xs font-medium text-red-500">{{ err(i, 'email') }}</p>
                </div>
                <div>
                  <input v-model="p.phone" placeholder="+99365000000" :class="inputClass" />
                  <p v-if="err(i, 'phone')" class="mt-1.5 text-xs font-medium text-red-500">{{ err(i, 'phone') }}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addPassenger"
              :disabled="passengers.length >= f.seats_available"
              class="rounded-xl border-2 border-dashed border-sky-300 px-5 py-2.5 text-sm font-bold text-sky-600 transition hover:bg-sky-50 disabled:opacity-40 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-900/30"
            >
              + Ýolagçy goş
            </button>

            <p
              v-if="formMessage"
              class="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            >
              {{ formMessage }}
            </p>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Jemi töleg</p>
                <p class="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                  ${{ total }} <span class="text-sm font-medium text-slate-400">({{ passengers.length }} ýolagçy)</span>
                </p>
              </div>
              <button
                @click="buy"
                :disabled="buying"
                class="rounded-xl bg-sky-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
              >
                {{ buying ? 'Ugradylýar...' : 'Satyn al' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>