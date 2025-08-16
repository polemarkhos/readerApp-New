<!-- components/blocks/ToLogin.vue -->
<template>
  <div
      class="bg-register-pattern bg-contain relative w-full p-6 md:p-12 md:pb-4 flex h-[100%] items-center justify-center flex-col text-center md:rounded-tr-md md:rounded-br-md overflow-hidden">
    <div
        class=" bg-gradient-to-tl from-blue-700 to-violet-800 absolute top-0 left-0 w-full h-full z-0 opacity-80"></div>
    <div class="flex flex-col gap-4 grow items-center justify-center relative z-2 text-white">
      <h2 class="text-xl md:text-2xl font-bold">
        Already have an account?
      </h2>
      <p class="text-sm md:text-md">Sign in and continue your experience</p>
      <Button
          class="border-white text-white text-sm md:text-md min-w-[130px] justify-center h-[48px]" outlined >Sign
        in</Button>
    </div>
    <p class="grow-0 text-[12px] mt-4 relative z-2 text-white ">Need Help?
      <NuxtLink>support@suppport.com</NuxtLink></p>
  </div>
</template>