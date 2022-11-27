//обращения к API
'use strict'

const fs = require('fs');
const convert = require('xml-js')
const { EmbedBuilder, WebhookClient } = require('discord.js');
const { monthEnding, zeroToZero, backgroundDependancy, advicer } = require("./content");

const config = JSON.parse(fs.readFileSync('config.json'));
const weatherKey = config.weather_key

function sendWebhook(user, city, webhook, curr, 
        { morning_temp, morning_weather, day_temp, day_weather, evening_temp, evening_weather} ) {
    let date = new Date
    let today = date.getDate()
    let month = monthEnding(date.toLocaleString("ru-RU", { month: "long" }));
    let advice = advicer(morning_temp, day_temp, evening_temp, morning_weather, day_weather, evening_weather);
    let bg_color = backgroundDependancy(morning_temp, day_temp, evening_temp)

    const hook = new WebhookClient({ url: webhook });
    const embed = new EmbedBuilder()
        .setColor(bg_color)
        .addFields(
            { name: '__Погода__', value: '\u200B', inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: (today + ' ' + month), value: `**${city}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: `🌡️${morning_temp}°C`, value: `*утром*`, inline: true },
            { name: `🌡️${day_temp}°C`, value: `***днём***`, inline: true },
            { name: `🌡️${evening_temp}°C`, value: `*вечером*`, inline: true },
            { name: `${morning_weather}`, value: '\u200B', inline: true },
            { name: `${day_weather}`, value: '\u200B', inline: true },
            { name: `${evening_weather}`, value: '\u200B', inline: true },
            { name: '\u200B', value: "```"+advice+"```" },
            { name: '\u200B', value: '\u200B' },
            { name: '__Курс ЦБ__', value: '\u200B', inline: true },
            { name: '💵'+curr[0].currency, value: curr[0].rate2rubles+'₽', inline: true },
            { name: '💶'+curr[1].currency, value: curr[1].rate2rubles+'₽', inline: true },
        )
        .setFooter({ text: 'Ev.A by @dormlaw' });

    hook.send({ embeds: [embed] });

    return console.log('[Embeds] was succsessfully sent to ' + user +  ' at ' +
        new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))
}

async function weatherRequest(id) {

    const url = `https://api.openweathermap.org/data/2.5/forecast?id=${id}&units=metric&appid=${weatherKey}&lang=ru`
    const response = await fetch(url);
    const data = await response.json();
    const day = new Date()
    
    //openweather предоставлет погоду минимум на 3 часа вперед
    //запрашивать погоду на весь сегодняшний день имеет смысл только до 3 ночи по мск
    // после 3 сотрется погода на утро
    // if ( (day.getHours() > 2) || ( (day.getHours() = 2) && (day.getMinutes() > 40) ) ) {
    if ( day.getHours() >= 2 ) {
        const now = new Date()
        day.setDate(now.getDate() + 1)
    }
    const today = day.getDate()

    let morning_temp
    let morning_weather
    let day_temp
    let day_weather
    let evening_temp
    let evening_weather

    data.list.forEach((key) => {
        const dateTime = new Date(key.dt * 1000);
        const date = dateTime.getDate();
        const time = dateTime.getHours();
        //убираем "-0"
        const temp = zeroToZero(Math.round(key.main.temp));
        const weather = key.weather[0].description

        if (date === today) {
            //openweathermap дает время в UTC с интервалом в 3 часа
            // '6' соответсвует 9 часам утра по МСК и т.д.
            if(time == '6') { 
                morning_temp = temp
                morning_weather = weather
            }
            if(time == '9') { 
                day_temp = temp
                day_weather = weather
            }
            if(time == '15') { 
                evening_temp = temp
                evening_weather = weather
            }
        }
    })
    return {
            morning_temp, 
            morning_weather, 
            day_temp, 
            day_weather, 
            evening_temp, 
            evening_weather
        }
}

async function exchangeRate() {
    const url = 'http://www.cbr.ru/scripts/XML_daily.asp'
    const response = await fetch(url);
        if (response) {console.log('exchange rate has bben successfully recieved')}
    const result = await response.text();
    const data = convert.xml2js(result, { compact: true, spaces: 2 });

    let resultArr = []
    const dataArr = data.ValCurs.Valute
    dataArr.forEach((key) => {
        const item = {
            currency: key.CharCode._text,
                //заменяем разделитель знаков "," на "." и округляем
            rate2rubles: `${(+(key.Value._text.replace(',', '.')) / 
                +(key.Nominal._text.replace(',', '.'))).toFixed(2)}`
        }
        if (key._attributes.ID === 'R01235' || 
            key._attributes.ID === 'R01239') {
                resultArr.push(item) 
        }
    })
    return resultArr
}

module.exports = { weatherRequest, sendWebhook, exchangeRate }