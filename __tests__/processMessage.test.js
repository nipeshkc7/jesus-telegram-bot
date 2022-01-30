const { processMessage } = require('../Jesus/processMessage');

let people;
let peopleOwed;

describe('Testing message processing', () => {

    beforeEach(() => {
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

        peopleOwed = {
            'John': {
                'spent': 100,
                'owes': {
                    'Mary': 200,
                    'Bob': 100,
                }
            },
            'Mary': {
                'spent': 100,
                'owes': {
                    'John': 40,
                    'Bob': 30,
                }
            },
            'Bob': {
                'spent': 90,
                'owes': {
                    'John': 100,
                    'Mary': 80,
                }
            },
        };
    })

    test.each([['John', 300, 100], ['Mary', 600, 200], ['Bob', 100, 33.33]])(
        "should divide bills equally for %s", (user, spent, divided) => {
            const result = processMessage({
                from: {
                    first_name: user
                },
                text: `jesus i spent ${spent} dollars on food`
            }, people);

            Object.keys(result.peopleRecord).forEach(entry => {
                if (entry !== user) {
                    expect(result.peopleRecord[entry].owes[user]).toEqual(divided);
                }
            })
        });

    test.each([['John', 300, 100], ['Mary', 600, 200], ['Bob', 100, 33.33]])(
        "should divide bills equally for %s", (user, spent, divided) => {
            const result = processMessage({
                from: {
                    first_name: user
                },
                text: `jesus i spent ${spent} dollars on food`
            }, peopleOwed);

            expect(result.peopleRecord).toMatchSnapshot();
        });

    test.each(['John', 'Mary', 'Bob'])(
        "should clear bills for %s", (user) => {
            const result = processMessage({
                from: {
                    first_name: user
                },
                text: 'jesus i cleared my bills'
            }, people);
            expect(result.peopleRecord[user].owes).toEqual({});
        }
    )

    test.each(['John', 'Mary', 'Bob'])(
        "should return correct reply for %s", (user) => {
            const result = processMessage({
                from: {
                    first_name: user
                },
                text: 'jesus how much do i owe?'
            }, peopleOwed);
            expect(result.reply).toMatchSnapshot();
        }
    )

    it('should throw error if no user', () => {
        expect(() => {
            processMessage({ text: 'sth' }, {});
        }).toThrow();
    });
})