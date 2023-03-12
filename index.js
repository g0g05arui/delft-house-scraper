const cheerio = require('cheerio');
const request = require('postman-request');
const { Telegraf } = require('telegraf');
const bot = new Telegraf('6096587498:AAHVjDrpTIUAQvrRhHsyeAsmflhVSk6VIco');

let oldData = [];
let newData=[];
let foundMax=false;

const scrapePageURLS = (options) => {
    request(options, function (error, response, body) {
        let $=cheerio.load(body);
        let searchResults=$('li[class=search-result] .search-result-main .search-result-thumbnail-container .search-result-media a');
        searchResults.each((i,el)=>{
            newData.push($(el).attr('href'));
        });
    });
};

const scrapePage= ()=>{

    const BASE_URL = 'https://www.funda.nl/huur/delft';
    newData=[];
    let options = {
        url: BASE_URL,
        headers: {
          'User-Agent': 'PostmanRuntime/7.29.2',
          'Connection':'keep-alive',      
        },
      };
    scrapePageURLS(options);
    for(let i=10;i>=2;i--){
        options={
            url: BASE_URL+`/p${i}`,
            headers: {
              'User-Agent': 'PostmanRuntime/7.29.2',
              'Connection':'keep-alive',      
            },
          };
        scrapePageURLS(options);
    }
    setTimeout(()=>{
        console.log(`Currently there are ${newData.length} houses for rent in Delft.`);
        let newHouses=0;
        let newHousesURLS=[];
        for(let i=0;i<newData.length;i++){
            if(!oldData.includes(newData[i])){
                newHouses++;
                newHousesURLS.push("https://www.funda.nl/"+newData[i]);
            }
        }
        console.log(`There are ${newHouses} new houses for rent in Delft.\n\n`);
        oldData=[...new Set([...oldData,...newData])];
        if(newHouses)
            bot.telegram.sendMessage(-1001939899189,`Currently there are ${newData.length} houses for rent in Delft.\nThere are ${newHouses} new houses for rent in Delft.:${newHousesURLS.join('\n\n')}`);
    },3000);
    
};

setInterval(scrapePage,60000);