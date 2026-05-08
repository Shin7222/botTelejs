/**
 * Pilih item acak dari sebuah array
 * @param {Array} arr
 * @returns {*}
 */
function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Tunggu beberapa milidetik (simulasi async delay)
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { randomPick, sleep };
