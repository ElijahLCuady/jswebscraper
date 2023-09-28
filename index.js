const axios = require("axios")      // Fetch url and data
const cheerio = require("cheerio")  // parse data

// Urls to the items you want to scrape
const url4545g = "https://www.tights.no/butikk/optimum-nutrition-100-whey-gold-standard-4545g/";
const url2273g = "https://www.tights.no/butikk/optimum-nutrition-100-whey-gold-standard-2273g/";

const cron = require('node-cron')

const Discord = require("discord.js")

var count = 0;
console.log("Running...")

// At minute 30 past every 3rd hour
cron.schedule('30 */3 * * *', () =>{
  console.log("Chron job running");
  startProcess()
})

async function startProcess(){
  // Items that will be scraped, the number parameters represents the item's previous price  
  const biggestPack = await getPrice(url4545g, 1339) 
  const bigPack = await getPrice(url2273g, 899)
  
  function logOut(){
    client.destroy()
    console.log("Client destroyed")
  }

  async function getPrice(url, prevPrice){
    const {data} = await axios.get(url);        // json
    const $ = cheerio.load(data);               // Load the html
    const item = $("div#primary.content-area")  // query selector, extract data we need
    
    let price =  $(item)
    .find("ins").text()
    const priceNum = parseInt(price)
    console.log(priceNum)
    
    if(priceNum===prevPrice){
      return ("Same price... " + price)
    }else if(priceNum<prevPrice){
      return ("It's finally cheaper! " + price)
    }else{
      return ("It costs more now >:( " + price)
    }
  }
  
  var mySecret = process.env['discordBotToken'] // Configure .env file for your Discord bot's token
  var client = new Discord.Client({intents: ["Guilds", "GuildMessages"]});

  client.login(mySecret);
  
  client.on("ready", () => {
    const channelId = "1";    // Change with your desired "output" channel for the messages
    const channel = client.channels.cache.get(channelId);
    const message = "-----" + "Count: " + count + "-----";
    
    channel.send(message)
    .then(channel.send(biggestPack))
    .then(channel.send(bigPack))
    .then(console.log("Messages sent"))
    .then(setTimeout(logOut, 5000))
    count++;
  })
}
