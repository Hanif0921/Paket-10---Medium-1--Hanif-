import { formatRupiah, loadTravelData, validatePromo } from './modules/data.js';
import { loadCart, saveCart } from './modules/storage.js';
import {
  renderCarDetail,
  renderCars,
  renderCart,
  renderDestinationDetail,
  renderDestinations,
  renderPromoOptions,
} from './modules/ui.js';

const state = {
  destinations: [],
  cars: [],
  promos: [],
  cart: loadCart(),
  previewDestination: null,
  selectedDestination: null,
  selectedCar: null,
  appliedPromo: null,
  destinationSearch: '',
  continent: '',
  destinationSort: 'az',
  carSearch: '',
  brand: '',
  carSort: 'az',
  duration: 'days14',
  service: 'single',
  passengers: 4,
};

const $ = (selector) => document.querySelector(selector);
let toastTimer;

function applyTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const button = $('#theme-toggle');
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
  button.title = isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap';
  button.querySelector('span').textContent = isDark ? '☀' : '☾';
  $('meta[name="theme-color"]').content = isDark ? '#121b18' : '#f6f7f2';
  if (persist) {
    try {
      localStorage.setItem('rute-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('Preferensi tema tidak dapat disimpan:', error);
    }
  }
}

applyTheme(document.documentElement.dataset.theme || 'light');

const header = $('.topbar');
const updateHeaderOnScroll = () => {
  header.classList.toggle('topbar--scrolled', window.scrollY > 0);
};
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
updateHeaderOnScroll();

function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast toast--visible ${type === 'error' ? 'toast--error' : ''}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('toast--visible'), 3200);
}

function getDestinationPrice(destination = state.selectedDestination) {
  return destination ? destination.price[state.duration] : 0;
}

function getCarDailyPrice(car = state.selectedCar) {
  return car ? car.Price[state.service] : 0;
}

function getTripSubtotal() {
  const days = Number(state.duration.replace('days', ''));
  return getDestinationPrice() + getCarDailyPrice() * days;
}

function renderDestinationCatalog() {
  const filtered = state.destinations.filter((destination) => {
    const searchText = `${destination.namaTempatWisata} ${destination.location}`.toLowerCase();
    return searchText.includes(state.destinationSearch.toLowerCase()) &&
      (!state.continent || destination.continent === state.continent);
  });
  const sorters = {
    az: (a, b) => a.namaTempatWisata.localeCompare(b.namaTempatWisata),
    'days14-asc': (a, b) => a.price.days14 - b.price.days14,
    'days14-desc': (a, b) => b.price.days14 - a.price.days14,
    'days28-asc': (a, b) => a.price.days28 - b.price.days28,
    'days28-desc': (a, b) => b.price.days28 - a.price.days28,
  };
  filtered.sort(sorters[state.destinationSort]);
  renderDestinations(filtered, state);
}

function getAvailableCars() {
  return state.cars.filter((car) =>
    (!state.selectedDestination || car.availableContinent.includes(state.selectedDestination.continent)) &&
    car.capacity >= state.passengers &&
    car.carName.toLowerCase().includes(state.carSearch.toLowerCase()) &&
    (!state.brand || car.Brand.toLowerCase() === state.brand.toLowerCase()),
  );
}

function renderCarCatalog() {
  const cars = getAvailableCars();
  const dailyPrice = (car) => car.Price[state.service];
  const sorters = {
    az: (a, b) => a.carName.localeCompare(b.carName),
    'year-asc': (a, b) => a.Year - b.Year,
    'year-desc': (a, b) => b.Year - a.Year,
    'price-asc': (a, b) => dailyPrice(a) - dailyPrice(b),
    'price-desc': (a, b) => dailyPrice(b) - dailyPrice(a),
  };
  cars.sort(sorters[state.carSort]);
  renderCars(cars, state);
  renderCarDetail(state.selectedCar, state.service);
  const note = $('#availability-note');
  note.textContent = state.selectedDestination
    ? `${cars.length} mobil tersedia di ${state.selectedDestination.continent} untuk ${state.passengers} penumpang.`
    : `Menampilkan ${cars.length} mobil yang muat untuk ${state.passengers} penumpang.`;
}

