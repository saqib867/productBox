import axios from 'axios'
import express from 'express'
import async from 'async'
import url from 'url'
import {Promise} from 'rsvp'

const router = express.Router()


// method number first
router.get('/title1', (req, res) => {
 

  let addresses = req.query.address;
  if (!Array.isArray(addresses)) {
    addresses = [addresses];
  }

  if (addresses.some(address => typeof address !== 'string' || address.trim() === '')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request: Invalid address');
    return;
  }

  const responses = [];
  let completedCount = 0;

  addresses.forEach((address, index) => {
    if (!address.includes('http')) {
      address = 'http://' + address;
    }
    axios.get(address)
      .then(response => {
        const title = response.data.match(/<title>(.*?)<\/title>/i);
        responses[index] = title ? title[1] : 'NO RESPONSE';
        completedCount++;

        if (completedCount === addresses.length) {
          sendResponse();
        }
      })
      .catch(error => {
        console.error(`Error fetching ${address}: ${error.message}`);
        responses[index] = 'NO RESPONSE';
       
      });
  });

  function sendResponse() {
    let htmlResponse = '<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>';
    addresses.forEach((address, index) => {
      htmlResponse += `<li>${address} - "${responses[index]}"</li>`;
    });
    htmlResponse += '</ul></body></html>';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlResponse);
  }
});

// method number 2

router.get('/title2',async(req,res)=>{

  const parsedUrl = url.parse(req.url, true);
  const { query } = parsedUrl;

    let addresses = query.address;
    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    if (addresses.some(address => typeof address !== 'string' || address.trim() === '')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid address');
      return;
    }

    async.map(addresses, (address, callback) => {
      if (!address.includes('http')) {
        address = 'http://' + address;
      }
      axios.get(address)
        .then(response => {
          
          const title = response.data.match(/<title>(.*?)<\/title>/i);
          console.log("title => ",title)
          callback(null, title ? title[1] : 'NO RESPONSE');
        })
        .catch(error => {
          console.error(`Error fetching ${address}: ${error.message}`);
          callback(null, 'NO RESPONSE');
        });
    }, (err, titles) => {
      if (err) {
        console.error(`Error processing requests: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      let htmlResponse = '<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>';
      addresses.forEach((address, index) => {
        htmlResponse += `<li>${address} - "${titles[index]}"</li>`;
      });
      htmlResponse += '</ul></body></html>';
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlResponse);
    });
  
})

// method number 3
router.get('/title3',async(req,res)=>{

  const parsedUrl = url.parse(req.url, true);
  const {query } = parsedUrl;

    let addresses = query.address;
    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    if (addresses.some(address => typeof address !== 'string' || address.trim() === '')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid address');
      return;
    }

    const promises = addresses.map(address => {
      if (!address.includes('http')) {
        address = 'http://' + address;
      }
      return new Promise((resolve, reject) => {
        axios.get(address)
          .then(response => {
            const title = response.data.match(/<title>(.*?)<\/title>/i);
            resolve(title ? title[1] : 'NO RESPONSE');
          })
          .catch(error => {
            console.error(`Error fetching ${address}: ${error.message}`);
            resolve('NO RESPONSE');
          });
      });
    });

    Promise.all(promises)
      .then(titles => {
        let htmlResponse = '<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>';
        addresses.forEach((address, index) => {
          htmlResponse += `<li>${address} - "${titles[index]}"</li>`;
        });
        htmlResponse += '</ul></body></html>';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlResponse);
      })
      .catch(error => {
        console.error(`Error processing requests: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
  
})


  
  

export default router