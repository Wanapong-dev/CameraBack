require('dotenv').config()
const prisma = require('../config/prisma')

async function run() {
	try{
		await prisma.$executeRawUnsafe('DROP DATABASE cameratest1'),
		await prisma.$executeRawUnsafe('CREATE DATABASE cameratest1')
	}catch(err){
		console.log(err)
	}
}

console.log('Reset DB...')
run()