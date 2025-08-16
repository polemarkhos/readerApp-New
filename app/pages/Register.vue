<!-- pages/Register.vue -->
<script setup lang="ts">
  definePageMeta({
    layout: 'identity',
  })
</script>
<template>
  <div
    class="mt-10 overflow-hidden grid max-w-[980px] md:max-h-[600px] md:h-[100vh] mx-auto items-center sm:grid-cols-1 md:grid-cols-2 mb-8 md:mb-0">
    <FormRegister
        class="p-6 md:p-12 border h-full border-gray-200 border-bottom-none md:border-bottomm md:border-right-none md:rounded-tl-md md:rounded-bl-md "/>
    <BlocksToLogin />
  </div>
</template>