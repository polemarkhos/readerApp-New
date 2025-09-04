<template>
  <div>
    <CommonLogo class="h-[40px]"  />
    <h2 class="font-bold text-xl md:text-2xl my-4">
      Create a new account
    </h2>
    <form
        @submit.prevent="handleSubmitRegister"
        class="flex gap-4 flex-wrap">

      <div class="flex gap-4 w-full" >
        <div class="w-full" >
          <label class="text-sm block">Full Name</label>
          <InputText
              @blur="validateFullName()"
              v-model="data.fullName.value"
              :invalid="!!data.fullName.error"
              size="small" class="w-full"   type="text" name="full_name" placeholder="Full Name" />
        </div>
        <div class="w-full" >
          <label class="text-sm block">Email</label>
          <InputText
              @blur="validateEmail()"
              v-model="data.email.value"
              :invalid="!!data.email.error"
              size="small"  class="w-full" type="text" name="email" placeholder="useremail@gmail.com" />
        </div>
      </div>

      <div class="w-full">
        <label class="text-sm block">Password:</label>
        <InputText
            @blur="validatePassword()"
            v-model="data.password.value"
            :invalid="!!data.password.error"
            size="small" class="w-full" type="password" name="password" placeholder="Password" />
      </div>

      <div class="w-full">
        <label class="text-sm block">Confirm Password:</label>
        <InputText
            @blur="validatePasswordConfirm()"
            v-model="data.passwordConfirm.value"
            :invalid="!!data.passwordConfirm.error"
            size="small" class="w-full" type="password" name="password_confirm" placeholder="Confirm Password" />
      </div>

      <div class="flex gap-2 items-center">
        <Checkbox
            @change="validateAcceptTerms()"
            v-model="data.acceptTerms.value"
            size="small" inputId="terms" name="terms" :binary="true"  />
        <label
            for="terms" class="text-xs cursor-pointer">I agree to the terms of service and Privacy Policy</label>
      </div>

      <div class="error-message">
        <p class="text-[12px] text-red-500" v-if="!!data.fullName.error">{{ data.fullName.error }}</p>
        <p class="text-[12px] text-red-500" v-if="!!data.email.error">{{data.email.error}}</p>
        <p class="text-[12px] text-red-500" v-if="!!data.password.error">{{data.password.error}}</p>
        <p class="text-[12px] text-red-500" v-if="!!data.passwordConfirm.error">
          {{data.passwordConfirm.error}}
        </p>
      </div>

      <Button
          type="submit" :disabled="!isFormValid"
          class="text-sm md:text-md w-full justify-center h-[48px]">Sign Up</Button>
    </form>
  </div>
</template>

<script setup lang="ts">
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const error = ref<string | null>(null);
import {useRegisterForm} from "~/composables/forms/useRegisterForm";

const {
  data,
  validateFullName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateAcceptTerms,
  isFormValid
} = useRegisterForm();

const handleSubmitRegister = async () => {
  if( !isFormValid.value ) return;
  status.value = 'loading';

  const {fullName, email, password, acceptTerms} = data;

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName.value,
        email: email.value,
        password: password.value,
        // acceptTerms: acceptTerms.value,
      }),
    });
    navigateTo('/registerSuccess') // Navigate to success page.
  }catch (e: unknown) {
    status.value = 'error';
    error.value = (e as NuxtError).statusMessage ?? "An error occurred, please contact support.";
  } finally {
    if( status.value === 'loading' ){
      status.value = 'idle';
    }
  }
}

</script>