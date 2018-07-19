var x=require("./index");
const Sequelize = require('sequelize');
x.setConfig("mysql://root:123456@localhost:3306/hrm1") 
var user=x.sequelize().define(
    'sys.users',{
        username:{
            type:Sequelize.STRING
        },
        password:{
            type:Sequelize.STRING
        }
    }
)

user.sync().then(x=>{
    console.log(x);
}).catch(ex=>{
    console.log(ex);
})
