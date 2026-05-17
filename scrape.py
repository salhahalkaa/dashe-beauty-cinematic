import urllib.request
import json
from bs4 import BeautifulSoup

try:
    req = urllib.request.Request('https://dashebeauty.com/shop/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    products = soup.select('li.product')
    
    scraped = []
    for p in products[:8]:
        title_el = p.select_one('.woocommerce-loop-product__title')
        price_el = p.select_one('.woocommerce-Price-amount bdi')
        img_el = p.select_one('img')
        link_el = p.select_one('a.woocommerce-LoopProduct-link')
        
        title = title_el.text.strip() if title_el else 'N/A'
        price = price_el.text.strip() if price_el else 'N/A'
        img = img_el.get('src') if img_el else 'N/A'
        link = link_el.get('href') if link_el else 'N/A'
        
        scraped.append({
            'title': title,
            'price': price,
            'image': img,
            'link': link
        })
        
    print(json.dumps(scraped, indent=2))
except Exception as e:
    print('Error:', e)
