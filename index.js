import jsdom from "jsdom";
import fs from "node:fs";

const { JSDOM } = jsdom;

const mapModel = {
    racket: "vot-cau-long",
    cloth: "",
    shoe: "",
};

const main = async () => {
    fs.writeFileSync(
        "test.cvs",
        "product_type, name, description, price, pricesale, status, quantity, quantity_sold, created_at, last_updated\n"
    );

    const temp1 = [];
    for (let i = 1; i <= 10; i++) {
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

async function getDataProductByLink(item) {
    return JSDOM.fromURL(item)
        .then((dom) => {
            const productName =
                dom.window.document.getElementsByClassName("title-product")[0]
                    .innerHTML;
            const pricesale = dom.window.document.getElementsByClassName(
                "price product-price"
            )[0].innerHTML;
            const price = dom.window.document.getElementsByClassName(
                "price product-price-old"
            )[0].innerHTML;
            const status =
                dom.window.document.getElementsByClassName("a-stock")[0]
                    .innerHTML;

            fs.appendFileSync(
                "test.cvs",
                `${
                    process.argv[2]
                }, ${productName}, ${price}, ${pricesale}, ${status}, ${Math.round(
                    Math.random() * 1000
                )}, ${Math.round(
                    Math.random() * 100
                )}, ${Date.now()}, ${Date.now()}\n`
            );
            return { productName, pricesale };
        })
        .catch((error) => {
            console.log("Error ===========> ", error.message);
            return item;
        });
}
