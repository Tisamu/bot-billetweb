import puppeteer, {Browser, ElementHandle, Frame, Page} from 'puppeteer';
import ParamsLoader from "./paramsLoader";
import {Ticket} from "./types";

const paramsLoader = new ParamsLoader(`${__dirname}/../datas/test-shop.json`);
const PARAMS = paramsLoader.loadParams();

let CART_READY = false;

const getMaxAuthorizedOfTickets = async (ticketElement: ElementHandle<Element>): Promise<number> => {
    const optionsNumber = await ticketElement?.$$eval(
        ".shop_step1_quantity_select",
        el => (el[0] as HTMLSelectElement).options.length
    );

    return optionsNumber - 1; // -1 because there is an option for "0"
}

const getCurrentTicketsCount = async (ticketElement: ElementHandle<Element>): Promise<number> => {
    return parseInt(await ticketElement?.$$eval(
        ".shop_step1_quantity_select",
        el => (el[0] as HTMLSelectElement).value
    ));
}

const addTicketToCart = async (ticketElement: ElementHandle<Element>): Promise<void> => {
    const addBtn = await ticketElement?.waitForSelector(".shop_step1_quantity_icon_add");
    await addBtn?.click();
}

const huntTicket = async (page: Page, ticket: Ticket) => {
    if (CART_READY) {
        return;
    }

    const nextBtn = await page.waitForSelector(".nextButton input");
    if (!nextBtn) throw new Error("Cannot found the next Button, it means tickets list is not rendered correctly :(")

    try {
        const ticketElement = await page.waitForSelector(`.click_to_add.shop_step1_ticket[data-name=\"${ticket.text}\"]`,
            {timeout: 100});

        if (!ticketElement) throw new Error("Ticket not found");

        const actualMax = Math.min(await getMaxAuthorizedOfTickets(ticketElement), ticket.count);
        console.log("The max is ", actualMax);

        while (await getCurrentTicketsCount(ticketElement) < actualMax) {
            await addTicketToCart(ticketElement);
        }

        await nextBtn?.click();
        console.log("FOUND !");
        await page.bringToFront();
        CART_READY = true;
    } catch (e) {
        await page.reload();
        await huntTicket(page, ticket);
    }
}

const instantiateHunt = async (browser: Browser) => {

    const page = await browser.newPage();
    await page.goto(PARAMS.url);
    //TODO: Hunt every tickets of the list
    await huntTicket(page, PARAMS.tickets[0]);
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