<!-- components/forms/Register.vue -->
<template>
  <div>
    <CommonLogo class="h-[40px]"  />
    <h2 class="font-bold text-xl md:text-2xl my-4">
      Create a new account
    </h2>
    <form class="flex gap-4 flex-wrap">

      <div class="flex gap-4 w-full" >
        <div class="w-full" >
          <label class="text-sm block">Full Name</label>
          <InputText size="small" class="w-full"   type="text" name="full_name" placeholder="Full Name" />
        </div>
        <div class="w-full" >
          <label class="text-sm block">Email</label>
          <InputText size="small"  class="w-full" type="text" name="email" placeholder="useremail@gmail.com" />
        </div>
      </div>

      <div class="w-full">
        <label class="text-sm block">Password:</label>
        <InputText size="small" class="w-full" type="password" name="password" placeholder="Password" />
      </div>

      <div class="w-full">
        <label class="text-sm block">Confirm Password:</label>
        <InputText size="small" class="w-full" type="password" name="password_confirm" placeholder="Confirm Password" />
      </div>

      <div class="flex gap-2 items-center">
        <Checkbox size="small" inputId="terms" name="terms" :binary="true"  />
        <label for="terms" class="text-xs cursor-pointer">I agree to the terms of service and Privacy Policy</label>
      </div>

      <div class="error-message">
        <p class="text-[12px] text-red-500">The email is invalid</p>
      </div>

      <Button class="text-sm md:text-md w-full justify-center h-[48px]">Sign Up</Button>
    </form>
  </div>
</template>