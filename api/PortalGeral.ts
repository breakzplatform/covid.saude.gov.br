import { NowRequest, NowResponse } from '@vercel/node';

export default async (req: NowRequest, res: NowResponse) => {
  const response = await fetch("https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeral", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "x-parse-application-id": "unAFkcaNDeXajurGB7LChj8SgQYS2ptm"
    },
    "referrer": "https://covid.saude.gov.br/",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors"
  });

  res.json(response.body);
}

