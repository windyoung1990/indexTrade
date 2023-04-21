var a50AllMa = require('./data/a50AllMa');
var a50 = require('./data/a50')

var initMoney = 10000;//初始化金额
var referMa = 20;// 默认参考30天均线
var referPrice = 'c';// 默认开盘价, o 开盘价 c  收盘价
var sellRate = 0.1;
var buyed = false;
var result = [];
// 删除a50多余的两项数据
a50.splice(0,2)
for(var i=0; i < a50.length; i++) {
    var a50Item = a50[i];
    var maItem = a50AllMa[i];
    // 当天价格 
    var dayPrice = a50Item[referPrice];
    var maPrice = maItem[`ma${referMa}`];
    let tradeDay =  a50Item.d
    // referMa日均线存在
    if(maPrice) {
        if(dayPrice < maPrice) {
            if(!buyed) {
                // 买入(刚卖出的情况，不应该再买入)
                var lastOp = result[result.length - 1];
                // 如果一开始没买，或者买入卖出后入又继续下跌20个点 应该买入
                if (!lastOp || dayPrice <= lastOp.price * (1-0.2)) {
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
                

            } else {
                // 是否超过止损，需要卖出
                var lastOp = result[result.length - 1];
                if (dayPrice < lastOp.price * (1-sellRate)) {
                    buyed = false;
                    initMoney = lastOp.amount *  dayPrice
                    result.push({
                        op: 'sell',
                        amount:  lastOp.amount,
                        index:i,
                        tradeDay,
                        total: initMoney,
                        price: dayPrice
                    })
                }
            }
        } else {
            // 如果买入，则考虑是否止盈卖出
            if (buyed) {
                var lastOp = result[result.length - 1];
                if (dayPrice > lastOp.price * (1 + 0.3)) {
                    // 
                    buyed = false;
                    initMoney = lastOp.amount *  dayPrice
                    result.push({
                        op: 'sell',
                        amount: lastOp.amount,
                        index: i,
                        tradeDay,
                        total: initMoney,
                        price: dayPrice
                    })
                }
            } else {
                // 同样存在刚卖出的时候，买入的情况，此时不应该再追高
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
console.log(result)
