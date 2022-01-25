const { processMessage } = require('../Jesus/processMessage');

describe('Testing message processing', () => {
    it('should divide bills equally among people', () => {
        const people = {
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
        const message = {
            user: 'John',
            text: 'jesus i spent 300 dollars on food'
        }

        const result = processMessage(message, people);
        expect(result).toEqual('');
    });

    it('should throw error if no user', () => {
        expect(() => {
            processMessage({ text: 'sth' }, {});
        }).toThrow();
    });
})