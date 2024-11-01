const prisma = require('../config/prisma'); 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // เรียกใช้ Stripe SDK โดยใช้ secret key จากไฟล์ environment

exports.getConfig = (req, res, next) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // ส่ง publishable key กลับไปที่ client เพื่อใช้งานในฝั่งหน้าเว็บ
    });
};

exports.createPayment = async (req, res, next) => {
    try {
        // ดึงข้อมูลตะกร้าสินค้าของผู้ใช้ที่ล็อกอินอยู่โดยใช้ Prisma
        const cart = await prisma.cart.findFirst({
            where: {
                orderedById: req.user.id // ค้นหาตะกร้าของผู้ใช้ตาม user ID
            }
        });

        console.log(cart); // แสดงข้อมูล cart เพื่อการตรวจสอบ

        // แปลงยอดรวมในตะกร้าเป็นสตางค์ (หน่วยเล็กสุดที่ Stripe ใช้)
        const amountTHB = cart.cartTotal * 100;

        // สร้าง PaymentIntent ใน Stripe โดยระบุยอดเงินและสกุลเงิน
        const paymentIntent = await stripe.paymentIntents.create({ 
            amount: amountTHB, // จำนวนเงินที่ต้องชำระในสตางค์
            currency: "thb", // สกุลเงิน THB (เงินบาท)

            // เปิดใช้งานวิธีการชำระเงินอัตโนมัติของ Stripe
            automatic_payment_methods: {
              enabled: true,
            },
        });

        // ส่ง clientSecret กลับไปที่ client เพื่อใช้ในขั้นตอนการชำระเงิน
        res.send({
            clientSecret: paymentIntent.client_secret, // secret key สำหรับทำธุรกรรมการชำระเงิน
        });
       
    } catch (err) {
        
        next(err);
    }
};
