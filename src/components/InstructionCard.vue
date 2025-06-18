<script lang="ts" setup>
// No props needed for this static component
</script>

<template>
  <div class="grid grid-cols-1 gap-3 text-sm">
    <div class="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
      <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      </div>
      <div>
        <p class="font-medium">Vette Tekst</p>
        <p class="text-muted-foreground">Selecteer tekst en klik de Vet knop of gebruik Ctrl+B</p>
      </div>
    </div>
  </div>
</template>
