import { ref } from 'vue';

const toasts = ref([]);
let prochainId = 1;

const DUREE = 2800;

function afficherToast(message, type) {
  const id = prochainId++;

  toasts.value.push({ id, message, type });

  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, DUREE);
}

export function useToast() {
  return {
    toasts,
    succes: (message) => afficherToast(message, 'succes'),
    erreur: (message) => afficherToast(message, 'erreur'),
  };
}
