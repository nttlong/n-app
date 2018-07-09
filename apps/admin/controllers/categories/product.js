var datetime=require("quicky/q-date-time");
var textFormat=require("quicky/q-text-format");
var qImage=require("quicky/q-image");
var path=require("path");
const uuidv1 = require('uuid/v1');
module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        var app=require("quicky/q-apps").getAppByDir(__dirname);
        
        return {
            load:(s,d)=>{

                s.product=require("./../models/product")(s.schema);
                d();
            },
            ajax:{
                getData:(s,d)=>{
                    if(s.postData.code){
                        var item=s.product.findOne("code=={0}",[s.postData.code]);
                        s.setValue(item);
                        d();
                    }
                    else {
                        s.setValue({
                            
                        });
                        d();
                    }

                },
                saveData:(s,d)=>{
                    var ret;
                
                    var image=s.postData.image;
                   
                    s.postData=s.postData.data;
                    var item=s.product.findOne("code=={0}",[s.postData.code]);
                    if(item){
                       s.postData.modifiedBy=s.req.getUser().username;
                       s.postData.modifiedOn=datetime.getNow();
                       s.postData.modifiedOnUTC=datetime.getUTCNow();
                       if(image){
                            var extFile=qImage.getExtOfFile(image.fileName);
                            var fileName=ret.data._id.toString()+"."+extFile;
                            qImage.saveBase64ImageToFileByApp(app,fileName,image.data);
                            s.postData.main_photo_id=fileName;
                        }
                       ret=s.product.updateOne(s.postData,"_id=={0}",[item._id]);
                    }
                    else {
                        s.postData.createdBy=s.req.getUser().username;
                        if(image){
                            var extFile=qImage.getExtOfFile(image.fileName);
                            var fileName=uuidv1()+"."+extFile;
                            qImage.saveBase64ImageToFileByApp(app,fileName,image.data);
                            s.postData.main_photo_id=fileName;
                        }
                        ret=s.product.insertOne(s.postData);
                        
                    }
                    if(ret.error){
                        if(ret.error.code==="missing"){
                            var fieldCaption=s.req.getAppRes("models."+s.product.model.name+"."+ret.error.fields[0],ret.error.fields[0]);
                            s.setValue("error_message",textFormat(s.req.getAppRes("Please enter field '{0}'"),fieldCaption));
                            s.setValue("error_field",ret.error.fields[0]);

                        }
                    }
                    else {
                        // if(image){
                        //     var extFile=qImage.getExtOfFile(image.fileName);
                        //     var fileName=ret.data._id.toString()+"."+extFile;
                        //     qImage.saveBase64ImageToFileByApp(app,fileName,image.data);
                        //     s.product.updateOne({main_photo_id:fileName},"_id=={0}",[ret.data._id]);
                        // }
                    }
                    d();

                }
            }
        }
    }
)