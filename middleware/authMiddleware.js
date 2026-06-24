const jwt=require("jsonwebtoken");
const BlacklistedToken=require("../models/BlacklistedToken");


module.exports = async(req,res,next)=>{

try{


const token =
req.headers.authorization?.split(" ")[1];


if(!token){

return res.status(401).json({
error:"No token"
});

}


// check logout token

const blocked =
await BlacklistedToken.findOne({token});


if(blocked){

return res.status(401).json({
error:"Session expired, login again"
});

}



const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);



req.user=decoded;


next();


}catch(err){

res.status(401).json({
error:"Unauthorized"
});

}

};