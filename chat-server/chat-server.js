const WebSocket = require('ws');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stube', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Room = require('../models/room');

function create(httpServer) {
    const wsServer = new WebSocket.Server({ server: httpServer });
    wsServer.on('connection', async ws => {
        console.log('Someone connected')
        const mainMaster = await Room.getMainMaster()
        wsServer.clients.forEach(client => {
            client.send(JSON.stringify({
                masterWho: mainMaster,
            }));
        });
        ws.on('message', async data => {
            const pData = JSON.parse(data);
            if (pData.masterWho) {
                const currentMaster = await Room.getMainMaster()
                if (currentMaster !== pData.masterWho) {
                    await Room.setMainMaster(pData.masterWho);
                }
            }
            wsServer.clients.forEach(client => {
                client.send(data);
            });
        });
    });
}

module.exports = {
    create
};