function isValidRobloxLink(url) {
    const pattern = /^https:\/\/www\.roblox\.com\/share\?code=[\w-]+&type=Server$/;
    return pattern.test(url);
}

module.exports = { isValidRobloxLink };