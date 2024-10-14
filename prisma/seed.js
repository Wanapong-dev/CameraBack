const prisma = require ("../config/prisma");
const bcrypt = require('bcryptjs')

const hashedPassword = bcrypt.hashSync('123456', 10)


const User = [
	{
        email: "ball1@gmail.com",
        username: "ball",
        password: hashedPassword
    }

]

console.log('DB seed...')

async function run() {
	await prisma.user.createMany({ data: User })
}

run()