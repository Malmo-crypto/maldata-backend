const User = require("../models/User");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedToken");


/* =========================
   REGISTER (HARDENED)
========================= */

exports.register = async (req, res) => {
  try {

    const { name, email, password, phone } = req.body;


    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        error: "All fields (name, email, password, phone) are required"
      });
    }


    const existingUser = await User.findOne({ email });


    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered"
      });
    }


    const hashedPassword =
      await bcrypt.hash(password, 10);



    const user = await User.create({

      name,
      email,
      phone,
      password: hashedPassword,
      role: "user"

    });



    let wallet =
      await Wallet.findOne({
        userId:user._id
      });



    if(!wallet){

      wallet = await Wallet.create({

        userId:user._id,
        balance:0,
        ledger:[]

      });

    }



    const token = jwt.sign(

      {
        userId:user._id,
        role:user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn:"7d"
      }

    );



    return res.status(201).json({

      message:"Account created successfully",

      token,


      user:{

        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role

      },


      wallet:{

        balance:wallet.balance

      }

    });



  } catch(err){

    return res.status(500).json({

      error:err.message

    });

  }

};





/* =========================
   LOGIN (HARDENED)
========================= */


exports.login = async(req,res)=>{

try{


const {
email,
password
}=req.body;



if(!email || !password){

return res.status(400).json({

error:"Email and password are required"

});

}



const user =
await User.findOne({email});



if(!user){

return res.status(404).json({

error:"User not found"

});

}



const isMatch =
await bcrypt.compare(
password,
user.password
);



if(!isMatch){

return res.status(400).json({

error:"Invalid credentials"

});

}




let wallet =
await Wallet.findOne({
userId:user._id
});



if(!wallet){

wallet = await Wallet.create({

userId:user._id,
balance:0,
ledger:[]

});

}




const token = jwt.sign(

{
userId:user._id,
role:user.role
},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}

);



return res.json({

message:"Login successful",

token,


user:{

id:user._id,
name:user.name,
email:user.email,
phone:user.phone,
role:user.role

},


wallet:{

balance:wallet.balance

}


});



}catch(err){

return res.status(500).json({

error:err.message

});

}


};







/* =========================
   LOGOUT
========================= */


exports.logout = async(req,res)=>{

try{


const token =
req.headers.authorization?.split(" ")[1];



if(!token){

return res.status(400).json({

error:"No token provided"

});

}



const decoded =
jwt.decode(token);



if(!decoded){

return res.status(400).json({

error:"Invalid token"

});

}




await BlacklistedToken.create({

token,

expiresAt:
new Date(decoded.exp * 1000)

});




return res.json({

message:"Logout successful"

});



}catch(err){


return res.status(500).json({

error:err.message

});


}


};