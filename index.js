const port = process.env.PORT || 4444; // Render tells the app which port to use via process.env.PORT
server.listen(port, () => {
    console.log(`Miner Proxy is running on internal port ${port}`);
});
