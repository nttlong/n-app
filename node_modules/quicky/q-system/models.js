var db=require("../q-mongo")

module.exports={
    connect:db.connect,
    users:require("./db.users"),
    sessions:require("./db.session")

}