function renderPreviews() {
  renderDestinationDetail(state.previewDestination, state.duration);
  renderCarDetail(state.selectedCar, state.service);
  const destinationButton = $('#choose-destination');
  if (destinationButton) {
    const alreadySelected = state.selectedDestination?.namaTempatWisata === state.previewDestination?.namaTempatWisata;
    destinationButton.textContent = alreadySelected ? 'Destinasi dipilih ✓' : 'Pilih destinasi →';
    destinationButton.addEventListener('click', () => {
      state.selectedDestination = state.previewDestination;
      if (state.selectedCar && !state.selectedCar.availableContinent.includes(state.selectedDestination.continent)) {
        state.selectedCar = null;
      }
      renderDestinationCatalog();
      renderCarCatalog();
      renderPreviews();
      showToast(`${state.selectedDestination.namaTempatWisata} dipilih untuk perjalanan.`);
    }, { once: true });
  }
}

function renderCartSummary() {
  renderCart(state.cart, removeCartItem);
  const itemCount = state.cart.length;
  $('#cart-count-label').textContent = `(${itemCount})`;
  const subtotal = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = state.cart.reduce((sum, item) => sum + item.total, 0);
  $('#cart-subtotal').textContent = formatRupiah(subtotal);
  $('#cart-total').textContent = formatRupiah(total);
}

function removeCartItem(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  saveCart(state.cart);
  renderCartSummary();
  showToast('Paket dihapus dari keranjang.');
}

