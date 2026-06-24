const Transaction =
require("../models/Transaction");



exports.createTransaction = async(data)=>{

return await Transaction.create(data);

};



exports.updateTransaction = async({
reference,
status,
providerResponse
})=>{


return await Transaction.findOneAndUpdate(

{reference},

{
status,
providerResponse
},

{
new:true
}

);

};