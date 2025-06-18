<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Kut Tegeljes',
  subtitle: 'Kut Tegeljes Generator'
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      {{ title }}
    </h1>
    <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
  </div>
</template>
