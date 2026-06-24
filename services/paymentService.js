const axios = require("axios");


exports.initializePayment = async ({
  email,
  amount,
  reference
}) => {


const response = await axios.post(

`${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,

{
email,

amount: amount,

reference

},

{
headers:{
Authorization:
`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"
}

}

);


return response.data;

};