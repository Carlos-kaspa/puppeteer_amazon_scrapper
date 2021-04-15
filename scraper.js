const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.amazon.com.br/');
  
  const searchWord = 'world of warcraft' // nome do produto a ser pesquisado

  await page.type('#twotabsearchtextbox',searchWord)

  await page.click('#nav-search-submit-button')

  await page.waitForSelector('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > h2> a > span')

  const result = await page.evaluate(()=>{

    const productName = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > h2> a > span')
    const productImage = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > span > a > div > img')
    const productPrice = document.querySelectorAll('[data-component-type=s-search-results] div.s-main-slot > [data-index] .sg-col-inner [cel_widget_id] div > div > div > div > a > .a-price > .a-offscreen')
    let resultProductData = []

    for(const [index,product] of productName.entries()){
      
         resultProductData.push({
            name: product.innerText,
            image: productImage[index].src,
            fullPrice:productPrice[index].innerText.replace('R$','').trim(),
            wholePrice: parseInt(productPrice[index].innerText.replace('R$','').split(',')[0]),
            fractionPrice:parseInt(productPrice[index].innerText.replace('R$','').split(',')[1]),
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

  fs.writeFile(`${slugify(searchWord)}-amazon.json`, JSON.stringify(result, null,2), err => {
    if(err){
        throw err
    } 
    console.log('file saved')

})
  await browser.close();

})();

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}