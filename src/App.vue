<script setup lang="ts">
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <TooltipProvider>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <!-- Header -->
      <header class="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 py-1">
          <nav class="flex items-center justify-between h-16">
            <!-- Logo and Title -->
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Kut Tegeljes
                </h1>
                <p class="text-xs text-muted-foreground">Kut Tegeljes Generator</p>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center space-x-6">
              <RouterLink
                to="/"
                class="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                Generator
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </RouterLink>
            </div>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <RouterView />
      </main>

      <!-- Decorative footer pattern -->
      <div class="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-60"></div>
    </div>

    <!-- Toast Notifications -->
    <Toaster richColors position="bottom-left" />
  </TooltipProvider>
</template>

<style scoped>
@reference "./assets/main.css";

/* Custom router-link active styles */
.router-link-active {
  @apply text-foreground;
}

.router-link-active span {
  @apply w-full;
}
</style>
