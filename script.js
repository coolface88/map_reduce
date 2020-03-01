const {chain}  = require('stream-chain');
const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {ignore} = require('stream-json/filters/Ignore');
const {streamValues} = require('stream-json/streamers/StreamValues');
const {reduce} = require('stream-chain/utils/Reduce');
const fs   = require('fs');

//Question 1
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'first.csv',
    header: [
        {id: 'productUrl', title: 'productUrl'},
        {id: 'price', title: 'price'},
        {id: 'originalPrice', title: 'originalPrice'},
        {id: 'skus', title: 'numberOfSKUs' }
    ]
});

const reducer = reduce((acc, value) => { 
  let a = acc;
  let b = a;
  acc.push({productUrl: value.productUrl, price: value.price, originalPrice: value.originalPrice, skus: value.skus.length});
  return b 
}, []);

const pipeline = chain([
  fs.createReadStream('lipstick.json'),
  parser(),
  pick({filter: 'mods'}),
  pick({filter: 'listItems'}),
  streamValues(),
  data => {
    const value = data.value;
    return value ? value : null;
  },
  reducer
]);

reducer.on('finish', () => {
  csvWriter.writeRecords(reducer.accumulator)
    .then(() => {
        console.log('Question 1 ... writing first.csv file ... Done ');
    });

});

//Question 2
const createCsvWriterQ2 = require('csv-writer').createArrayCsvWriter;

const csvWriterQ2 = createCsvWriterQ2({
    path: 'second.csv',
});

const reducerQ2 = reduce((acc, value) => { 
  let count = acc[1]
  if (value.skus.length > 2 && value.brandName === "OEM") {
    ++count;
    acc[0] = acc[0] + Number(value.price);
    acc[1] = count
  }
  let average = 0;
  if (count !== 0 ) {
    average = acc[0] / count;
  }
  acc[2] = average;
  return acc
}, [0,0,0]);

const pipelineQ2 = chain([
  fs.createReadStream('lipstick.json'),
  parser(),
  pick({filter: 'mods'}),
  pick({filter: 'listItems'}),
  streamValues(),
  data => {
    const value = data.value;
    return value ? value : null;
  },  
  reducerQ2
]);

reducerQ2.on('finish', () => {
  let a = []
  let result = a
  a.push([reducerQ2.accumulator[2]])
  csvWriterQ2.writeRecords(result)
    .then(() => {
        console.log('Question 2 ... writing second.csv file ... Done '); 
    }); 

});

//Question 3
const R = require('ramda');

const pipelineQ3 = chain([
  fs.createReadStream('lipstick.json'),
  parser(),
  pick({filter: 'mods'}),
  pick({filter: 'listItems'}),
  streamValues()
]);

const toBrandName = data => data.brandName 

const toBrandKey = key => String(key) 

const byBrandName = pipelineQ3.on('data', data => {
  let brandList =  R.map(toBrandName)(data.value)
  let brandCount = R.countBy(toBrandKey)(brandList)
  fs.writeFileSync('third.json', JSON.stringify(brandCount));
  console.log('Question 3 ... writing third.csv file ... Done ')
})



