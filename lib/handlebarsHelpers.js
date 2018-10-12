'use strict';

const Handlebars = require('handlebars');

/**
 * Helper functions for Handlebars
 */


exports.nl2br = function (text, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

exports.encode = function (context, str) {
    let uri = context || str;
    return new Handlebars.SafeString(encodeURIComponent(uri));
};