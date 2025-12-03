export default function getHexCode(size = 3) {
  const array = new Uint8Array(size);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}
