const express = require('express'),
    app = express(),
    puppeteer = require('puppeteer'),
    cheerio = require('cheerio'),
    Push = require("pushover-notifications");

let p = new Push({
  user: process.env["PUSHOVER_USER"],
  token: process.env["PUSHOVER_TOKEN"],
});


app.get("/", async (request, response) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://codoil.com', { waitUntil: 'networkidle2' });
    await page.type('.input_box_second.home-control input[name=zipvalue]', '19063');
    await page.click('.zipBg .our_button button');
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    const content = await page.content();
    
    const html = cheerio.load(content);
    
    const priceLabel = ['100-149 gallons','150-199 gallons','200-299 gallons','300-499 gallons','500+ gallons'];
    const prices = [];
    html('#zipcodePriceSection .price').each(function(i) {
      prices.push({
        [priceLabel[i]]: html(this).text(),
      });
    });

    console.log(prices);
    
    let msg = {
      title: 'COD Oil - Today\'s Oil Price',
      message: prices[1]['150-199 gallons'],
      url: 'https://codoil.com'
    };
    
    p.send(msg, function (err, result) {
      if (err) {
        throw err;
      }

      console.log(result);
    });
    
    await browser.close();
    return response.send("success");
  } catch (error) {
    console.log(error);
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});