const dashboardRoutes = require("./dashboard.route.js");
const productRoutes = require("./product.route.js");
const categoryProductRoutes = require("./categoryproducts.route.js");
const rolesRoutes = require("./roles.route.js");
const accountsRoutes = require("./account.route.js");
const authRoutes = require("./auth.route.js");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const myAccountRoutes = require("./my-account.route.js");
const orderRoutes = require("./order.route.js");
const settingRoutes = require("./setting.route.js");
const systemConfig = require("../../config/system");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(
    PATH_ADMIN + "/dashboard",
    authMiddleware.requireAuth,
    dashboardRoutes
  );
  app.use(PATH_ADMIN + "/products", authMiddleware.requireAuth, productRoutes);
  app.use(
    PATH_ADMIN + "/category-products",
    authMiddleware.requireAuth,
    categoryProductRoutes
  );
  app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, rolesRoutes);
  app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountsRoutes);
  app.use(PATH_ADMIN + "/auth", authRoutes);
  app.use(
    PATH_ADMIN + "/my-account",
    authMiddleware.requireAuth,
    myAccountRoutes
  );
  app.use(PATH_ADMIN + "/orders", authMiddleware.requireAuth, orderRoutes);
  app.use(PATH_ADMIN + "/setting", authMiddleware.requireAuth, settingRoutes);
};
