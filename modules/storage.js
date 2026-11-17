const STORAGE_KEY = 'tripbudget-booking-cart-v1';

export function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Keranjang lokal tidak dapat dibaca:', error);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Keranjang tidak dapat disimpan:', error);
    return false;
  }
}
