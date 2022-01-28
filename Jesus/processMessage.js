const _ = require('lodash');

function divideBills(purchase, peopleRecord) {
    let people = { ...peopleRecord };

    if(!people[purchase.spender]) {
        people[purchase.spender] = {spent: 0, owes: {}};
    }

    let peopleNames = Object.keys(people);
    peopleNames.forEach(person => {
        if (person === purchase.spender) {
            people[person].spent = people[person].spent + purchase.amount;
        } else {
            people[person].owes[purchase.spender] = people[person].owes[purchase.spender] ? people[person].owes[purchase.spender] : 0 + _.round((purchase.amount / peopleNames.length), 2);
            people[person].owes = people[person].owes ? people[person].owes : {};
        }
    })
    return people;
}

function balanceBills(peopleRecord) {
    let people = { ...peopleRecord };
    let peopleNames = Object.keys(people);
    peopleNames.forEach(person => {
        const personOwes = Object.keys(people[person].owes);
        personOwes.forEach(personOwed => {
            if (people[person].owes[personOwed] === 0) {
                return;
            }
            if (people[person].owes[personOwed] >= people[personOwed].owes[person]) {
                people[person].owes[personOwed] = people[person].owes[personOwed] - people[personOwed].owes[person];
                people[personOwed].owes[person] = 0;
            } else if (people[personOwed].owes[person] > people[person].owes[personOwed]) {
                people[personOwed].owes[person] = people[personOwed].owes[person] - people[person].owes[personOwed];
                people[person].owes[personOwed] = 0;
            }
        })
    })
    return people;
}

function clearBills(peopleRecord, person) {
    let people = { ...peopleRecord };
    people[person].owes = {};
    return people;
}

function processMessage(message, people) {
    console.log(message);
    if(!message.from.first_name) throw new Error('no user');
    if(!message.text) throw new Error('no text message');
    const messageText = message.text;

    //Example message: "jesus is spent 100 dollars on food"
    if(/jesus\si\sspent\s(\d+((.)|(.\d{0,2})?))\sdollars\son.+/gmi.exec(messageText)?.length) {
        const amountSpent = /jesus\si\sspent\s(\d+((.)|(.\d{0,2})?))\sdollars\son.+/gmi.exec(messageText)[1];
        const peopleRecord = balanceBills(divideBills({ spender: message.from.first_name, amount: Number(amountSpent) }, people));
        return {
            peopleRecord,
            reply: `${message.from.first_name} spent ${amountSpent} dollars, and everyone else owes ${message.from.first_name}, ${_.round((Number(amountSpent) / Object.keys(peopleRecord).length), 2)} dollars.`,
        }
    }

    //Example message: "jesus i cleared my bills"
    if(/jesus\si\scleared\smy\sbills/gmi.exec(messageText)?.length) {
        const peopleRecord = clearBills(people, message.from.first_name);
        return {
            peopleRecord,
            reply: `${message.from.first_name} cleared their bills.`,
            gif: 'hurray'
        }
    }
}

module.exports = {
    processMessage,
}