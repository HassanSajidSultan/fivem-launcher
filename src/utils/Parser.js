const DOMPurify = require('dompurify');
const parse = require('html-react-parser');

export const Sanitize = (html) => {
    return parse(DOMPurify.sanitize(html));
}