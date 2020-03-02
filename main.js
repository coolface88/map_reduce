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

var fs = require('fs');

var path = require('path'); //Question 1


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

var toBrandName = function toBrandName(data) {
  return data.brandName;
};

var toBrandKey = function toBrandKey(key) {
  return String(key);
};

var byBrandName = pipelineQ3.on('data', function (data) {
  var brandList = R.map(toBrandName)(data.value);
  var brandCount = R.countBy(toBrandKey)(brandList);
  fs.writeFileSync('third.json', JSON.stringify(brandCount));
  console.log('Question 3 ... writing third.json file ... Done ');
}); //Question 4

var csvWriterQ4 = createCsvWriter({
  path: 'fourth.csv',
  header: [{
    id: 'image',
    title: 'image'
  }]
});
var reducerQ4 = reduce(function (acc, data) {
  var a = acc;
  var b = a;
  var flag = acc[0];

  if (flag && data.name === 'stringValue') {
    acc[1].push({
      image: data.value
    });
    acc[0] = false;
  }

  if (data.name === 'keyValue' && data.value === 'image') {
    acc[0] = true;
  }

  return b;
}, [false, []]);
var pipelineQ4 = chain([fs.createReadStream('lipstick.json'), parser(), reducerQ4]);

var extractFileName = function extractFileName(_ref) {
  var image = _ref.image;
  return {
    image: path.basename(image)
  };
};

reducerQ4.on('finish', function () {
  var files = R.map(extractFileName)(reducerQ4.accumulator[1]);
  var uniq = R.uniq(files);
  csvWriterQ4.writeRecords(uniq).then(function () {
    console.log('Question 4 ... writing fourth.csv file ... Done ');
  });
});
