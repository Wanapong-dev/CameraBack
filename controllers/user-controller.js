const prisma = require("../config/prisma");
const createError = require("../utils/createError");


exports.listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { id, enabled } = req.body;

    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        enabled: enabled,
      },
    });
    res.send("Update Status Success");
  } catch (err) {
    next(err);
  }
};

exports.changeRole = async (req, res, next) => {
  try {
    const { id, role } = req.body;

    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        role: role,
      },
    });
    res.send("Update Role Success");
  } catch (err) {
    next(err);
  }
};

exports.userCart = async (req, res, next) => {
  try {
    const { cart } = req.body;  // ดึงข้อมูลตะกร้าสินค้าจาก body ของ request
    // console.log(cart);           
    console.log(req.user.id);   

    // ค้นหาผู้ใช้จากฐานข้อมูลด้วย ID ที่ได้จาก req.user.id
    const user = await prisma.user.findFirst({
      where: {
        id: +req.user.id, 
      },
    });
    console.log(user)

    // ลบรายการสินค้าเก่าที่อยู่ในตะกร้าของผู้ใช้
    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,  // ลบข้อมูลสินค้าที่อยู่ในตะกร้าตาม user ID
        },
      },
    });

    // ลบตะกร้าสินค้าเก่าของผู้ใช้
    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,  // ลบตะกร้าสินค้าที่มี user ID ตรงกับผู้ใช้นั้นๆ
      },
    });

    // เตรียมข้อมูลสินค้าใหม่ที่จะใส่ลงในตะกร้า
    let products = cart.map((item) => ({
      productId: item.id,       // ID ของสินค้า
      count: item.count,        // จำนวนสินค้าที่เลือก
      price: item.price,        // ราคาของสินค้า
    }));

    // คำนวณผลรวมของราคาทั้งหมดในตะกร้าสินค้า
    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,  // นำราคาสินค้า * จำนวน มาคำนวณเป็นผลรวม
      0  // เริ่มต้นจาก 0
    );

    console.log(cartTotal);  // แสดงผลรวมราคาตะกร้าสินค้าใน console เพื่อการตรวจสอบ

    // สร้างตะกร้าสินค้าใหม่และบันทึกในฐานข้อมูล
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,  // เพิ่มข้อมูลสินค้าที่เตรียมไว้ลงในตะกร้า
        },
        cartTotal: cartTotal,  // บันทึกผลรวมราคาของตะกร้าสินค้า
        orderedById: user.id,  // เชื่อมโยงตะกร้ากับผู้ใช้ที่มี ID ตรงกับ user ID
      },
    });

    res.send("Add cart Success ");  
  } catch (err) {
    next(err);  
  }
};


// ฟังก์ชัน getUserCart สำหรับดึงข้อมูลตะกร้าสินค้าของผู้ใช้
exports.getUserCart = async (req, res, next) => {
  try {
  
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,  // ใช้ user ID ที่ได้จาก req.user.id เพื่อหาตะกร้าสินค้าของผู้ใช้
      },
      include: {  
        products: {  // รวมข้อมูลของสินค้าที่อยู่ในตะกร้า
          include: {
            product: true,  // ดึงข้อมูลสินค้าทั้งหมดของแต่ละรายการในตะกร้า
          },
        },
      },
    });

    
    res.json({
      products: cart.products,  // รายการสินค้าที่อยู่ในตะกร้า
      cartTotal: cart.cartTotal,  // ยอดรวมของราคาสินค้าในตะกร้า
    });
  } catch (err) {
   
    next(err);
  }
};


exports.emptyCart = async (req, res, next) => {
  try {
    // ค้นหาตะกร้าของผู้ใช้ที่ล็อกอินอยู่
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,  // ใช้ user ID เพื่อค้นหาตะกร้าสินค้าของผู้ใช้
      },
    });

    
    if (!cart) {
      return createError(404, "Cart not found"); 
    }

    // ลบสินค้าในตะกร้าทั้งหมดโดยใช้ cartId
    await prisma.productOnCart.deleteMany({
      where: { cartId: cart.id },  // ลบสินค้าที่อยู่ในตะกร้า โดยอ้างอิง cartId
    });

    // ลบข้อมูลตะกร้าเองโดยใช้ user ID
    const rs = await prisma.cart.deleteMany({
      where: {
        orderedById: +req.user.id,  // ลบตะกร้าทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
      },
    });

    // ส่งข้อความยืนยันการล้างตะกร้าสำเร็จและจำนวนที่ลบไป
    res.json({
      message: "Cart Empty Success", 
      deletedCount: rs.count,  // ส่งจำนวนรายการที่ถูกลบในตะกร้า
    });
  } catch (err) {
    next(err);
  }
};



