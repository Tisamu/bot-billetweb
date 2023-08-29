import puppeteer, {Browser, ElementHandle, Frame, Page} from 'puppeteer';
import ParamsLoader from "./paramsLoader";

const paramsLoader = new ParamsLoader(`${__dirname}/../scrapper-data.json`);
const PARAMS = paramsLoader.loadParams();

let CART_READY = false;

const huntTicket = async (page: Page, ticketText: string) => {
    if (CART_READY) {
        return;
    }

    const nextBtn = await page.waitForSelector(".nextButton input");

    try {
        const ticketElement = await page.waitForSelector(`.click_to_add.shop_step1_ticket[data-name=\"${ticketText}\"]`,
            {timeout: 100});
        await ticketElement?.click();
        await nextBtn?.click();
        console.log("FOUND !");
        await page.bringToFront();
        CART_READY = true;
    } catch (e) {
        await page.reload();
        await huntTicket(page, ticketText);
    }
}

const instantiateHunt = async (browser: Browser) => {

    const page = await browser.newPage();
    await page.goto(PARAMS.url);
    //TODO: Hunt every tickets of the list
    await huntTicket(page, PARAMS.tickets[0].text);
}

const main = async (headless: boolean) => {
    const browser = await puppeteer.launch({headless});

    for (let i = 0; i < PARAMS.tabs; i++) {
        instantiateHunt(browser).catch(e => {
            throw new Error(e)
        });
    }

}

// TODO: Load data depending of the file args
main(false);