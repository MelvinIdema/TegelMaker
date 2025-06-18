<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import AppBrand from './AppBrand.vue'
import NavLink from './NavLink.vue'

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
  <header class="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
    <div class="container mx-auto px-4 py-1">
      <nav class="flex items-center justify-between h-16">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-3">
          <AppLogo />
          <AppBrand
            :title="brandTitle"
            :subtitle="brandSubtitle"
          />
        </div>

        <!-- Navigation -->
        <div class="flex items-center space-x-6">
          <NavLink
            v-for="link in navigationLinks"
            :key="link.path"
            :to="link.path"
          >
            {{ link.label }}
          </NavLink>
        </div>
      </nav>
    </div>
  </header>
</template>
