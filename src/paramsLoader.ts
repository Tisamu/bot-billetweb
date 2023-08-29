import {ScrapperData} from "./types";
import {readFileSync} from "fs";

export default class ParamsLoader {
    constructor(private paramsFilePath: string) {
    };

    loadParams(): ScrapperData {
        try {
            return JSON.parse(readFileSync(this.paramsFilePath).toString()) as ScrapperData;
        } catch (e) {
            throw new Error(`Cannot load Params file at ${this.paramsFilePath}`);
        }
    }
}