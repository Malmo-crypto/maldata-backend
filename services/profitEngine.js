const pricing = require("../config/pricing");

/**
 * Calculate airtime profit
 */
exports.calculateAirtimeProfit = ({ faceValue, network }) => {
  const discountMap = {
    MTN: 0.97,
    GLO: 0.92,
    AIRTEL: 0.97,
    T2: 0.93,
    "9MOBILE": 0.97
  };

  const costPrice = faceValue * (discountMap[network] || 0.97);
  const sellPrice = faceValue; // or you can add markup later
  const profit = sellPrice - costPrice;

  return {
    costPrice: Number(costPrice.toFixed(2)),
    sellPrice,
    profit: Number(profit.toFixed(2))
  };
};

/**
 * Calculate data profit
 */
exports.calculateDataProfit = ({ costPrice, network }) => {
  const markupMap = {
    MTN: 0.08,
    GLO: 0.10,
    AIRTEL: 0.08,
    "9MOBILE": 0.12
  };

  const markup = markupMap[network] || 0.1;

  const sellPrice = costPrice + costPrice * markup;
  const profit = sellPrice - costPrice;

  return {
    costPrice,
    sellPrice: Number(sellPrice.toFixed(2)),
    profit: Number(profit.toFixed(2))
  };
};

/**
 * Calculate deposit profit
 */
exports.calculateDepositProfit = ({ amount }) => {
  let fee = 0;

  if (amount < 20000) {
    fee = amount * 0.005; // 0.5%
  } else {
    fee = 100; // flat fee
  }

  return {
    amount,
    fee: Number(fee.toFixed(2)),
    walletCredit: amount,
    profit: Number(fee.toFixed(2))
  };
};