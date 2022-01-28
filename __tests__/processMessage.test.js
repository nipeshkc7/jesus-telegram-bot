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

    test.each([['John', 300, 100], ['Mary', 600, 200], ['Bob', 100, 33.33]])(
        "should divide bills equally for %s",(user, spent, divided) => {
               const result = processMessage({
                   from: {
                       first_name: user
                   },
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
                    from:{
                        first_name: user
                    },
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