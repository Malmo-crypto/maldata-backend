const {
    calculateAirtimeProfit,
    calculateDataProfit,
    calculateDepositProfit
} = require("./services/profitEngine");



console.log("========== AIRTIME TEST ==========");


const airtime = calculateAirtimeProfit({

    faceValue: 100,

    network: "MTN"

});


console.log(airtime);





console.log("========== DATA TEST ==========");


const data = calculateDataProfit({

    costPrice: 563,

    network: "MTN"

});


console.log(data);





console.log("========== DEPOSIT TEST ==========");


const deposit1 = calculateDepositProfit({

    amount: 10000

});


console.log("Deposit ₦10,000");

console.log(deposit1);




const deposit2 = calculateDepositProfit({

    amount: 50000

});


console.log("Deposit ₦50,000");

console.log(deposit2);