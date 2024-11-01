const createError = require("../utils/createError");
const prisma = require("../config/prisma");
const cloudinary = require('cloudinary').v2



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.create = async (req, res, next) => {
  try {
    const { title, description, price, quantity, images, categoryId } = req.body; 
    // เพื่อนำไปสร้าง product ใหม่

    const product = await prisma.product.create({
      data: {
        title: title,
        description: description, 
        price: parseFloat(price), // แปลง price จาก string เป็น float แล้วตั้งค่า price
        quantity: parseInt(quantity), // แปลง quantity จาก string เป็น integer แล้วตั้งค่า quantity
        categoryId: parseInt(categoryId), // แปลง categoryId จาก string เป็น integer แล้วตั้งค่า categoryId

        images: {
          create: images.map((item) => ({
            // ดึงข้อมูลจากภาพแต่ละภาพที่ได้จาก body แล้วสร้างข้อมูล image ในฐานข้อมูล
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product); 
  } catch (err) {
    next(err);
  }
};


exports.list = async (req, res, next) => {
  try {
    const { count } = req.params; // ดึงค่า count จาก URL parameters
    const products = await prisma.product.findMany({
      take: parseInt(count), // จำกัดจำนวนรายการสินค้าที่จะดึงตามค่าของ count
      orderBy: { createdAt: "desc" }, // จัดเรียงรายการสินค้าตามวันที่สร้างจากใหม่ไปเก่า
      include: {
        category: true, // ดึงข้อมูลหมวดหมู่
        images: true,   // ดึงข้อมูลรูปภาพ
      },
    });

    res.send(products); 
  } catch (err) {
    next(err); 
  }
};

exports.read = async (req, res, next) => {
  try {
    const { id } = req.params; // ดึงค่า id จาก URL parameters
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id) // ค้นหาสินค้าตาม id ที่ถูกส่งมา
      },
      include: {
        category: true, 
        images: true,   
      },
    });

    res.send(products); 
  } catch (err) {
    next(err); 
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, price, quantity, images, categoryId } = req.body; 
    // ดึงข้อมูลที่ถูกส่งมาเพื่อนำไปอัปเดต product

    await prisma.image.deleteMany({
      where: {
        productId: +req.params.id, // ลบข้อมูลรูปภาพทั้งหมดที่เชื่อมโยงกับสินค้าที่จะถูกอัปเดต
      },
    });

    const product = await prisma.product.update({
      where: {
        id: +req.params.id, // ระบุสินค้าที่จะอัปเดตตาม id ที่ส่งมาใน URL
      },
      data: {
        title: title, 
        description: description, 
        price: parseFloat(price), 
        quantity: parseInt(quantity), 
        categoryId: parseInt(categoryId), 

        images: {
          create: images.map((item) => ({
            // สร้างข้อมูลรูปภาพใหม่ที่เชื่อมโยงกับสินค้านี้
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product); 
  } catch (err) {
    next(err); 
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params; 

    // Step1 ค้นหาสินค้าและดึงข้อมูลรูปภาพที่เชื่อมโยงกับสินค้านั้น
    const product = await prisma.product.findFirst({
      where: { id: +id }, // ค้นหาสินค้าตาม id
      include: { images: true } // ดึงข้อมูลรูปภาพของสินค้ามาด้วย
    })

    if(!product){
      return createError(400,"Product not found") 
    }

    // Step2 ลบรูปภาพใน Cloudinary
    const deletedImage = product.images.map((image) =>  //ลูป ผ่านรายการรูปภาพที่เชื่อมโยงกับสินค้า (ข้อมูลรูปภาพอยู่ใน product.images).
      new Promise((resolve,reject) => {
        cloudinary.uploader.destroy(image.public_id, (error,result) => {  //ใช้ฟั่งชั่นของclound เพื่อลบแต่ละภาพ เมื่อทำงานสำเร็จลง sololve err ลง reject
          if(error) reject(error)
          else resolve(result) // ลบรูปภาพจาก Cloudinary ตาม public_id
        })
      })
    )

    await Promise.all(deletedImage); // รอให้รูปภาพทั้งหมดถูกลบออกจาก Cloudinary

    // Step3 ลบข้อมูลสินค้าในฐานข้อมูล
    await prisma.product.delete({
      where: {
        id: +id, // ลบสินค้าจากฐานข้อมูลตาม id
      },
    });

    res.send("Deleted Success"); 
  } catch (err) {
    next(err); 
  }
};


exports.listby = async (req, res, next) => {
  try {
    const { sort, order, limit } = req.body; // ดึงข้อมูลการจัดเรียง (sort) และจำนวน (limit) จาก body
    const products = await prisma.product.findMany({
      take: limit, // จำกัดจำนวนสินค้าตาม limit
      orderBy: { [sort]: order }, // จัดเรียงสินค้าโดยอิงจาก sort และ order (asc/desc)
      include: {
        category: true, // ดึงข้อมูลหมวดหมู่ของสินค้ามาด้วย
      },
    });

    res.send(products); 
  } catch (err) {
    next(err); 
  }
};

const hdlQuery = async (req, res, query, next) => {
  try {
    // ค้นหาโดย title ของผลิตภัณฑ์นั้นมีคำที่ตรงกับ query
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query, // ค้นหาผลิตภัณฑ์ที่ชื่อมีคำที่ตรงกับ query
        },
      },
      include: {
        category: true, // ดึงข้อมูล
        images: true,   
      },
    });
    res.send(products); 
  } catch (err) {
    next(err); 
  }
};



const hdlPrice = async (req, res, priceRange, next) => {
  try {
    // ค้นหาผลิตภัณฑ์ที่มีราคาตามช่วงราคา
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0], // ราคา >= ราคาต่ำสุด
          lte: priceRange[1], // ราคา <= ราคาสูงสุด
        },
      },
      include: {
        category: true, 
        images: true,   
      },
      orderBy: {
        price: 'asc', // เรียงลำดับราคาจากน้อยไปมาก
      },
    });
    res.send(products); 
  } catch (err) {
    next(err); 
  }
};


const hdlCategory = async (req, res, categoryId, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => +id),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    next(err);
  }
};


exports.searchFilters = async (req, res, next) => {
  try {
    
    const { query, category, price } = req.body;
    
    console.log(req.query)
    if (query) {
      console.log("query-->", query);
      await hdlQuery(req, res, query, next);
    }


    if (category) {
      console.log("query-->", category);
      await hdlCategory(req, res, category, next);
    }
    if (price) {
      console.log("query-->", price);
      await hdlPrice(req, res, price, next);
    }
    // res.send('hello searchFilter pro')
  } catch (err) {
    next(err);
  }
};



exports.createImages = async (req, res, next) => {
  try {
    
    const result = await cloudinary.uploader.upload(req.body.image, {
      // สร้างชื่อ public_id สำหรับรูปภาพโดยใช้เวลาเป็นฐาน
      public_id: `Camera-${Date.now()}`,
      resource_type: 'auto',
      folder: 'CameraStore'
    });

 
    res.send(result);
  } catch (err) {
    next(err)
  }
};

exports.removeImage = async (req, res, next) => {
  try {
    // ดึง public_id ของรูปภาพที่ต้องการลบจาก req.body
    const { public_id } = req.body;

    // ลบรูปภาพจาก Cloudinary โดยใช้ public_id
    cloudinary.uploader.destroy(public_id, (result) => {

      res.send('Remove Image Success');
    });
  } catch (err) {
    next(err);
  }
};