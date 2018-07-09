module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            ajax:{
                getListOfCustomers:(s,n)=>{
                    var customer=require("./../../models/customers")();
                    var items=customer.find();
                    s.setValue(items);
                    n();
                }
            }
        }
    }
)