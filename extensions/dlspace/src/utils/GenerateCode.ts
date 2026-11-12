import { readFileSync } from 'fs';
import path from 'path';
import prettier from 'prettier';
import { replaceFromParams } from './Common';
import { IWorksheet } from './ParseExcel';

export const generateTypescriptCode = async function (worksheet: IWorksheet) {
    let template = worksheet.sheetType === 'Array' ? 'ArrayConfig' : 'ObjectConfig';
    let templatePath = path.resolve(__dirname, `../../config/${template}.template`);
    let code = readFileSync(templatePath).toString("utf8");
    code = replaceFromParams(code, {
        classDesc: worksheet.sheetDesc,
        className: worksheet.sheetName,
        props: worksheet.props.map(param => `/* ${param.desc} */\n${param.name}: ${param.type}`).join('; \n\n'),
        json: encodeURIComponent(JSON.stringify(worksheet.datas))
    });

    code = await prettier.format(code, {
        parser: 'typescript'
    });

    return code;
}


