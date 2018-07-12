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
                    createdOn:1,
                    name:1,
                    description:1,
                    code:1
                });
                qr.sort({
                    createdOn:-1
                })
                qr.limit(9);
                var items=qr.toArray();
                s.setValue("images",items);
                s.setValue("topProducts",items);
                d();

            }
        }
    }
)
