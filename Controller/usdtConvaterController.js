// const usdtconvater = async (req, res) => {
//   try {
//     const binanceRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         asset: "USDT",
//         fiat: "BDT",
//         merchantCheck: false,
//         page: 1,
//         payTypes: ["BANK"],
//         publisherType: null,
//         rows: 1,
//         tradeType: "SELL",
//       }),
//     });

//     const data = await binanceRes.json();

//     if (!data.data || data.data.length === 0) {
//       return res.status(500).json({ error: "Rate not found" });
//     }

//     const rate = parseFloat(data.data[0].adv.price);
//     return res.status(200).json({ rate });
//   } catch (error) {
//     console.error("Rate fetch error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// module.exports = usdtconvater;



// backend/Controller/usdtConvaterController.js
const fetch = require("node-fetch");

const usdtconvater = async (req, res) => {
  try {
    const response = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: "USDT",
        fiat: "BDT",
        merchantCheck: false,
        page: 1,
        payTypes: ["BANK"],
        publisherType: null,
        rows: 1,
        tradeType: "SELL", // আমরা USDT বিক্রি করছি BDT নেওয়ার জন্য
      }),
      timeout: 5000
    });

    const result = await response.json();

    if (result?.data?.length > 0) {
      const rate = parseFloat(result.data[0].adv.price);
      res.status(200).json({ rate });
    } else {
      res.status(500).json({ message: "Rate not found" });
    }
  } catch (err) {
    console.error("Rate fetch error:", err);
    res.status(500).json({ message: "Failed to fetch USDT rate" });
  }
};

module.exports = usdtconvater;
