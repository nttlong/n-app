module.exports=require("quicky/q-controller")(
    __filename,
    (s)=>{
        var products=require("./../../admin/controllers/models/product")(s.req.tenancySchema)
        return {
            load:(s,d)=>{
                var qr=products.aggregate()
                .project({
                    _id:0,
                    photoId:"main_photo_id",
                    createdOn:1
                });
                qr.sort({
                    createdOn:-1
                })
                var item=qr.toArray();
                s.setValue("images",items);
                d();

            }
        }
    }
)
