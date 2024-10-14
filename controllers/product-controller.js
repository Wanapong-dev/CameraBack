const createError = require("../utils/createError");
const prisma = require("../config/prisma");


exports.create = async (req, res, next) => {
  try {
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    // console.log(title, description,price,quantity,images)
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
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
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
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

exports.read = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: +id,
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
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    // console.log(title, description,price,quantity,images)

    await prisma.image.deleteMany({
      where: {
        productId: +req.params.id,
      },
    });

    const product = await prisma.product.update({
      where: {
        id: +req.params.id,
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
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

    // delete photo
    await prisma.product.delete({
      where: {
        id: +id,
      },
    });

    res.send("Deleted Success");
  } catch (err) {
    next(err);
  }
};

exports.listby = async (req, res, next) => {
  try {
    const { sort, order, limit } = req.body;
    console.log(sort, order, limit);
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
      },
    });

    res.send(products);
  } catch (err) {
    next(err);
  }
};

const hdlQuery = async (req, res, query, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
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

const hdlPrice = async (req, res, priceRange, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
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
