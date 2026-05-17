const https = require('https');
const fs = require('fs');

const products = [];
let currentPage = 1;
let maxPages = 20; // safe guard

function fetchPage(page) {
    const url = page === 1 ? 'https://dashebeauty.com/shop/' : `https://dashebeauty.com/shop/page/${page}/`;
    console.log(`Fetching ${url}...`);
    
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            if (resp.statusCode === 404 || !data.includes('li class="product')) {
                console.log(`Finished scraping. Total products: ${products.length}`);
                fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
                return;
            }

            const productRegex = /<li[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
            let match;
            let addedCount = 0;
            while ((match = productRegex.exec(data)) !== null) {
                const pData = match[1];
                
                const titleMatch = pData.match(/<h2[^>]*woocommerce-loop-product__title[^>]*>([^<]+)<\/h2>/i);
                const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
                
                const priceMatch = pData.match(/<span class="woocommerce-Price-amount amount"><bdi>(?:<span[^>]*>[^<]+<\/span>)?([\d.,]+)/i);
                let price = priceMatch ? priceMatch[1].trim() : '0.000';
                
                let imgMatch = pData.match(/<img[^>]*src="([^"]+)"/i);
                let img = imgMatch ? imgMatch[1] : '';
                
                // Try to get higher res image by removing -300x300.webp or similar if exists
                if (img) {
                    img = img.replace(/-\d+x\d+(\.\w+)$/, '$1');
                }

                // Check for duplicates
                if (!products.find(p => p.title === title)) {
                    products.push({ title, price, image: img });
                    addedCount++;
                }
            }
            
            console.log(`Added ${addedCount} products from page ${page}`);
            
            if (addedCount > 0 && page < maxPages) {
                fetchPage(page + 1);
            } else {
                console.log(`Finished scraping. Total products: ${products.length}`);
                fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
            }
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    });
}

fetchPage(1);
