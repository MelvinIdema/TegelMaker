<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

import { TooltipProvider } from '@/components/ui/tooltip'

interface NavigationLink {
  path: string
  label: string
}

interface Props {
  brandTitle?: string
  brandSubtitle?: string
  navigationLinks?: NavigationLink[]
}

withDefaults(defineProps<Props>(), {
  brandTitle: 'Kut Tegeljes',
  brandSubtitle: 'Kut Tegeljes Generator',
  navigationLinks: () => [
    { path: '/', label: 'Generator' }
  ]
})
</script>

<template>
  <TooltipProvider>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <!-- Header -->
      <AppHeader
        :brand-title="brandTitle"
        :brand-subtitle="brandSubtitle"
        :navigation-links="navigationLinks"
      />

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <slot />
      </main>

      <!-- Decorative footer pattern -->
      <AppFooter />
    </div>

    <!-- Toast Notifications -->
    <Toaster richColors position="bottom-left" />
  </TooltipProvider>
</template>
