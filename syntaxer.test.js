/**
* @file syntaxer.test.js
* @author heyunfeng
*/

import {HTMLSyntaticalParser} from './syntaxer.js';
import {HTMLLexicalParser} from './lexer.js';

const syntaxer = new HTMLSyntaticalParser();
const lexer = new HTMLLexicalParser(syntaxer);

const testHTML = `<html maaa=a >
    <head>
        <title>cool</title>
    </head>
    <body>
        <img src="a" />
    </body>
</html>`;

for (let c of testHTML) {
    lexer.receiveInput(c);
}

console.log(JSON.stringify(syntaxer.getOutput(), null, 4));
