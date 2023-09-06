import puppeteer, { Browser, ElementHandle, Frame, Page } from 'puppeteer';
import ParamsLoader from "./paramsLoader";
import { Ticket } from "./types";


const paramsLoader = new ParamsLoader(`${__dirname}/../datas/${process.argv[2] || "default"}.json`);
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

const removeTicketFromCart = async (ticketElement: ElementHandle<Element>): Promise<void> => {
    const addBtn = await ticketElement?.waitForSelector(".shop_step1_quantity_icon_remove");
    await addBtn?.click();
}

const retriggerPages = async (page: Page) => {
    const pages = await page.browser().pages()
    for (let page of pages) {
        await page.bringToFront();
    }
}

const huntTickets = async (page: Page, tickets: Array<Ticket>) => {
    if (CART_READY) {
        return;
    }

    await page.bringToFront(); // Activate tab

    const nextBtn = await page.waitForSelector(".nextButton input");
    if (!nextBtn) throw new Error("Cannot found the next Button, it means tickets list is not rendered correctly :(")

    try {

        const ticketsElements: ElementHandle<Element>[] = await page.$$(".click_to_add.shop_step1_ticket")
        let foundAtLeastOneTicket = false;

        // Adjust quantities
        for (let ticket of tickets) {
            for (let ticketElement of ticketsElements) {
                const ticketDataName = await ticketElement.evaluate(el => el.getAttribute("data-name"));
                console.log("Ticket element is ", ticketDataName);
                console.log("Comparing : ", ticketDataName, "and", ticket.text);
                if (tickets.find(t => t.text === ticketDataName)) {
                    foundAtLeastOneTicket = true;
                    const actualMax = Math.min(await getMaxAuthorizedOfTickets(ticketElement), ticket.count);
                    while (await getCurrentTicketsCount(ticketElement) < actualMax) {
                        await addTicketToCart(ticketElement);
                    }
                } else {
                    while (await getCurrentTicketsCount(ticketElement) > 0) {
                        await removeTicketFromCart(ticketElement);
                    }
                }
            }
        }

        if (!foundAtLeastOneTicket) throw new Error("No tickets found");
        await nextBtn?.click();
        CART_READY = true;
    } catch (e) {
        await page.reload();
        retriggerPages(page);
        await huntTickets(page, PARAMS.tickets);
    }
}

const instantiateHunt = async (browser: Browser, tabId: number) => {

    const page = await browser.newPage();
    await page.goto(PARAMS.url);
    await huntTickets(page, PARAMS.tickets);
    return tabId;

}

const main = async (headless: boolean) => {
    const browser = await puppeteer.launch({ headless });

    for (let i = 0; i < PARAMS.tabs; i++) {
        instantiateHunt(browser, i + 1).then(async found => {
            // Ensure we focus the found tab
            let tabs = await browser.pages();
            tabs[found].bringToFront();
        }).catch(e => {
            throw new Error(e)
        });
    }

}

// TODO: Load data depending of the file args
main(false);