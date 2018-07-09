module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            ajax:{
                getData:(s,d)=>{
                    var emailSettings=require("quicky/q-email");
                    var ret=emailSettings.getSettings();
                    s.setValue(ret);
                    d();
                },
                saveData:(s,d)=>{
                    var emailSettings=require("quicky/q-email");
                    var ret=emailSettings.setSettings(s.postData);
                    s.setValue(ret);
                    d();
                }
            }
        }
    }
)