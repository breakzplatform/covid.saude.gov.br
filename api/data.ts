import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import Excel from 'exceljs';

export default async (req: NowRequest, res: NowResponse) => {
  const response = await fetch("https://covid-saude-gov-br.breakzplatform.now.sh/api/xlsx");
  const responseJSON = await response.json();

  const responseXLSX = await fetch(responseJSON.xlsx);
  const XLSXBuffer = await responseXLSX.buffer();
  
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(XLSXBuffer);

 const actualRowCount = workbook.worksheets[0].actualRowCount;
 let lastBrasilRow;
 
 for(let i = 1; i <= workbook.worksheets[0].actualRowCount; i++) {
   const row = workbook.worksheets[0].getRow(i).values;
   console.log(row[1]);

   if(row[1] === 'Norte') {
     lastBrasilRow = workbook.worksheets[0].getRow(i-1).values;
     console.log(lastBrasilRow);
     break;
   }
   
 }

  res.status(200).send({totalObitos: lastBrasilRow[13], totalCasos: lastBrasilRow[11]});
}

