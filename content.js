function monthEnding(month) {
    //исправление окончания месяца
    if (month.includes('ь', -1) || month.includes('й', -1)) {
        month = month.slice(0, -1) + 'я'
    } else { month = month + 'а' }
    return month
}

function zeroToZero(temp) {
    if (temp === -0) { temp = 0 }
    return temp
}

function backgroundDependancy(temp1, temp2, temp3) {
    //подбор цвета в зависимости от температуры и погоды
    let color
    let temp = [+temp1, +temp2, +temp3]
    let minTemp = Math.min(...temp)

    if (minTemp < 10) { color = '#388ee7' }
    if (minTemp > 10) { color = '#F7A75B' }
    if (minTemp > 30) { color = '#EC7263' }

    return color
}

function advicer(temp1, temp2, temp3, wth1, wth2, wth3) {
    //совет что надеть и взять в зависимости от погоды
    let advice = "Что надеть: "
    let temp = [+temp1, +temp2, +temp3]
    let minTemp = Math.min(...temp)
    let weather = [wth1, wth2, wth3]


    if (minTemp <= 3) {
        advice = advice + 'теплую куртку и шерстяные носки'
    } else if (3 > minTemp <= 12) {
        advice = advice + 'пальто и джинсы'
    } else if (12 > minTemp <= 18) {
        advice = advice + 'толстовку или пиджак'
    } else if (18 > minTemp <= 25) {
        advice = advice + 'рубашку'
    } else if (minTemp >= 25) {
        advice = advice + 'хотя бы трусы'
    } else { console.log('error, check advice() data') }

    weather.forEach((key) => {
        if (key.includes('rain') && !advice.includes('зонт')) { advice = advice + '.\nНе забыть зонт!' }
    })

    if (Math.min(temp) < -29 || Math.min(temp) > 35) { advice = "ИЗ ДОМА ЛУЧШЕ НЕ ВЫХОДИТЬ" }

    return advice
}

function weatherToEmoji(condition) {
    //сейчас не используется, нужно поменять язык
    //подбирает смайлик погоды
    let emoji = ''
    
    switch (true) {
        case condition.includes('thunderstorm'):
            emoji = '⛈️'
            break
        case condition.includes('snow'):
            emoji = '🌨️'
            break
        case condition.includes('few clouds'):
            emoji = '⛅'
            break
        case condition.includes('clouds'):
            emoji = '☁️'
            break
        case condition.includes('clear'):
            emoji = '☀️'
            break
        case condition.includes('rain') || condition.includes('drizzle'):
            emoji = '🌧️'
            break
        case condition.includes('mist') || condition.includes('fog') || condition.includes('haze'):
            emoji = '🌫️'
            break
    }
    return emoji
}

module.exports = { monthEnding, zeroToZero, backgroundDependancy, advicer, weatherToEmoji }