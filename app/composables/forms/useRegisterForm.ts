// composables/forms/useRegisterForm.ts
import {reactive, computed} from 'vue';
import {z, ZodError} from 'zod';

export function useRegisterForm() {
 const data = reactive({
  fullName: {value: '', error: ''},
  email: {value: '', error: ''},
  password: {value: '', error: ''},
  passwordConfirm: {value: '', error: ''},
  acceptTerms: {value: false, error: ''}
 });
 
 const validateFullName = () => {
  const schema = z.string()
   .min(2, "Name is too short")
   .max(50, "Name is too long");
  try {
   schema.parse(data.fullName.value);
   data.fullName.error = "";
  } catch (e: unknown) {
   data.fullName.error = (e as ZodError).issues[0].message;
  }
 };
 
 const validateEmail = () => {
  const schema = z.string().email("Invalid email address");
  try {
   schema.parse(data.email.value);
   data.email.error = "";
  } catch (e: unknown) {
   data.email.error = (e as ZodError).issues[0].message;
  }
 };
 
 const validatePassword = () => {
  const schema = z.string({message: "Password is required"}).min(6, "Password must be at least 6 characters");
  try {
   schema.parse(data.password.value);
   data.password.error = "";
  } catch (e: unknown) {
   data.password.error = (e as ZodError).issues[0].message;
  }
 };
 
 const validatePasswordConfirm = () => {
  if (data.password.value !== data.passwordConfirm.value) {
   data.passwordConfirm.error = "Passwords do not match";
  } else {
   data.passwordConfirm.error = "";
  }
 };
 
 const validateAcceptTerms = () => {
  if (!data.acceptTerms.value) {
   data.acceptTerms.error = "You must accept the terms";
  } else {
   data.acceptTerms.error = "";
  }
 };
 
 const isFormValid = computed(() => {
  return (
   data.fullName.value !== "" &&
   data.email.value !== "" &&
   data.password.value !== "" &&
   data.passwordConfirm.value !== "" &&
   data.acceptTerms.value &&
   data.fullName.error === "" &&
   data.email.error === "" &&
   data.password.error === "" &&
   data.passwordConfirm.error === "" &&
   data.acceptTerms.error === ""
  );
 });

 
 return {
  data,
  validateFullName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateAcceptTerms,
  isFormValid
 };
}