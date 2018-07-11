var apps=require("quicky/q-apps");
module.exports = apps.createAppRoutes(__dirname)
.url([
  "/",
  "/login",
  "/system/users",
  "/system/user",
  "/system/email",
  "/system/email_testing",
  "/categories/production",
  "/categories/product",
  "/signout"
]
)
.router;