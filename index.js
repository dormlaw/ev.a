'use strict'

const fs = require('fs');
const { weatherRequest, sendWebhook, exchangeRate } = require("./bot");
const config = JSON.parse(fs.readFileSync('config.json'));

console.log("******************************************")
console.log("Application 'Ev.A' initialized...")
console.log("Author: dormlaw")
console.log(new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }));
console.log("******************************************")

const users = config.users

async function writeData() {
    let weather = {}
    for (let user in users) {
      let id = users[user].city_id
      weather[user] = await weatherRequest(id)
    }
    let data = JSON.stringify(weather);
    fs.writeFileSync('weather.json', data);
    console.log('weather data has been successfully recorded')
}

async function sendData() {
  let rawdata = fs.readFileSync('weather.json');
  let weather = JSON.parse(rawdata);

  for (let user in users) {
    let city = users[user].city_name
    let url = users[user].webhook_url

    let currency = await exchangeRate()
    sendWebhook(user, city, url, currency, weather[user]) 
  }
}

function executeAt(func, time, needCheck = true) {
  let now = new Date()
  let hour = now.getHours()
  let minute = now.getMinutes()
  let date = now.getDate()
  let timeOfExec = +time
  let check = {}
  const file = `checks/check-${func.name}.json`

  if (needCheck) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(check))
    }
    let rawdata = fs.readFileSync(file);
    check = JSON.parse(rawdata);
  }

  if (hour === timeOfExec && date !== check?.point) {
    func()
    if(needCheck) {
      check.point = date
    }
    let data = JSON.stringify(check);
    fs.writeFileSync(file, data);
  }

  let timeout
  if (hour >= timeOfExec) {
    timeout = ( (24 - hour + timeOfExec)*60*60*1000 ) - ( (minute++)*60*1000 )
  }
  if (hour < timeOfExec) {
    timeout = ( (timeOfExec - hour)*60*60*1000 ) - ( (minute++)*60*1000 )
  }

  setTimeout(executeAt, timeout, func, timeOfExec)
}

executeAt(writeData, '01')
executeAt(sendData, '08')