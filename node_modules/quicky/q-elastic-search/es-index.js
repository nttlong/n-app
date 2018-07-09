var sync=require("../q-sync");
function es_indexes(client,index,type){
    var me=this;
    me.index=index;
    me.type=type;
    me.create=function(id,body,callback){
        sync.exec((cb)=>{
                client.create({
                    index:me.index,
                    type:me.type,
                    body:body,
                    id:id
                }).then(function(result){
                    cb(null,result);
                }).catch(function(ex){
                    cb(ex);
                });
        },callback);
        // function run(cb){
        //     client.create({
        //         index:me.index,
        //         type:me.type,
        //         body:body,
        //         id:id
        //     }).then(function(result){
        //         cb(null,result);
        //     }).catch(function(ex){
        //         cb(ex);
        //     });
        // }
        // if(callback){
        //     run(callback);
        // }
        // else {
        //     return sync.sync(run,[]);
        // }
    }
    me.delete=function(id,callback){
        sync.exec(function(cb){
            client.delete({
                index:me.index,
                type:me.type,
                id:id
            }).then(function(result){
                cb(null,result);
            }).catch(function(ex){
                cb(ex);
            });
        },callback);
    }
    me.exists=function(id,callback){
        sync.exec(function(cb){
            client.exists({
                index: me.index,
                type: me.type,
                id: id
              }).then(function(res){
                  cb(null,res);
              }).catch(function(ex){
                  cb(ex);
    
              });
        },callback);
    }
    me.searchText=function(text,callback){
        sync.exec(function(cb){
            client.msearch({
                body: [
                  // match all query, on all indices and types
                  {},
                  { query: { match_all: {} } },
              
                  // query_string query, on index/mytype
                  { 
                      index: me.index,
                      type: me.type
                     },
                  { query: { query_string: { query: text } } }
                ]
              }).then(function(res){
                  cb(null,res);
              }).catch(function(ex){
                  cb(ex);
              })
        },callback);
    }
   
    me.count=function(){

    }
}
module.exports=es_indexes