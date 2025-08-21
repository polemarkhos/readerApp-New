// server/repository/user.ts
import { Prisma, PrismaClient, User } from "@prisma/client"

class UserRepository {
    constructor(private readonly prisma: PrismaClient) { }
    async createUser(userData: Pick<User, "email" | "password" | "name">) {
        try {
            return await this.prisma.user.create({
                data: userData,
                select: {
                    id: true,
                    email: true,
                    name: true,
                }
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `User with this ${e.meta?.target} already exists.`
                    })
                }
            }
            throw createError({
                statusCode: 400,
                statusMessage: 'Unknown prisma error.'
            })
        }
    }
}

export const userRepository = new UserRepository(new PrismaClient());