
async function testReddit() {
    // 1. Test Search
    console.log("--- Testing SEARCH ---");
    const showTitle = "Severance";
    const query = `title:${showTitle} subreddit:FanTheories`;
    const searchUrl = `https://www.reddit.com/r/FanTheories/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&limit=5`;

    try {
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'node-fetch/1.0' } });
        const searchData = await searchRes.json();
        console.log(`Search Results: ${searchData.data.children.length}`);
        if (searchData.data.children.length > 0) console.log(`Sample: ${searchData.data.children[0].data.title}`);
    } catch (e) {
        console.error("Search Failed:", e.message);
    }

    // 2. Test Hot
    console.log("\n--- Testing HOT ---");
    const hotUrl = `https://www.reddit.com/r/FanTheories/hot.json?limit=5`;
    try {
        const hotRes = await fetch(hotUrl, { headers: { 'User-Agent': 'node-fetch/1.0' } });
        const hotData = await hotRes.json();
        console.log(`Hot Results: ${hotData.data.children.length}`);
        if (hotData.data.children.length > 0) console.log(`Sample: ${hotData.data.children[0].data.title}`);
    } catch (e) {
        console.error("Hot Failed:", e.message);
    }
}

testReddit();
