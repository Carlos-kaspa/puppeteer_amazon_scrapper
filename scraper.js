const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.amazon.com.br/');
  //await page.screenshot({ path: 'example.png' });
  await page.type('#twotabsearchtextbox','Igora 9-7 Tinta')

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

      console.log('RESULTADO', resultProductData)
      return resultProductData
   
  })

  fs.writeFile('tinta-igora-amazon.json', JSON.stringify(result, null,2), err => {
    if(err){
        throw err
    } 
    console.log('file saved')

})
  await browser.close();

})();