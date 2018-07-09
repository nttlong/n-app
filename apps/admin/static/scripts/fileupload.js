function fileReader(htmlFileInputElement){
    var me=this;
    me.fileEle=htmlFileInputElement;
    me._onChange=undefined;
    me.onChange=function(cb){
        me._onChange=cb;
        return me;
    }
    me.fileEle.addEventListener('change',function(evt){
        try {
            me.files = []
            var files=evt.target.files;
            for(var i=0;i<files.length;i++){
                me.files.push({
                    name:files[i].name,
                    lastModified:new Date(files[i].lastModified),
                    size:files[i].size,
                    file:files[i]
                })
            }
            if(me._onChange){
                me._onChange(null,me);
            }
        } catch (error) {
            if(me._onChange){
                me._onChange(error);
            }
        }
        
        
        
    });
    me.readFile=function(index,cb){
        if(!index) index=0;
        var reader = new FileReader();
        reader.onload=function(sender){
            cb(null,sender);
        }
        try {
            reader.readAsArrayBuffer(me.files[index].file);    
        } catch (error) {
            cb(error);
        }
        
    }
    me.readFileWithChunkSize=function(fileReader_readMethodName,chunkSize,fileIndex,callback,done,chunkIndex,chunks){
        if(!chunkIndex) {
            chunkIndex=0;
            me.info={
                readLen:0
            }
        } 
        if(!chunks) {
            chunks=me.getChunk(fileIndex,chunkSize);
            me.info.chunkLen=chunks.length;
        } 
        
        me.info.chunkIndex=chunkIndex;
        me.info.fileSize=me.files[fileIndex].size;
        me.info.fileName=me.files[fileIndex].name;

        
        if(chunkIndex==chunks.length){
            done(undefined, me);
            return;
        }
        var reader = new FileReader();
        var chunk=chunks[chunkIndex];
        me.info.readLen=chunk.end;
        reader.onloadend = function(evt) {
             if(evt.target.error!==null){
                done(evt.target.error);
             }
             callback( {
                 index:chunkIndex,
                 chunkLength:me.info.chunkLen,
                 readLength:me.info.readLen,
                 fileSize:me.info.fileSize,
                 fileName:me.info.fileName,
                 buffer:evt.target.result},function(){
                
                me.readFileWithChunkSize(fileReader_readMethodName,chunkSize,fileIndex,callback,done,chunkIndex+1,chunks);
             },done);
             

        }
        try {
            var blob = me.files[fileIndex].file.slice(chunk.start,chunk.end);
            reader[fileReader_readMethodName](blob);
        } catch (error) {
            done(error);    
        }
        
    }
    me.getChunk=function(index,chunkSizeInByte){
        if(chunkSizeInByte>me.files[index].size){
            return [{
                start:0,
                end:me.files[index].size
            }];
        }
        var ret=[];
        var chunkLen=Math.floor(me.files[index].size/chunkSizeInByte);
        for(var i=0;i<chunkLen;i++){
            ret.push({
                start:i * chunkSizeInByte,
                end:(i+1)*chunkSizeInByte
            })
        }
        if(me.files[index].size%chunkSizeInByte>1){
            ret.push({
                start:i*chunkSizeInByte,
                end:me.files[index].size
            })
        }
        return ret;

    }
    me.readAsArrayBuffer=function(fileIndex,chunkSize,callback,done){
        return me.readFileWithChunkSize("readAsArrayBuffer",chunkSize,fileIndex,callback,done);
    }
    me.readAsBinaryString=function(fileIndex,chunkSize,callback,done){
        return me.readFileWithChunkSize("readAsBinaryString",chunkSize,fileIndex,callback,done);
    }
    me.readAsDataURL=function(fileIndex,chunkSize,callback,done){
        return me.readFileWithChunkSize("readAsDataURL",chunkSize,fileIndex,callback,done);
    }
    me.readAsText=function(fileIndex,chunkSize,callback,done){
        return me.readFileWithChunkSize("readAsText",chunkSize,fileIndex,callback,done);
    }
}
function fileUpload(htmlFileInputElement){
    var me=this;
    me.reader=new fileReader(htmlFileInputElement);
    me._chunkSize=1024*1024/2;
    me.setChunkSize=function(value){
        me._chunkSize=value;
        return me;
    }
    
    me.setApiPath=function(apiPath){
        me._apiPath=apiPath;
        return me;
    }
    me.getApiPath=function(){
        return me._apiPath;
    }
    me.onPost=function(callback){
        me._onPost=callback;
        return me;
    }
    me.post=function(data,cb){
        me._onPost(data,cb);
    }
    me.done=function(callback){
        if(!me._onPost) throw("onPost was not set. \r\n"+
                                "Pease call 'onPost' with one one param is a function.\r\n"+
                                    "Example onPost(function(data,callback){\r\n"+
                                    "callback(ex,result)\r\n"+
                                    "})");
        if(!me._apiPath)  throw("api name for upload buffer chunk was not set. Pease call 'setUploadApi'");
        me.reader.onChange(function(err,result){
            if(err){
                callback(err);
                return;
            }
            me._done=callback;
            me.post({
                action:"register",
                fileName:me.reader.files[0].name,
                fileSize:me.reader.files[0].size
            }, function(ex,result){
                if(ex){
                    callback(ex);
                    return;
                }
                
                if(result.error){
                    callback(result.error);
                    return
                }
                try {
                    me.uploadId=result.data.id;
                    me.reader.readAsArrayBuffer(0,me._chunkSize,function(info,next,done){
                        debugger
                        me.post({
                            uploadId:me.uploadId,
                            action:"sent",
                            buffer:new Uint8Array(info.buffer),
                            index:info.index,
                            fileName:info.fileName

                        },function(ex,result){
                            if(ex){
                                callback(ex);
                                return;
                            }
                            next();
                        });
                    },function(err,result){
                        if(err){
                            callback(err);
                            return;
                        }
                        else {
                           
                            me.post({
                                uploadId:me.uploadId,
                                action:"commit",
                                fileName:me.reader.files[0].fileName
                            },function(result){
                                callback(null,result);
                            });
                        }
                    });
                } catch (error) {
                    callback(error);
                }
                

                
            });
        })



        
    }

}
function fileReader_test(){
    var f=$("<input type='file'/>").appendTo("body");
    var fileUploader=new fileUpload(f[0]);
    // fileUploader.setHost("http://localhost:3000")
    // .setRegisterApi("api/upload_file/resgister")
    // .setUploadApi("api/upload_file/sync")
    // .setFinishApi("api/upload_file/finish")
    fileUploader.setApiPath("upload_file")
    .onPost(function(data,cb){
            cb(undefined,data);
    })
    .done(function(err,result){
        if(err){
            throw(err);
        }

    })
    // var x=new fileReader(f[0]);
    // x.onChange(function(err,sender){
    //     console.log(x.getChunk(0,2*1024*1024))
    //     x.readAsArrayBuffer(0,1024*40,function(evt,next,done){
    //         console.log(evt);
    //         next();
    //     },function(err,result){
    //         console.log("Xong");
    //     })
    // });
    
}