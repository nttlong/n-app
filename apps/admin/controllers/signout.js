module.exports=require("quicky/q-controller")
(__filename,
    (s)=>{
        var sessionID=s.req.sessionID;
        var sys=require("quicky/q-system");
        var ret=sys.signOut(s.req.tenancySchema,sessionID);
        return {
            load:(s,d)=>{
                s.redirect(s.req.getAppUrl())
            }
        }
    });