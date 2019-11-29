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
        const mainRoom = await Room.getMain();
        wsServer.clients.forEach(client => {
            client.send(JSON.stringify({
                masterWho: mainRoom.master,
                videoChange: { id: mainRoom.currentVideoId },
                videoState: mainRoom.currentState,
                videoTime: mainRoom.currentTime,
            }));
        });
        ws.on('message', async data => {
            const pData = JSON.parse(data);
            if (pData.masterWho) {
                const currentMaster = await Room.getMainMaster();
                if (currentMaster !== pData.masterWho) {
                    await Room.setMainMaster(pData.masterWho);
                }
            }
            if (pData.videoChange) {
                const currentVideo = await Room.getCurrentVideo();
                if (currentVideo !== pData.videoChange.id) {
                    await Room.setCurrentVideo(pData.videoChange.id);
                }
            }
            if (pData.videoState) {
                await Room.updateOne({ name: 'Main' },
                    {
                        currentState: pData.videoState,
                        currentTime: pData.videoTime
                    })
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