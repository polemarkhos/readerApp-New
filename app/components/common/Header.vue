<!-- components/common/header.vue -->
<template>
  <div class="shadow-[0_12px_20px_-15px_rgba(0,0,0,0.1)] mb-4">
    <div class="container mx-auto flex p-4 justify-between">
      <CommonLogo class="h-[40px]" />
      <div>
        <NuxtLink to="/login">
          <Button size="small" class="mr-4" text label="Sign In" />
        </NuxtLink>
        <NuxtLink to="/register">
          <Button size="small" label="Sign Up" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>