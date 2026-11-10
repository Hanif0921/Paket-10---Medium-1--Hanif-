import { formatRupiah, getCarImage, getDestinationImage } from './data.js';

const destinationCopy = {
  'Mt. Everest': 'Jejak pegunungan Himalaya dan lanskap Nepal yang tak terlupakan.',
  'Taj Mahal': 'Simetri marmer putih dan kisah cinta ikonik di Agra, India.',
  'Pyramid of Giza': 'Saksikan salah satu keajaiban dunia kuno di tepi gurun Mesir.',
  'Niagara Falls': 'Air terjun megah dan udara segar di perbatasan Kanada.',
  'Eiffel Tower': 'Nikmati pesona Paris dari landmark paling dikenal di Prancis.',
  'Mt. Fuji': 'Pemandangan gunung suci Jepang dengan suasana yang menenangkan.',
  'Burj Khalifa': 'Arsitektur futuristik dan panorama kota Dubai dari ketinggian.',
  Colosseum: 'Telusuri jejak Romawi kuno di pusat kota Roma.',
  'Disney Land': 'Hari penuh keajaiban dan atraksi seru di California.',
  'Opera House': 'Ikon arsitektur tepi pelabuhan yang memukau di Sydney.',
};

const cardImage = (src, alt, classes = '') =>
  `<img src="${src}" alt="${alt}" class="${classes}" loading="lazy" onerror="this.onerror=null;this.src='./images/backgroundDefault.png'">`;

export function renderDestinations(destinations, state) {
  const root = document.querySelector('#destination-list');
  if (!destinations.length) {
    root.innerHTML = '<div class="empty-state">Tidak ada destinasi yang cocok. Coba ubah pencarian atau filter.</div>';
    return;
  }
  root.innerHTML = destinations.map((destination) => {
    const selected = state.selectedDestination?.namaTempatWisata === destination.namaTempatWisata;
    return `<button class="destination-card ${selected ? 'is-selected' : ''}" data-destination="${destination.namaTempatWisata}" aria-pressed="${selected}">
      ${cardImage(getDestinationImage(destination), destination.namaTempatWisata, 'destination-card__image')}
      <span class="destination-card__body">
        <span class="destination-card__meta"><span>${destination.continent}</span><span>${destination.location}</span></span>
        <span class="destination-card__title">${destination.namaTempatWisata}</span>
        <span class="destination-card__price">Mulai ${formatRupiah(Math.min(destination.price.days14, destination.price.days28))}<small> / paket</small></span>
      </span>
      <span class="destination-card__arrow" aria-hidden="true">↗</span>
    </button>`;
  }).join('');
}

export function renderDestinationDetail(destination, duration, onAddLabel = 'Pilih destinasi') {
  const root = document.querySelector('#destination-preview');
  if (!destination) {
    root.innerHTML = '<div class="preview-empty"><span class="preview-empty__icon">✳</span><p>Pilih destinasi untuk melihat detail dan estimasi paket.</p></div>';
    return;
  }
  const price = destination.price[duration];
  root.innerHTML = `${cardImage(getDestinationImage(destination), destination.namaTempatWisata, 'preview-image')}
    <div class="preview-content"><div class="eyebrow">${destination.continent} · ${destination.location}</div>
      <h3>${destination.namaTempatWisata}</h3><p>${destinationCopy[destination.namaTempatWisata] || 'Temukan pengalaman baru di destinasi pilihan Anda.'}</p>
      <div class="preview-price"><span>Paket ${duration === 'days14' ? '14' : '28'} hari</span><strong>${formatRupiah(price)}</strong></div>
      <button class="button button--primary button--wide" id="choose-destination">${onAddLabel}<span aria-hidden="true">→</span></button>
    </div>`;
}

