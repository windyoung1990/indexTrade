// 布林带策略
const fs = require('fs');
var bollData = require('./data/bollData');
var a50 = require('./data/a50');
// 保持数据长度一致性
a50.splice(0, 19)
var initMoney = 10000;
var buyed = false;
var result = [];
var referPrice = 'c'
for(var i=0; i < a50.length; i++) {
    var a50Item = a50[i];
    var bollItem = bollData[i];
    // 当天价格 
    var dayPrice = a50Item[referPrice];
    var tradeDay =  a50Item.d
    if (a50Item.d !== bollItem.t) {
        console.log('date not eq')
    } else {
        // 买入逻辑,价格小于布林带下轨
        if (!buyed && a50Item.c <= (bollItem.d)) {
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
        // 卖出逻辑 最高价价格大于布林带上轨
        if (buyed && a50Item.c > (bollItem.u ) ) {
            var lastOp = result[result.length - 1];
            var amount = lastOp.amount;
            initMoney = dayPrice * amount;
            buyed = false;
            result.push({
                op: 'sell',
                amount,
                index: i,
                tradeDay,
                total: initMoney,
                price: dayPrice
            })
        }
    }
    // 最后一次得卖出
    if (i === a50.length - 1 && buyed) {
        var lastOp = result[result.length - 1];
        buyed = false;
        initMoney = lastOp.amount *  dayPrice
        result.push({
            op: 'sell',
            amount:  lastOp.amount,
            tradeDay,
            total: initMoney,
            price: dayPrice
        })
    }
}
// console.log(result[result.length - 1], result.length)
fs.writeFileSync('./bollResult.js', JSON.stringify(result, null, '\t'))
// console.log(result)