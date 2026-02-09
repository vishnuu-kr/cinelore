const API_KEY = 'ef3b466d84aeb49c5d79191aa6638a80';
const BASE_URL = 'https://api.themoviedb.org/3';

async function getBackdrop(id) {
    try {
        const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        const data = await res.json();
        console.log(`${data.name}: ${data.backdrop_path}`);
    } catch (e) {
        console.error(e);
    }
}

(async () => {
    await getBackdrop('37854');
    await getBackdrop('1396');
    await getBackdrop('1399');
})();
