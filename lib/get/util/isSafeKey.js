/**
 * Checks if a key is safe to use for object property assignment.
 * Prevents prototype pollution by blocking keys that could modify
 * the Object prototype chain.
 *
 * @param {*} key - The key to check
 * @return {boolean} - true if the key is safe, false otherwise
 */
module.exports = function isSafeKey(key) {
    // Block dangerous keys that can pollute the prototype
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
};
