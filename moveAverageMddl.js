const fs = require('fs');
var a50AllMa = require('./data/mddlAllMa');
var a50 = require('./data/mddl')

var initMoney = 10000;//初始化金额
var referMa = 20;// 默认参考30天均线
var referPrice = 'o';// 默认开盘价, o 开盘价 c  收盘价
var buyed = false;
var result = [];
let totalTime = 0;
// 删除a50多余的两项数据
// a50.splice(0,2) //年化率8222.07
// 最近两年的数据 年化率 133.45%

// a50.splice(0,4870)
// a50AllMa.splice(0,4868)
// 最近三年 年化率 128.50%

a50.splice(0,4627)
a50AllMa.splice(0,4625)
for(var i=0; i < a50AllMa.length; i++) {
    var a50Item = a50[i];
    var maItem = a50AllMa[i];
    // 当天开盘价格 
    var dayPrice = a50Item[referPrice];
    var maPrice = maItem[`ma${referMa}`];
    let tradeDay =  a50Item.d

    if (!buyed && maItem.ma5 > maItem.ma10 ) {
        var lastOp = result[result.length - 1];
        // 上次卖出的收盘价不等于今天的开盘价，考虑买入，避免来回买卖的情况
        if (!lastOp || lastOp.price !== dayPrice) {
            buyed = true;
            var amount = initMoney / dayPrice;
            // 开盘买入
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
    if (buyed && a50Item.c < maItem.ma5 ) {
        var lastOp = result[result.length - 1];
        buyed = false;
        initMoney = lastOp.amount *  a50Item.c;
        totalTime += new Date(tradeDay + ' 00:00:00').getTime() - new Date(lastOp.tradeDay + ' 00:00:00').getTime()
        result.push({
            op: 'sell',
            amount:  lastOp.amount,
            index:i,
            tradeDay,
            total: initMoney,
            price: a50Item.c,
            isProfit: a50Item.c > lastOp.price 
        })
    }
    // 最后一次得卖出
    if (i === a50.length - 1 && buyed) {
        var lastOp = result[result.length - 1];
        buyed = false;
        initMoney = lastOp.amount *  a50Item.c
        totalTime += new Date(tradeDay + ' 00:00:00').getTime() - new Date(lastOp.tradeDay + ' 00:00:00').getTime()

        result.push({
            op: 'sell',
            amount:  lastOp.amount,
            tradeDay,
            total: initMoney,
            price: a50Item.c,
            isProfit: a50Item.c > lastOp.price 
        })
    }
    
}
console.log(result[result.length - 1])
fs.writeFileSync('./result/moveMddlResult.js', JSON.stringify(result, null, '\t'))
// console.log(totalTime/(1000*60*60*24))