export function renderCars(cars, state) {
  const root = document.querySelector('#car-list');
  if (!cars.length) {
    root.innerHTML = '<div class="empty-state">Belum ada mobil yang cocok dengan wilayah, kapasitas, atau filter Anda.</div>';
    return;
  }
  root.innerHTML = cars.map((car) => {
    const selected = state.selectedCar?.carName === car.carName;
    return `<button class="car-card ${selected ? 'is-selected' : ''}" data-car="${car.carName}" aria-pressed="${selected}">
      <span class="car-card__photo">${cardImage(getCarImage(car), car.carName, 'car-card__image')}<span class="car-card__year">${car.Year}</span></span>
      <span class="car-card__body"><span class="car-card__brand">${car.Brand} · ${car.transmission}</span><strong>${car.carName}</strong>
      <span class="car-card__spec"><span>♧ ${car.capacity} kursi</span><span>${formatRupiah(Math.min(car.Price.single, car.Price.driver))}<small> / hari</small></span></span></span>
    </button>`;
  }).join('');
}

export function renderCarDetail(car, service) {
  const root = document.querySelector('#car-preview');
  if (!car) {
    root.innerHTML = '<div class="preview-empty preview-empty--compact"><span class="preview-empty__icon">⌁</span><p>Pilih mobil untuk melihat tarif dan detail.</p></div>';
    return;
  }
  root.innerHTML = `${cardImage(getCarImage(car), car.carName, 'car-preview-image')}<div class="car-preview-copy">
    <div class="eyebrow">${car.Brand} · ${car.Year}</div><h3>${car.carName}</h3>
    <p>${car.capacity} penumpang · ${car.transmission} · Tersedia di ${car.availableContinent.join(', ')}</p>
    <strong>${formatRupiah(car.Price[service])}<small> / hari (${service === 'single' ? 'lepas kunci' : 'dengan sopir'})</small></strong></div>`;
}

export function renderPromoOptions(promos) {
  document.querySelector('#promo-code').innerHTML = '<option value="">Pilih voucher (opsional)</option>' + promos.map((promo) =>
    `<option value="${promo.promoCode}">${promo.promoCode} · ${promo.discountPercentage}%</option>`,
  ).join('');
  document.querySelector('#promo-list').innerHTML = promos.map((promo) =>
    `<article class="promo-row"><span class="promo-percent">${promo.discountPercentage}%</span><div><strong>${promo.promoCode}</strong><p>${promo.description}</p></div><span class="promo-min">Min. ${formatRupiah(promo.minTransaction)}</span></article>`,
  ).join('');
}

export function renderCart(cart, onRemove) {
  const root = document.querySelector('#cart-list');
  const count = document.querySelector('#cart-count');
  const subtotalEl = document.querySelector('#cart-subtotal');
  const totalEl = document.querySelector('#cart-total');
  count.textContent = cart.length;
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  subtotalEl.textContent = formatRupiah(subtotal);
  totalEl.textContent = formatRupiah(subtotal);
  if (!cart.length) {
    root.innerHTML = '<div class="cart-empty"><span>◷</span><p>Belum ada rencana tersimpan.</p><small>Paket pilihan Anda akan muncul di sini.</small></div>';
    return;
  }
  root.innerHTML = cart.map((item) => `<article class="cart-item">
    <div class="cart-item__top"><div><span class="eyebrow">${item.duration === 'days14' ? '14' : '28'} HARI · ${item.destination?.continent || 'FLEKSIBEL'}</span>
    <h4>${item.destination?.namaTempatWisata || 'Sewa mobil'}</h4></div><button class="icon-button" data-remove="${item.id}" aria-label="Hapus paket" title="Hapus paket">×</button></div>
    ${item.car ? `<div class="cart-item__line"><span>${item.car.carName} · ${item.service === 'single' ? 'Lepas kunci' : 'Dengan sopir'} × ${item.duration === 'days14' ? '14' : '28'} hari</span><strong>${formatRupiah(item.carTotal)}</strong></div>` : ''}
    ${item.destination ? `<div class="cart-item__line"><span>Paket destinasi</span><strong>${formatRupiah(item.destinationTotal)}</strong></div>` : ''}
    ${item.promo ? `<div class="cart-item__discount"><span>Voucher ${item.promo.code} (${item.promo.discount}%)</span><strong>−${formatRupiah(item.discount)}</strong></div>` : ''}
    <div class="cart-item__total"><span>Estimasi total</span><strong>${formatRupiah(item.total)}</strong></div></article>`).join('');
  root.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => onRemove(button.dataset.remove)));
}
