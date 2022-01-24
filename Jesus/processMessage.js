function divideBills(purchase, peopleRecord){
    let people = { ...peopleRecord };
    let peopleNames = Object.keys(people);
    peopleNames.forEach(person => {
        if(person === purchase.spender) {
            people[person].spent = people[person].spent + purchase.amount;
        } else {
            people[person].owes[purchase.spender] = people[person].owes[purchase.spender]?people[person].owes[purchase.spender]: 0 + (purchase.amount / peopleNames.length);
            people[person].owes = people[person].owes?people[person].owes:{};
        }
    })
    return people;
}

function balanceBills(peopleRecord){
    let people = { ...peopleRecord };
    let peopleNames = Object.keys(people);
    peopleNames.forEach(person => {
        const personOwes = Object.keys(people[person].owes);
        personOwes.forEach(personOwed => {
            if (people[person].owes[personOwed] === 0) {
                return;
            }
            if (people[person].owes[personOwed] >= people[personOwed].owes[person]){
                people[person].owes[personOwed] = people[person].owes[personOwed] - people[personOwed].owes[person];
                people[personOwed].owes[person] = 0;
            } else if (people[personOwed].owes[person] > people[person].owes[personOwed]){
                people[personOwed].owes[person] = people[personOwed].owes[person] - people[person].owes[personOwed];
                people[person].owes[personOwed] = 0;
            }
        })
    })
    return people;
}

function clearBills(tpeople, person){
    let people = { ...tpeople }; 
    people[person].owes = {};
    return people;
}

function processMessage(message, people) {
    // get amount
    switch (message.text.toLowerCase()) {
        case '':
            divideBills(purchase, people)
            balanceBills(message, people);
            return {
                text: ''
            }
        case '':
            clearBills(people, person);
            return {
                text: ''
            }
        case '':
            return
        // case 'oi':
        //     return {
        //         text: `aah k vo ${message.from.first_name}`,
        //         gif: "what's up"
        //     };
        // case 'k cha':
        //     return {
        //         text: `aah thikai cha ${message.from.first_name}, timro k cha`,
        //         gif: "how are you doing"
        //     };
        // case 'thikai cha':
        //     return {
        //         text: `lala`,
        //         gif: "whatever"
        //     };
        default:
            return {
                text: `k vanya bujina`,
                gif: "confused"
            };
    }
}

module.exports = {
    processMessage
};