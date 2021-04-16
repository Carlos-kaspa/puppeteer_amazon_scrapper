const puppeteer = require('puppeteer');
const fs = require('fs');
const { ADDRGETNETWORKPARAMS } = require('dns');

(async () => {
  const searchWord = 'world of warcraft' // nome do produto a ser pesquisado

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.amazon.com.br/');
  

  await page.type('#twotabsearchtextbox',searchWord)

  await page.click('#nav-search-submit-button')

  await page.waitForSelector('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > h2> a > span')

  const result = await page.evaluate(()=>{

    const productName = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > h2> a > span')
    const productImage = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > span > a > div > img')
    const productPrice = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > div > a > .a-price > .a-offscreen')
    const productLink = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > span > a')
    let resultProductData = []

    for(const [index,product] of productName.entries()){
      
         resultProductData.push({
            name: product.innerText,
            image: productImage[index].src,
            fullPrice:productPrice[index].innerText.replace('R$','').trim(),
            wholePrice: parseInt(productPrice[index].innerText.replace('R$','').split(',')[0]),
            fractionPrice:parseInt(productPrice[index].innerText.replace('R$','').split(',')[1]),
            link:productLink[index].href
        })  
    }
    resultProductData.sort((a,b) => {
        if (a.fullPrice > b.fullPrice) {
          return 1;
        }
        if (a.fullPrice < b.fullPrice) {
          return -1;
        }
        // a must be equal to b
        return 0;
      })

    
      return resultProductData
   
  })

  await page.goto('https://www.americanas.com.br/');
  
  await page.type('#h_search-input',searchWord)

  await page.click('#h_search-btn')

  await page.waitForNavigation()
  //await page.waitForSelector('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > h2> a > span')
  const americanas = await page.evaluate(()=>{

    const unfilteredProductData = Array.from(document.querySelectorAll('#root > div > div > div:nth-of-type(3) div:nth-of-type(3) div div a span:nth-of-type(1)')).map(product => product.innerText)

    const productName = unfilteredProductData.map(data => {
      if(data.match(/[^0-9]/g) && data != 'sem avaliações'){
        return data
      } 
    })

    const productDiscoun = unfilteredProductData.map(data => {
      if(data.match(/\d\d+%/g)){
        return data
      } 
    })
    
  })

  fs.writeFile(`${slugify(searchWord)}-amazon.json`, JSON.stringify(result, null,2), err => {
    if(err){
        throw err
    } 
    console.log('file saved')

})
 //await browser.close();

})();

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}