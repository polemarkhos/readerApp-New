import { userRepository } from "../../../server/repository/user"

export default defineEventHandler(async (event) => {

    const userData: any = {
        email: "john.doe@gmail.com",
        password: "12344",
        name: "John Doe",
    }

    const result = userRepository.createUser(userData);

    return {
        data: result
    }
})