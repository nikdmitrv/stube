const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    name: String,
    master: String,
})

RoomSchema.statics.getMainMaster = async function () {
    const mainRoom = await this.findOne({ name: 'Main' });
    return mainRoom.master;
}

RoomSchema.statics.setMainMaster = async function (newMaster) {
    return await this.updateOne({ name: 'Main' }, { master: newMaster });
}

module.exports = mongoose.model('Room', RoomSchema);
