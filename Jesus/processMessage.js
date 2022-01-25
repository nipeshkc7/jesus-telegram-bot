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
            people[person].owes[purchase.spender] = people[person].owes[purchase.spender] ? people[person].owes[purchase.spender] : 0 + (purchase.amount / peopleNames.length);
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

const regexMap = {
    'amountSpent': /jesus\si\sspent\s([0-9]+)\sdollars\son.+/gmi,
}

function processMessage(message, people) {
    if(!message.user) throw new Error('no user');
    if(!message.text) throw new Error('no text message');
    const messageText = message.text;

    console.log(message);
    console.log(people);
    //Example message: "jesus is spent 100 dollars on food"
    if(/jesus\si\sspent\s(\d+((.)|(.\d{0,2})?))\sdollars\son.+/gmi.exec(messageText)?.length) {
        console.log('calculating');
        const amountSpent = /jesus\si\sspent\s(\d+((.)|(.\d{0,2})?))\sdollars\son.+/gmi.exec(messageText)[1];
        const peopleRecord = balanceBills(divideBills({ spender: message.user, amount: Number(amountSpent) }, people));
        console.log(peopleRecord);
        return {
            peopleRecord,
            reply: '',
            gif: ''
        }
    }

    //Example message: "jesus i cleared my bills"
    if(/jesus\si\scleared\smy\sbills/gmi.exec(messageText)?.length) {
        const peopleRecord = clearBills(people, message.user);
        return {
            peopleRecord,
            reply: '',
            gif: ''
        }
    }
}

module.exports = {
    processMessage,
}