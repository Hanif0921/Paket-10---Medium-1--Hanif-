const DATA_PATHS = {
  destinations: './datas/destination.json',
  cars: './datas/cars.json',
  promos: './datas/promos.json',
};

export async function loadTravelData() {
  try {
    const entries = await Promise.all(
      Object.entries(DATA_PATHS).map(async ([key, path]) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Gagal memuat ${path} (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error(`Format data ${path} tidak valid`);
        return [key, data];
      }),
    );
    return Object.fromEntries(entries);
  } catch (error) {
    throw new Error(`Data liburan tidak dapat dimuat. ${error.message}`);
  }
}

export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

export const getDestinationImage = (destination) => {
  const key = destination.namaTempatWisata.toLowerCase();
  const images = {
    'mt. everest': 'backgroundMt.Everest.png',
    'taj mahal': 'tajMahal.webp',
    'pyramid of giza': 'PyramidOfGiza.jpg',
    'niagara falls': 'NiagaraFalls.jpg',
    'eiffel tower': 'eiffelTower.jpg',
    'mt. fuji': 'Mt.Fuji1.webp',
    'burj khalifa': 'burjKhalifa.jpg',
    colosseum: 'colosseum.jpg',
    'disney land': 'disneyLand.webp',
    'opera house': 'operaHouse.jpg',
  };
  return `./images/${images[key] || 'backgroundDefault.png'}`;
};

export const getCarImage = (car) => {
  const key = car.carName.toLowerCase().replaceAll(' ', '').replaceAll('-', '');
  const images = {
    alphard: 'alphard.webp',
    avanza: 'avanza.webp',
    brio: 'brio.webp',
    fortuner: 'fortuner.webp',
    hiace: 'hiace.webp',
    hilux: 'hilux.webp',
    innova: 'innova.webp',
    pajero: 'pajero.webp',
    triton: 'triton.webp',
    xpander: 'xpander.webp',
  };
  return `./images/${images[key] || 'backgroundDefault.png'}`;
};

export function validatePromo(promo, { destination, duration, car, service, subtotal }) {
  const conditions = promo.conditions || {};
  if (subtotal < promo.minTransaction) return 'Belanja belum mencapai minimum transaksi voucher.';
  if (conditions.requireBundling && (!destination || !car)) return 'Voucher ini mewajibkan paket destinasi dan mobil.';
  if (conditions.targetContinent && (!destination || !conditions.targetContinent.includes(destination.continent))) {
    return 'Voucher tidak berlaku untuk benua destinasi ini.';
  }
  if (conditions.targetCarBrand && (!car || !conditions.targetCarBrand.includes(car.Brand))) {
    return 'Voucher tidak berlaku untuk merek mobil ini.';
  }
  if (conditions.minCarCapacity && (!car || car.capacity < conditions.minCarCapacity)) {
    return `Voucher membutuhkan mobil minimal ${conditions.minCarCapacity} penumpang.`;
  }
  if (conditions.requiredDuration && duration !== conditions.requiredDuration) {
    return 'Voucher tidak berlaku untuk durasi yang dipilih.';
  }
  if (conditions.requiredCarService && service !== conditions.requiredCarService) {
    return 'Voucher tidak berlaku untuk layanan mobil yang dipilih.';
  }
  return '';
}
