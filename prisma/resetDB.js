require('dotenv').config()
const prisma = require('../models')

async function run() {
	try{
		await prisma.$executeRawUnsafe('DROP DATABASE camera'),
		await prisma.$executeRawUnsafe('CREATE DATABASE camera')
	}catch(err){
		console.log(err)
	}
}

console.log('Reset DB...')
run()