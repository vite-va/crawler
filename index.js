import jsdom from "jsdom";
import fs from "node:fs";

const { JSDOM } = jsdom;

let count = 916;

const mapModel = {
    racket: "vot-cau-long",
    shoes: "giay-cau-long",
    bag: "tui-vot-cau-long",
    shirt: "ao-cau-long"
};

let product_type_id = process.argv[2] == 'racket' ? 4 : (process.argv[2] == 'shoes' ? 5 : (process.argv[2] == 'bag' ? 6 : 7));
console.log("🚀 ~ product_type_id:", product_type_id)

const main = async () => {
    fs.writeFileSync(
        `${process.argv[2]}.cvs`,
        "product_type,name,description,price,pricesale,status,quantity,quantity_sold,created_at,last_updated,url\n"
    );

    const temp1 = [];
    for (let i = 1; i <= 30; i++) {
        temp1.push(getLinkProductPerPage(i));
    }
    const temp2 = await Promise.allSettled(temp1);
    const temp3 = temp2.map(({ value }) => value);

    const hrefList = temp3.flat();
    console.log({ hrefList });

    for (let i = 0; i < hrefList.length; i++) {
        const item = await getDataProductByLink(hrefList[i]);
    }
};

main();

console.log("🚀 ~ process.argv[2]:", process.argv[2])
async function getLinkProductPerPage(page = 1) {
    const hrefList = [];
    await JSDOM.fromURL(
        `${process.env.URL}${mapModel[process.argv[2]]}.html?page=${page}`,
        {}
    )
        .then((dom) => {
            const category =
                dom.window.document.getElementsByClassName("item_product_main");
            const length = category.length;
            for (let i = 0; i < length; i++) {
                hrefList.push(
                    category[i].children[1].children[0].children[0].href
                );
            }
        })
        .catch((e) => {
            return page;
        });
    return hrefList;
}

function getTextContent(element) {
    let text = '';
    for (let node of element.childNodes) {
      if (node.nodeType === 3) { // Node.TEXT_NODE
        text += node.textContent;
      } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
        text += getTextContent(node);
      }
    }
    return text;
  }

async function getDataProductByLink(item) {
    return JSDOM.fromURL(item)
        .then((dom) => {
            const productName =
                dom.window.document.getElementsByClassName("title-product")[0]
                    .innerHTML;
            
            const productDescription = dom.window.document.querySelectorAll('span[style="font-family:arial,helvetica,sans-serif"]')[1];
            const textDescription = getTextContent(productDescription).trim()

            const pricesale = dom.window.document.getElementsByClassName(
                "price product-price"
            )[0].innerHTML;
            const price = dom.window.document.getElementsByClassName(
                "price product-price-old"
            )[0].innerHTML;
            const status =
                dom.window.document.getElementsByClassName("a-stock")[0]
                    .innerHTML;

            const urlImage =
            dom.window.document.getElementsByClassName("img-responsive")[0].getAttribute('src');

            fs.appendFileSync(
                `${process.argv[2]}.cvs`,
                `INSERT INTO public.products_products (name, description, price, pricesale, status, quantity, quantity_sold, created_at, last_updated, product_type_id_id) VALUES ('${productName.replace(/'/g, "\"")}', '${textDescription.replace(/'/g, "\"")}', ${price.replace(/[^\d]/g, "")}, ${pricesale.replace(/[^\d]/g, "")}, '${status}', ${Math.round(Math.random() * 1000)}, ${Math.round(Math.random() * 100)}, '${new Date()}', '${new Date()}', ${product_type_id});\nINSERT INTO public.products_product_images (url, product_id) VALUES ('${urlImage}', ${count});\n`
            );

            count ++;
            
            return { productName, pricesale };
        })
        .catch((error) => {
            console.log("Error ===========> ", error.message);
            return item;
        });
}
