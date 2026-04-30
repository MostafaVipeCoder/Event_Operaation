
async function testUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${url} -> ${response.status} ${response.statusText}`);
        return response.status;
    } catch (error) {
        console.log(`${url} -> ERROR: ${error.message}`);
        return null;
    }
}

const id = '1j_D9O_oeDrbMGhn7XcJE6MplsB_TxGQt';
const urls = [
    `https://lh3.googleusercontent.com/d/${id}=s400`,
    `https://lh3.googleusercontent.com/d/${id}=s1600`,
    `https://lh3.googleusercontent.com/d/${id}=w1600`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://lh3.googleusercontent.com/d/${id}`
];

for (const url of urls) {
    await testUrl(url);
}
