const https = require('https');

https.get('https://dashebeauty.com/shop/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    // Regex to match li.product
    const products = [];
    const productRegex = /<li[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    while ((match = productRegex.exec(data)) !== null && products.length < 8) {
      const pData = match[1];
      
      const titleMatch = pData.match(/<h2[^>]*woocommerce-loop-product__title[^>]*>([^<]+)<\/h2>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
      
      const priceMatch = pData.match(/<span class="woocommerce-Price-amount amount"><bdi>(?:<span[^>]*>[^<]+<\/span>)?([\d.,]+)/i);
      const price = priceMatch ? priceMatch[1].trim() : '0.000';
      
      const imgMatch = pData.match(/<img[^>]*src="([^"]+)"/i);
      const img = imgMatch ? imgMatch[1] : '';
      
      products.push({ title, price, image: img });
    }
    console.log(JSON.stringify(products, null, 2));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
