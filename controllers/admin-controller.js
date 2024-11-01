const prisma = require("../config/prisma");

// ฟังก์ชันสำหรับเปลี่ยนสถานะการสั่งซื้อ (Change Order Status)
exports.changeOrderStatus = async (req, res, next) => {
  try {
    const { orderId, orderStatus } = req.body; 

    // อัพเดทสถานะการสั่งซื้อในฐานข้อมูล
    const orderUpdate = await prisma.order.update({
      where: { id: orderId }, // ระบุ id ของการสั่งซื้อที่ต้องการอัพเดท
      data: { orderStatus: orderStatus }, // อัพเดทสถานะใหม่ที่ต้องการเปลี่ยน
    });

  
    res.json(orderUpdate);
  } catch (err) {
    next(err);
  }
};

// ฟังก์ชันสำหรับดึงรายการสั่งซื้อทั้งหมดสำหรับแอดมิน (Get Orders for Admin)
exports.getOrderAdmin = async (req, res, next) => {
  try {
    // ดึงรายการสั่งซื้อทั้งหมดจากฐานข้อมูลพร้อมข้อมูลสินค้าและผู้สั่งซื้อ
    const orders = await prisma.order.findMany({
      include: {
        products: {  //เพราะในschema จากตาราง order  ไปเอา (ProductOnOrder -> Product)
          include: {
            product: true, // ดึงข้อมูลสินค้าที่อยู่ในคำสั่งซื้อ
          },
        },
        orderedBy: {
          select: {
            id: true, // แสดง id ของผู้สั่งซื้อ
            email: true, // แสดงอีเมลของผู้สั่งซื้อ
            address: true, // แสดงที่อยู่ของผู้สั่งซื้อ
          },
        },
      },
    });

   
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
