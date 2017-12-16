const assert = chai.assert;

describe('Array', () => {
    describe('#indexOf()', () => {
        it('should return -1 when the value is not present', () => {
            const node: HTMLDivElement = DOMOperator.createError({
                message: 'Wrong username. No data'
            }, 'test-username');

            assert.isNotNull(node.innerText.indexOf('No data'));
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
});
