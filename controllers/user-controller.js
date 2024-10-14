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
    const { cart } = req.body;
    console.log(cart);
    console.log(req.user.id);

    const user = await prisma.user.findFirst({
      where: {
        id: +req.user.id,
      },
    });
    console.log(user);

    // delete old Cart Item
    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });

    // delete old Cart
    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    // เตรียมสินค้า
    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    // หาผลรวม
    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    console.log(cartTotal);

    // new cart
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });

    res.send("Add cart Success ");
  } catch (err) {
    next(err);
  }
};

exports.getUserCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (err) {
    next(err);
  }
};

exports.emptyCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,
      },
    });

    if (!cart) {
      return createError(404, "Cart not found");
    }
    await prisma.productOnCart.deleteMany({
      where: { cartId: cart.id },
    });

    const rs = await prisma.cart.deleteMany({
      where: {
        orderedById: +req.user.id,
      },
    });

    res.json({
      message: "Cart Empty Success",
      deletedCount: rs.count,
    });
  } catch (err) {
    next(err);
  }
};

exports.saveAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    console.log(address);
    const addressUser = await prisma.user.update({
      where: {
        id: +req.user.id,
      },
      data: {
        address: address,
      },
    });

    res.json({ ok: true, message: "Address update success" });
  } catch (err) {
    next(err);
  }
};

exports.saveOrder = async (req, res, next) => {
  try {
    // get user cart
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: +req.user.id,
      },
      include: {
        products: true
      },
    });


    // Check empty
    if(!userCart || userCart.products.length === 0) {
        return res.status(400).json({ ok: true, message : "Cart is Empty"})
    }

    // Check quantity
    for(const item of userCart.products) {

        const product = await prisma.product.findUnique({
            where:{id: item.productId},
            select: {quantity:true, title:true}
        })

      

        if(!product || item.count > product.quantity) {
            return res.status(400).json({
                ok:false,
                message: `ขออถัย สินค้า ${product?.title || 'product'} หมด`
            })
        }
    }

    // crete new order
    const order = await prisma.order.create({
        data: {
            products: {
                create: userCart.products.map((item)=> ({
                    productId: item.productId,
                    count: item.count,
                    price: item.price
                }))
            },
            orderedBy: {
                connect: {id: req.user.id}
            },
            cartTotal: userCart.cartTotal
        }
    })

    // update product
    const update = userCart.products.map((item)=>({
        where : { id: item.productId},
        data:{
            quantity: { decrement: item.count},
            sold: {increment: item.count}
        }
    }))
    console.log(update)

    await Promise.all(
        update.map((updated)=> prisma.product.update(updated))
    )

    await prisma.cart.deleteMany({
        where:{orderedById : +req.user.id }, 
    })

    res.json({ ok:true,order})
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {

    const orders = await prisma.order.findMany({
        where: { orderedById: +req.user.id },
        include: {
            products:{
                include:{
                    product: true
                }
            }
        }
    })

    if(prisma.order.length === 0) {
        return res.status(400).json({ ok: false, message: "No orders"})
    }

    res.json({ok: true, orders})
  } catch (err) {
    next(err);
  }
};
