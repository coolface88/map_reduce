"use strict";

var _require = require('stream-chain'),
    chain = _require.chain;

var _require2 = require('stream-json'),
    parser = _require2.parser;

var _require3 = require('stream-json/filters/Pick'),
    pick = _require3.pick;

var _require4 = require('stream-json/filters/Ignore'),
    ignore = _require4.ignore;

var _require5 = require('stream-json/streamers/StreamValues'),
    streamValues = _require5.streamValues;

var _require6 = require('stream-chain/utils/Reduce'),
    reduce = _require6.reduce;

var fs = require('fs'); //Question 1


var createCsvWriter = require('csv-writer').createObjectCsvWriter;

var csvWriter = createCsvWriter({
  path: 'first.csv',
  header: [{
    id: 'productUrl',
    title: 'productUrl'
  }, {
    id: 'price',
    title: 'price'
  }, {
    id: 'originalPrice',
    title: 'originalPrice'
  }, {
    id: 'skus',
    title: 'numberOfSKUs'
  }]
});
var reducer = reduce(function (acc, value) {
  var a = acc;
  var b = a;
  acc.push({
    productUrl: value.productUrl,
    price: value.price,
    originalPrice: value.originalPrice,
    skus: value.skus.length
  });
  return b;
}, []);
var pipeline = chain([fs.createReadStream('lipstick.json'), parser(), pick({
  filter: 'mods'
}), pick({
  filter: 'listItems'
}), streamValues(), function (data) {
  var value = data.value;
  return value ? value : null;
}, reducer]);
reducer.on('finish', function () {
  csvWriter.writeRecords(reducer.accumulator).then(function () {
    console.log('Question 1 ... writing first.csv file ... Done ');
  });
}); //Question 2

var createCsvWriterQ2 = require('csv-writer').createArrayCsvWriter;

var csvWriterQ2 = createCsvWriterQ2({
  path: 'second.csv'
});
var reducerQ2 = reduce(function (acc, value) {
  var count = acc[1];

  if (value.skus.length > 2 && value.brandName === "OEM") {
    ++count;
    acc[0] = acc[0] + Number(value.price);
    acc[1] = count;
  }

  var average = 0;

  if (count !== 0) {
    average = acc[0] / count;
  }

  acc[2] = average;
  return acc;
}, [0, 0, 0]);
var pipelineQ2 = chain([fs.createReadStream('lipstick.json'), parser(), pick({
  filter: 'mods'
}), pick({
  filter: 'listItems'
}), streamValues(), function (data) {
  var value = data.value;
  return value ? value : null;
}, reducerQ2]);
reducerQ2.on('finish', function () {
  var a = [];
  var result = a;
  a.push([reducerQ2.accumulator[2]]);
  csvWriterQ2.writeRecords(result).then(function () {
    console.log('Question 2 ... writing second.csv file ... Done ');
  });
}); //Question 3

var R = require('ramda');

var pipelineQ3 = chain([fs.createReadStream('lipstick.json'), parser(), pick({
  filter: 'mods'
}), pick({
  filter: 'listItems'
}), streamValues()]);
var byBrandName = pipelineQ3.on('end', function (data) {
  //console.log(data.value.brandName)
  var arr = data.value;
  return R.groupWith(function (a, b) {
    return R.equals(a.brandName, b.brandName);
  }, arr);
});
console.log(byBrandName);

var countProducts = function countProducts(acc, _ref) {
  var nid = _ref.nid;

  if (nid) {
    return acc++;
  }
};

var toBrandName = function toBrandName(_ref2) {
  var brandName = _ref2.brandName;
  return brandName;
};

var reducerQ3 = function reducerQ3(a) {
  return R.reduceBy(countProducts, 0, toBrandName, a);
};

var mapOver = R.lift(function (a) {
  return reducerQ3(a);
}); //mapOver(byBrandName)
