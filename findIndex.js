var a50AllMa = require('./data/mddlAllMa');
var a50 = require('./data/mddl')
var indexA50 = a50.findIndex((item) => item.d.indexOf('2021') > -1)
var indexMa = a50AllMa.findIndex((item) => item.t.indexOf('2021') > -1)
a50.splice(0,indexA50);
a50AllMa.splice(0,indexMa);

console.log(a50[0], a50AllMa[0], indexA50, indexMa)