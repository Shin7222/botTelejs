const response = await fetch("https://api.waifu.im/images?IncludedTags=waifu");
const data = await response.json();
console.log(data.items[0].url);
