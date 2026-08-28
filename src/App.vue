<script setup>
import { computed, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppBottomBar from '@/components/layout/AppBottomBar.vue';
import AppDrawer from '@/components/ui/AppDrawer.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';

const route = useRoute();

// La page de connexion occupe tout l'écran : ni barre latérale, ni en-tête.
const afficherLayout = computed(() => !route.meta.public);

const sidebarOuverte = ref(false);

// Sur mobile, la barre latérale se referme dès qu'on change de page.
watch(() => route.fullPath, () => {
  sidebarOuverte.value = false;
});
</script>

<template>
  <template v-if="afficherLayout">
    <AppSidebar v-model:ouverte="sidebarOuverte" />
    <AppNavbar />

    <!-- af-main : réserve la hauteur de la barre d'onglets (et l'encoche des
         iPhone) sous le contenu, sinon les derniers éléments passent dessous. -->
    <main class="af-main min-h-screen pt-16 lg:pl-72">
      <div class="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <RouterView />
      </div>
    </main>

    <AppBottomBar @ouvrir-menu="sidebarOuverte = true" />
  </template>

  <RouterView v-else />

  <!-- L'ordre compte : ces trois éléments sont téléportés dans <body> et
       partagent le même z-index. Il reprend celui de l'ancien index.html
       (#toast puis #modalRoot) : la boîte de confirmation passe au-dessus du
       panneau latéral, indispensable pour retirer un auditeur depuis une
       mission ouverte. -->
  <ToastContainer />
  <AppDrawer />
  <ConfirmDialog />
</template>
