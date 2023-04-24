const fs = require('fs');
const axios = require('axios')

const {licence} = require('./config')
var initMoney = 10000;//初始化金额
var referMa = 20;// 默认参考30天均线
var referPrice = 'o';// 默认开盘价, o 开盘价 c  收盘价
var buyed = false;
var result = [];
let totalTime = 0;
var code = '000993';
async function getDataAndop() {

    var getStockMa = await axios.get(`https://ig507.com/data/time/history/ma/${code}/Day?licence=${licence}`)
    var getStockData = await axios.get(`https://ig507.com/data/time/history/trade/${code}/Day?licence=${licence}`)
    // 个股数据
    singleStock = getStockData;
    // ma数据
    stockMa = getStockMa
    // 删除singleStock多余的两项数据
    // singleStock.splice(0,2)// 年化利率 739.19%
    for(var i=0; i < stockMa.length; i++) {
        var singleStockItem = singleStock[i];
        var maItem = stockMa[i];
        // 当天价格 
        var dayPrice = singleStockItem[referPrice];
        var maPrice = maItem[`ma${referMa}`];
        let tradeDay =  singleStockItem.d
    
        if (!buyed && maItem.ma5 > maItem.ma10  ) {
            var lastOp = result[result.length - 1];
            // 上次卖出的收盘价不等于今天的开盘价，考虑买入，避免来回买卖的情况
            if (!lastOp || lastOp.price !== dayPrice) {
                buyed = true;
                var amount = initMoney / dayPrice;
                result.push({
                    op: 'buy',
                    amount,
                    index: i,
                    tradeDay,
                    total:initMoney,
                    price: dayPrice
                })
            }
        }
        if (buyed && singleStockItem.c < maItem.ma10 ) {
            var lastOp = result[result.length - 1];
            buyed = false;
            initMoney = lastOp.amount *  singleStockItem.c;
            totalTime += new Date(tradeDay + ' 00:00:00').getTime() - new Date(lastOp.tradeDay + ' 00:00:00').getTime()
            result.push({
                op: 'sell',
                amount:  lastOp.amount,
                index:i,
                tradeDay,
                total: initMoney,
                price: singleStockItem.c,
                isProfit: singleStockItem.c > lastOp.price 
            })
        }
        // 最后一次得卖出
        if (i === singleStock.length - 1 && buyed) {
            var lastOp = result[result.length - 1];
            buyed = false;
            initMoney = lastOp.amount *  singleStockItem.c
            totalTime += new Date(tradeDay + ' 00:00:00').getTime() - new Date(lastOp.tradeDay + ' 00:00:00').getTime()
    
            result.push({
                op: 'sell',
                amount:  lastOp.amount,
                tradeDay,
                total: initMoney,
                price: singleStockItem.c,
                isProfit: singleStockItem.c > lastOp.price 
            })
        }
        
    }
    console.log(result[result.length - 1])
    fs.writeFileSync(`./result/${code}Result.js`, JSON.stringify(result, null, '\t'))
    // console.log(totalTime/(1000*60*60*24))
}
getDataAndop(code)


