module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            load:(s,d)=>{
                d();
            },
            post:(s,d)=>{
                try {
                    var contacts=require("./../../admin/controllers/models/contact");
                    var data=s.postData;
                    var ret=contacts(s.schema).insertOne(data);
                    s.setValue(data);
                    var txtFormat=require("quicky/q-text-format")
                    var msg=txtFormat(s.req.getAppRes("feedback.success",`
                    Cảm ơn quý vị thực hiện thao tác này. Chúng tôi sẽ liên hệ với quý vị ngay khi nhận được thông tin này
                    `),data.email)
                    s.setValue("success",msg.trim().replace(/\n|\r/g, ""));
                    d();
                } catch (error) {
                    var msg=s.req.getAppRes("contact.error",`
                    Thật đáng tiếc chúng tôi không thể tiếp nhận thông tin
                    từ quý khách vào lúc này.
                    `)
                    s.setValue("error",msg.trim().replace(/\n|\r/g, ""));
                    d();
                }
                
            }
        }
    }
)