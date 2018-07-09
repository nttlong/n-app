var x=require("../q-system");
require("./q-system/models").connect("mongodb://root:123456@localhost:27017/hrm");
 try {
    // var ret=x.createUser.sync({
    //     username:"sys",
    //     password:"sys",
    //     displayName:"System administrator",
    //     isSysAdmin:true,
    //     isStaff:true,
    //     createdBy:"system"

    // });
    
    var ret=x.login.sync({
        username:"sys",
        password:"sys"
    })
    // var ret=x.findUser.sync({
    //     username:"sys"
    // })
    console.log(ret);
    // for(var i=0;i<10;i++){
    //     var ret=x.createUser.sync({
    //         username:"sys",
    //         password:"123456"
    //     });
    //     console.log(i,ret);    
    // }
} catch (error) {
    console.log(error);
}
