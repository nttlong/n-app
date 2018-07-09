var qMongo=require("quicky/q-mongo")
qMongo.model("jobs.candidate")
.fields(
    {
        CreatedBy : ["text",true,"application"],
        CreatedOn :["date",true,Date.now],
        CreatedOnUTC : ["date",true,Date.now],
        Description : "text",
        ModifiedBy : "text",
        ModifiedOn : "date",
        ModifiedOnUTC :"date",
        CLFile : {
            $type:"object",
            $isRequire:false,
            $detail:{
                IDRefAttachment : ["object",true],
                FileName : ["text",true],
                MineType :["text",true],
                CreatedBy : ["text",true],
                CreatedOn : ["date",true],
                CreatedOnUTC :["date",true]
            }
        },
        CVFile : {
            $type:"object",
            $require:false,
            $detail:{
                IDRefAttachment : ["object",true],
                FileName : ["text",true],
                MineType :["text",true],
                CreatedBy : ["text",true],
                CreatedOn : ["date",true],
                CreatedOnUTC :["date",true]
            }
        },
        Headline : "text",
        Overview : "text",
        Username : ["text",true],
        DesireMajor : {
            JobCode : ["text",false],
        },
        IsDynamicResidency : ["bool",true,false],
        IsDynamicTrip : ["bool",true,false],
        PhotoFilePath :"text",
        Sex : "bool",
        Nationality : {
            Code : "text"
        },
        BirthDate :"date",
        Mobile : "text",
        Tel : "text",
        FullAddress : "text",
        Location : {
            $type:"object",
            $detail:{
                ProvinceCode:["text",true],
                DistrictCode:["text",true]
            }  
        },
        IsAllowSearch : ["bool",true,false],
        TotalRecruiterReviews : ["number",true,[]],
        RecruiterReviews :{
            $type:"array",
            $detail:{
                Node:"text",
                RecruiterCode:["text",true],
                ViewDate:["date",true],
                ViewDateUTC:["date",true]
            }
        },
          
        IsAutoReceiveNews : ["bool",true,false],
        MarriageStatus : {
            Code:["text",false]
        },
        CurrentJobCode : ["text",false],
        Experience :{
            $isRequire:false,
            $type:"array",
            $detail:{
                FromMonth:["date",true],
                ToMonth:["date",true],
                Location:{
                    ProvinceCode:["text",true],
                    DistrictCode:["text",true]
                },
                JobCode:["text",true],
                Description:"text"
            }
        },
        Degree :{
            $type:"array",
            $detail:{
                FromMonth:["date",true],
                ToMonth:["date",true],
                Major : ["text",true],
                MajorLevel : ["text",true],
                SchoolName : ["text",true],
                IsGraduated : ["bool",true],
                IsMainCer : ["bool",true],
                Note : "text",
                Rank : "Good",
                GraduatedOn:"date"
                
            }
        },
        PhotoId : "object",
        CurrentJobName :"text",
        FirstName : ["text",true],
        LastName :  ["text",true],
        Title :  ["text",true],
        CurrentJob : "text",
        Desier : {
            $type:"object",
            $require:false,
            $detail:{
                Currentcy:["text",true],
                Income:["number",true],
                Location:{
                    ProvinceCode:["text",true],
                    ProvinceName:["text",true]
                },
                Job:{
                    JobCode:["text",true],
                    GroupJobCode:["text",true]
                }
            }
        },
        RecentInfo : {
            $type:"object",
            $detail:{
                Job : ["text",true],
                CompanyName:["text",true]
            }
        },
        TotalExpYear : ["number",true],
        TopDegree : "text"
        
    }
)
.indexes([
    {
        Username:1
    }
])
.onBeforeInsert(function(data){

//     "AllowSearch"
// 1:"TotalRecruiterReviews"
// 2:"RecruiterReviews"
// 3:"CurrentJobCode"
// 4:"Experience"
// 5:"Degree"
// 6:"FirstName"
// 7:"LastName"
// 8:"Title"
// 9:"TotalExpYear"

    data.CreatedBy=data.CreatedBy||"application";
    data.CreatedOn=new Date();
    data.CreatedOnUTC=new Date();
    data.IsDynamicResidency=data.IsDynamicResidency||false;
    data.IsAutoReceiveNews=data.IsAutoReceiveNews||false;
    data.IsDynamicTrip=data.IsDynamicTrip||false;
    data.IsGraduated=data.IsGraduated||false;
    data.IsAllowSearch=data.IsAllowSearch||false;
    data.TotalRecruiterReviews=0;
    data.Experience=data.Experience||[];
    data.Degree=data.Degree||[];
    data.TotalExpYear=data.TotalExpYear||0;
    data.RecruiterReviews=data.RecruiterReviews||[];


    
}).onBeforeUpdate(function(data){
    data.CreatedBy=data.ModifiedBy||"application";
    data.ModifiedOn=new Date();
    data.ModifiedOnUTC=new Date();
});

module.exports=function(schema){
    return qMongo.collection(schema,"jobs.candidate");
}
