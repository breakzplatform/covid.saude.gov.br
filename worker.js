const START_PAGE = "https://covid.saude.gov.br/index.html"
const MY_DOMAIN = "covid.joseli.to"

addEventListener('fetch', event => {
  event.respondWith(fetchAndApply(event.request))
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST,PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function handleOptions(request) {
  if (request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        "Allow": "GET, HEAD, POST, PUT, OPTIONS",
      }
    })
  }
}

async function fetchAndApply(request) {
  if (request.method === "OPTIONS") {
    return handleOptions(request)
  }
  let url = new URL(request.url)
  let response
  if (url.pathname.endsWith("js")) {
    response = await fetch(`https://covid.saude.gov.br${url.pathname}`)
    let body = await response.text()
    try {
      response = new Response(body.replace(/covid.saude.gov.br/g, MY_DOMAIN).replace(/covid.saude.gov.br/g, MY_DOMAIN), response)
      response.headers.set('Content-Type', "application/x-javascript")
    } catch (err) {
      console.log(err)
    }
  } else if (url.pathname === `/`) {
    let pageUrlList = START_PAGE.split("/")
    let redrictUrl = `https://${MY_DOMAIN}/${pageUrlList[pageUrlList.length - 1]}`
    return Response.redirect(redrictUrl, 301)
  } else {
    response = await fetch(`https://covid.saude.gov.br${url.pathname}`, {
      body: request.body, // must match 'Content-Type' header
      headers: request.headers,
      method: request.method, // *GET, POST, PUT, DELETE, etc.
    })

    response = new Response(response.body, response)
    response.headers.delete("Content-Security-Policy")
      
    return new HTMLRewriter().on('body', new ElementHandler()).transform(response)
  }
  return response
}

class ElementHandler {
  element(element) {
    element.append(`<script>
     let appInterval = setInterval(() => {
       if(document.querySelector('card-totalizadores-component') != null && document.querySelector('.lb-total.tp-geral.width-auto span:not(.lb-percent)').innerText === "Casos novos") {
           clearInterval(appInterval);

           // Logo
           document.querySelector('.logo-name > span').innerText = "Joseli.to"

           // Clona Cards
           document.querySelector('card-totalizadores-component').appendChild(document.querySelector('card-totalizadores-component > div').cloneNode(true))

           // Cria botao de download da planilha
           document.querySelector('.tp-totais').setAttribute('style', 'background: var(--ion-color-secondary)')
           document.querySelector('.tp-totais').setAttribute('id', 'xlsxButton')
           document.querySelector('.tp-totais > div').innerText = "Baixar Planilha"

           // Atualiza titulos
           const _titles = document.querySelectorAll('.card-total > .lb-title:not(.tp-GERAL)')
           _titles[0].innerText = "Total de Casos";
           _titles[1].innerText = "Total de Óbitos";
           
           // Atualiza Valores
           const _values = document.querySelectorAll('.lb-total');
           _values[1].setAttribute('id', 'totalCasosId');
           _values[1].innerText = "Carregando..";

           _values[2].setAttribute('id', 'totalObitosId');
           _values[2].innerText = "Carregando..";

           // Remove primeiro sobre
           document.querySelector('.tp-sobre').remove();

           // Corrige flex
           document.querySelector('.ct-geral').style.justifyContent = 'start';

           // fetch de Dados
           fetch('https://us-central1-covid-5ce43.cloudfunctions.net/getStaticCovidData')
            .then(async response => {
               const covidData = await response.json();
               document.getElementById('totalObitosId').innerText = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 3 }).format(covidData.totalObitos);
               document.getElementById('totalCasosId').innerText = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 3 }).format(covidData.totalCasos);
            })

           // fetch Planilha
           fetch("https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeral", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "x-parse-application-id": "unAFkcaNDeXajurGB7LChj8SgQYS2ptm"
            },
            "referrer": "https://covid.joseli.to/",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
            }).then(async response => {
               const covidData = await response.json();
               const xlsxUrl = covidData.results[0].arquivo.url;

               console.log(xlsxUrl);

               document.getElementById('xlsxButton').addEventListener('click', () => {
                window.location.href = xlsxUrl;
               });
            })
       }
    }, 200)
    </script>`, {html: true});
  }
}