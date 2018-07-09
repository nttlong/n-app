function register(req,res,next){
    res.end(JSON.stringify({data:{uploadId:"1"}}));
}
function uploadSync(req,res,next){
    res.end(JSON.stringify({data:{uploadId:"1"}}));
}
function uploadFinish(req,res,next){
    res.end(JSON.stringify({uploadId:"1",message:"xong"}));
}
module.exports={
    register:register,
    uploadSync:uploadSync,
    uploadFinish:uploadFinish
}