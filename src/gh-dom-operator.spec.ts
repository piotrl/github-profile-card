/**
 * @jest-environment jsdom
 */
import { DOMOperator } from './gh-dom-operator';
import { IApiError } from './interface/IGitHubApi';

describe('DomOperator', () => {
    const initTemplate = `
        <div id="github-card" data-username="piotrl"></div>
    `;

    let $template: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = initTemplate;
        $template = document.querySelector('#github-card');
    });

    it('should compile', () => {
        expect($template).toBeDefined();
    });

    it('should clear children', () => {
        // given
        $template.innerHTML = `
            <div class="profile"></div>
            <div class="repos"></div>
        `;

        // when
        DOMOperator.clearChildren($template);
        const result = $template.innerHTML;

        // then
        expect(result).toBe('');
    });

    describe('error handling', () => {
        it('should create API error', () => {
            // given
            const error: IApiError = {
                message: 'Service not reachable'
            };

            // when
            const $error = DOMOperator.createError(error, '');
            const message = $error.textContent;

            // then
            expect(message).toBe(`Service not reachable`);
        });

        it('should create 404 error', () => {
            // given
            const username = 'piotrl-not-defined';
            const error: IApiError = {
                isWrongUser: true,
                message: 'Username not found'
            };

            // when
            const $error = DOMOperator.createError(error, username);
            const message = $error.textContent;

            // then
            expect(message).toBe(`Not found user: ${username}`);
        });
    });
});
