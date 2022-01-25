const { processMessage } = require('../Jesus/processMessage');

let people;

describe('Testing message processing', () => {

    beforeEach(()=>{
        people = {
            'John': {
                'spent': 0,
                'owes': {
                    'Mary': 0,
                    'Bob': 0,
                }
            },
            'Mary': {
                'spent': 0,
                'owes': {
                    'John': 0,
                    'Bob': 0,
                }
            },
            'Bob': {
                'spent': 0,
                'owes': {
                    'John': 0,
                    'Mary': 0,
                }
            },
        }; 
    })
    it('should divide bills equally among people', () => {

        const message = {
            user: 'John',
            text: 'jesus i spent 300 dollars on food'
        }

        const result = processMessage(message, people);
        expect(result.peopleRecord.John.spent).toEqual(300);
        expect(result.peopleRecord.Mary.owes.John).toEqual(100);
        expect(result.peopleRecord.Bob.owes.John).toEqual(100);
    });

    test.each([['John', 300, 100], ['Mary', 600, 200], ['Bob', 100, 33.33]])(
        "should divide bills equally for %s",(user, spent, divided) => {
               const result = processMessage({
                   user,
                   text: `jesus i spent ${spent} dollars on food`
               }, people);

               Object.keys(result.peopleRecord).forEach(entry => {
                   if(entry !== user){
                       expect(result.peopleRecord[entry].owes[user]).toEqual(divided);
                   }
               })
            });

     test.each(['John', 'Mary', 'Bob'])(
         "should clear bills for %s",(user) => {
                const result = processMessage({
                    user,
                    text: 'jesus i cleared my bills'
                }, people);
                expect(result.peopleRecord[user].owes).toEqual({});
         }
     )

    it('should throw error if no user', () => {
        expect(() => {
            processMessage({ text: 'sth' }, {});
        }).toThrow();
    });
})