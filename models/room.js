const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    name: String,
    master: String,
    currentVideoId: String,
    currentState: Number,
    currentTime: Number,
})

RoomSchema.statics.getCurrentTime = async function () {
    const mainRoom = await this.findOne({ name: 'Main' });
    return mainRoom.currentTime;
}

RoomSchema.statics.getMain = async function () {
    return await this.findOne({ name: 'Main' })
}

RoomSchema.statics.getMainMaster = async function () {
    const mainRoom = await this.findOne({ name: 'Main' });
    return mainRoom.master;
}

RoomSchema.statics.setMainMaster = async function (newMaster) {
    return await this.updateOne({ name: 'Main' }, { master: newMaster });
}

RoomSchema.statics.getCurrentVideo = async function () {
    const mainRoom = await this.findOne({ name: 'Main' });
    return mainRoom.currentVideoId;
}

RoomSchema.statics.setCurrentVideo = async function (newVideoId) {
    return await this.updateOne({ name: 'Main' }, { currentVideoId: newVideoId });
}

RoomSchema.statics.getCurrentState = async function () {
    const mainRoom = await this.findOne({ name: 'Main' });
    return mainRoom.currentState;
}

RoomSchema.statics.setMainState = async function (newState) {
    return await this.updateOne({ name: 'Main' }, { currentState: newState });
}

module.exports = mongoose.model('Room', RoomSchema);
