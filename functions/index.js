const functions = require("firebase-functions");
const admin = require("firebase-admin");

const fetch = require("node-fetch");
const ExcelJS = require("exceljs");

admin.initializeApp();
const db = admin.firestore();

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "2GB",
};

exports.data = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const response = await fetch(
      "https://covid-saude-gov-br.breakzplatform.now.sh/api/xlsx"
    );
    const responseJSON = await response.json();

    const responseXLSX = await fetch(responseJSON.xlsx);
    const XLSXBuffer = await responseXLSX.buffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(XLSXBuffer);

    const actualRowCount = workbook.worksheets[0].actualRowCount;
    let lastBrasilRow;

    for (let i = 1; i <= workbook.worksheets[0].actualRowCount; i++) {
      const row = workbook.worksheets[0].getRow(i).values;

      if (row[1] === "Norte") {
        lastBrasilRow = workbook.worksheets[0].getRow(i - 1).values;
        break;
      }
    }

    let data = {
      totalObitos: lastBrasilRow[13],
      totalCasos: lastBrasilRow[11],
    };
    let setDoc = await db.collection("covid").doc("data").set(data);

    res.status(200).send({ success: "true" });
  });

exports.getStaticCovidData = functions
  .https.onRequest((req, res) => {
    let covidRef = db.collection("covid").doc("data");
    let getDoc = covidRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          res.status(400).send({success: 'false'});
        } else {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.status(200).send(doc.data());
        }
      })
      .catch((err) => {
          console.log(err);
        res.status(500).send({fail: 'true'});
      });
  });
