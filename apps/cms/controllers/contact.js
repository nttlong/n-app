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
                    var msg=txtFormat(s.req.getAppRes("contact.success",`
                    Cảm ơn quý khách đã cung cấp cho chúng tôi thông tin liên hệ của quý khách.
                    Chúng tôi sẽ liên hệ với quý khác theo địa chỉ email {0} ngay khi chúng tôi có thể
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