function bindEvents() {
  $('#theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });
  $('#destination-search').addEventListener('input', (event) => {
    state.destinationSearch = event.target.value.trim();
    renderDestinationCatalog();
  });
  $('#continent-filter').addEventListener('change', (event) => {
    state.continent = event.target.value;
    renderDestinationCatalog();
  });
  $('#destination-sort').addEventListener('change', (event) => {
    state.destinationSort = event.target.value;
    renderDestinationCatalog();
  });
  $('#destination-list').addEventListener('click', (event) => {
    const card = event.target.closest('[data-destination]');
    if (!card) return;
    state.previewDestination = state.destinations.find((destination) => destination.namaTempatWisata === card.dataset.destination);
    renderDestinationCatalog();
    renderPreviews();
  });
  $('#car-search').addEventListener('input', (event) => {
    state.carSearch = event.target.value.trim();
    renderCarCatalog();
  });
  $('#brand-filter').addEventListener('change', (event) => {
    state.brand = event.target.value;
    renderCarCatalog();
  });
  $('#car-sort').addEventListener('change', (event) => {
    state.carSort = event.target.value;
    renderCarCatalog();
  });
  $('#car-list').addEventListener('click', (event) => {
    const card = event.target.closest('[data-car]');
    if (!card) return;
    state.selectedCar = state.cars.find((car) => car.carName === card.dataset.car);
    renderCarCatalog();
  });
  document.querySelectorAll('input[name="duration"]').forEach((input) => input.addEventListener('change', (event) => {
    state.duration = event.target.value;
    renderPreviews();
  }));
  document.querySelectorAll('input[name="car-service"]').forEach((input) => input.addEventListener('change', (event) => {
    state.service = event.target.value;
    renderCarCatalog();
  }));
  $('#passenger-count').addEventListener('input', (event) => {
    const count = Number(event.target.value);
    if (!Number.isInteger(count) || count < 1 || count > 30) {
      event.target.setCustomValidity('Masukkan jumlah 1 sampai 30 orang.');
      return;
    }
    event.target.setCustomValidity('');
    state.passengers = count;
    if (state.selectedCar?.capacity < count) state.selectedCar = null;
    renderCarCatalog();
  });
  $('#apply-promo').addEventListener('click', applyPromo);
  $('#add-to-cart').addEventListener('click', addToCart);
}

function applyPromo() {
  const promoCode = $('#promo-code').value;
  $('#promo-feedback').className = 'promo-feedback';
  if (!promoCode) {
    state.appliedPromo = null;
    $('#promo-feedback').textContent = 'Pilih voucher yang ingin digunakan.';
    return;
  }
  const promo = state.promos.find((item) => item.promoCode === promoCode);
  const message = validatePromo(promo, {
    destination: state.selectedDestination,
    duration: state.duration,
    car: state.selectedCar,
    service: state.service,
    subtotal: getTripSubtotal(),
  });
  if (message) {
    state.appliedPromo = null;
    $('#promo-feedback').textContent = message;
    $('#promo-feedback').classList.add('promo-feedback--error');
    return;
  }
  state.appliedPromo = promo;
  $('#promo-feedback').textContent = `${promo.promoCode} berhasil diterapkan. Diskon ${promo.discountPercentage}% akan masuk ke paket.`;
  $('#promo-feedback').classList.add('promo-feedback--success');
}

function addToCart() {
  if (!state.selectedDestination) {
    showToast('Pilih destinasi terlebih dahulu.', 'error');
    $('#destinations').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const passengerCount = Number($('#passenger-count').value);
  if (!Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 30) {
    $('#passenger-count').setCustomValidity('Masukkan jumlah 1 sampai 30 orang.');
    $('#passenger-count').reportValidity();
    showToast('Jumlah anggota keluarga harus 1 sampai 30 orang.', 'error');
    return;
  }
  $('#passenger-count').setCustomValidity('');
  const destinationTotal = getDestinationPrice();
  const days = Number(state.duration.replace('days', ''));
  const carTotal = state.selectedCar ? getCarDailyPrice() * days : 0;
  const subtotal = destinationTotal + carTotal;
  let promo = null;
  let discount = 0;
  if (state.appliedPromo) {
    const message = validatePromo(state.appliedPromo, {
      destination: state.selectedDestination,
      duration: state.duration,
      car: state.selectedCar,
      service: state.service,
      subtotal,
    });
    if (message) {
      state.appliedPromo = null;
      $('#promo-feedback').textContent = message;
      $('#promo-feedback').className = 'promo-feedback promo-feedback--error';
      showToast('Voucher tidak lagi memenuhi syarat untuk paket ini.', 'error');
      return;
    }
    promo = { code: state.appliedPromo.promoCode, discount: state.appliedPromo.discountPercentage };
    discount = Math.round(subtotal * promo.discount / 100);
  }
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    destination: { ...state.selectedDestination },
    car: state.selectedCar ? { ...state.selectedCar } : null,
    duration: state.duration,
    service: state.service,
    passengers: state.passengers,
    destinationTotal,
    carTotal,
    subtotal,
    promo,
    discount,
    total: subtotal - discount,
  };
  state.cart.unshift(item);
  if (!saveCart(state.cart)) {
    state.cart.shift();
    showToast('Penyimpanan lokal gagal. Periksa ruang penyimpanan browser.', 'error');
    return;
  }
  state.appliedPromo = null;
  $('#promo-code').value = '';
  $('#promo-feedback').textContent = '';
  renderCartSummary();
  showToast('Kombinasi liburan tersimpan di keranjang.');
}

async function initialize() {
  try {
    const data = await loadTravelData();
    state.destinations = data.destinations;
    state.cars = data.cars;
    state.promos = data.promos;
    renderPromoOptions(state.promos);
    renderDestinationCatalog();
    renderCarCatalog();
    renderPreviews();
    renderCartSummary();
    bindEvents();
  } catch (error) {
    console.error(error);
    document.querySelector('main').innerHTML = `<section class="load-error"><span>!</span><h1>Data perjalanan belum tersedia.</h1><p>${error.message}</p><button class="button button--primary" onclick="window.location.reload()">Coba muat ulang</button></section>`;
  }
}

initialize();
