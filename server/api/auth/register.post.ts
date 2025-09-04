//server/api/auth/register.post.ts
import {validateRegisterUser} from "../../validators";
import {userRepository} from "../../repository/User";

export default defineEventHandler(async (event) => {
 const bodyData = await readBody(event); // 1
 
 await validateRegisterUser(bodyData); // 2

 await userRepository.createUser(bodyData); // 3
 
 return {
  status: 201,
  message: "User registered successfully"
 }
})