exports.saveAddress = async (req, res, next) => {
  try {
   
    const { address, name } = req.body;
    console.log(address);  

    // อัปเดตข้อมูลที่อยู่และชื่อของผู้ใช้ในฐานข้อมูล
    const addressUser = await prisma.user.update({
      where: {
        id: +req.user.id,  // อ้างอิง user ID ของผู้ใช้ที่ล็อกอินอยู่
      },
      data: {
        address: address,  // อัปเดตฟิลด์ที่อยู่ (address) ของผู้ใช้
        name: name,  // อัปเดตฟิลด์ชื่อ (name) ของผู้ใช้
      },
    });

 
    res.json({ ok: true, message: "Address update success" }); 
  } catch (err) {
  
    next(err);
  }
};



exports.saveOrder = async (req, res, next) => {
  try {
    // ดึงข้อมูลการชำระเงินจาก Stripe ที่ส่งมาจาก client
    const { id, amount, status, currency } = req.body.paymentIntent;

    // ดึงข้อมูลตะกร้าสินค้าของผู้ใช้ที่ล็อกอินอยู่
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,  // ค้นหาตะกร้าของผู้ใช้ตาม user ID
      },
      include: {
        products: true,  // รวมข้อมูลสินค้าในตะกร้าด้วย
      },
    });

    // ตรวจสอบว่าตะกร้าว่างหรือไม่
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: true, message: "Cart is Empty" }); // ถ้าไม่มีสินค้าในตะกร้า จะส่งข้อความแจ้งกลับไป
    }


    // โค้ดสำหรับตรวจสอบว่ามีสินค้าคงคลังเพียงพอหรือไม่
    // Check quantity
    // for(const item of userCart.products) {

    //     const product = await prisma.product.findUnique({
    //         where:{id: item.productId},
    //         select: {quantity:true, title:true}
    //     })

      

    //     if(!product || item.count > product.quantity) {
    //         return res.status(400).json({
    //             ok:false,
    //             message: `ขออถัย สินค้า ${product?.title || 'product'} หมด`
    //         })
    //     }
    // }



     // แปลงจำนวนเงินเป็นหน่วยบาท
    const amountTHB = Number(amount) / 100;

    // สร้างคำสั่งซื้อใหม่
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,  
            count: item.count,  
            price: item.price,  
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },  // เชื่อมโยงคำสั่งซื้อกับผู้ใช้
        },
        cartTotal: userCart.cartTotal,  // ราคารวมของตะกร้า
        stripePaymentId: id,  // ID การชำระเงินจาก Stripe
        amount: amountTHB,  // จำนวนเงินที่ชำระ
        status: status,  // สถานะการชำระเงิน (เช่น success, pending)
        currentcy: currency,  // สกุลเงินที่ใช้ในการชำระเงิน
      },
    });

    // อัปเดตจำนวนสินค้าและยอดขายในแต่ละสินค้า
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },  // ค้นหาสินค้าในฐานข้อมูลตาม productId
      data: {
        quantity: { decrement: item.count },  // ลดจำนวนสินค้าในคลัง
        sold: { increment: item.count },  // เพิ่มยอดขายของสินค้า
      },
    }));

    // อัปเดตข้อมูลสินค้าในฐานข้อมูล
    await Promise.all(
      update.map((updated) => prisma.product.update(updated))
    );

    // ลบข้อมูลตะกร้าสินค้าหลังจากที่คำสั่งซื้อถูกสร้างแล้ว
    await prisma.cart.deleteMany({
      where: { orderedById: +req.user.id },  // ลบตะกร้าสินค้าตาม user ID
    });

   
    res.json({ ok: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {

    // ค้นหาคำสั่งซื้อทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ โดยใช้ user ID
    const orders = await prisma.order.findMany({
      where: { orderedById: +req.user.id },  // ค้นหาคำสั่งซื้อโดยใช้ ID ของผู้ใช้ที่ล็อกอิน
      include: {
        products: {  // รวมข้อมูลสินค้าที่อยู่ในคำสั่งซื้อด้วย
          include: {
            product: true,  // ดึงข้อมูลสินค้ารายการนั้นๆ มาแสดง
          },
        },
      },
    });

    // ตรวจสอบว่าผู้ใช้มีคำสั่งซื้อหรือไม่
    if (orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });  
    }

   
    res.json({ ok: true, orders });
  } catch (err) {
    
    next(err);
  }
};
