const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const hrefList = [];

const main = async () => {
    await JSDOM.fromURL(`${process.env.URL}vot-cau-long.html?page=10`, {}).then(
        (dom) => {
            //   dom = dom.serialize();
            const category =
                dom.window.document.getElementsByClassName("item_product_main");
            const length = category.length;
            for (let i = 0; i < length; i++) {
                // console.log(
                //     category[i].children[1].children[0].children[0].href
                // );
                hrefList.push(
                    category[i].children[1].children[0].children[0].href
                );
            }
        }
    );

    const temp = hrefList.map(async (item) => {
        return JSDOM.fromURL(
            "https://shopvnb.com/vot-cau-long-pro-kennex-power-pro-705-trang-xanh-chinh-hang.html"
        )
            .then((dom) => {
                const productName =
                    dom.window.document.getElementsByClassName(
                        "title-product"
                    )[0].innerHTML;
                // console.log(productName);
                return productName;
            })
            .catch((error) => {
                console.log("Error ===========> ", error.message);
                return item;
            });
    });

    try {
        console.log(await Promise.allSettled(temp));
    } catch (error) {
        console.error(error);
    }
};

main();
