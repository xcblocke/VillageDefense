"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypescriptCode = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const Common_1 = require("./Common");
const generateTypescriptCode = async function (worksheet) {
    let template = worksheet.sheetType === 'Array' ? 'ArrayConfig' : 'ObjectConfig';
    let templatePath = path_1.default.resolve(__dirname, `../../config/${template}.template`);
    let code = (0, fs_1.readFileSync)(templatePath).toString("utf8");
    code = (0, Common_1.replaceFromParams)(code, {
        classDesc: worksheet.sheetDesc,
        className: worksheet.sheetName,
        props: worksheet.props.map(param => `/* ${param.desc} */\n${param.name}: ${param.type}`).join('; \n\n'),
        json: encodeURIComponent(JSON.stringify(worksheet.datas))
    });
    code = await prettier_1.default.format(code, {
        parser: 'typescript'
    });
    return code;
};
exports.generateTypescriptCode = generateTypescriptCode;
