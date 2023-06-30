const io = require('socket.io')(process.env.PORT || 3234, {
    cors: {
        origin: "*"
    }
});

let userInVocal = [];
let messages = [];

//create socket for Radio tchat
io.on('connection', (socket) => {
    console.log(`${socket.id} connecté`)

    socket.on('init', () => {
        io.to(socket.id).emit("joinUpdate", userInVocal);

        for (let message of messages) {
            io.to(socket.id).emit("receive", message);
        }
    })

    socket.on('tchat', message => {
        messages.push(message)

        if (messages.length > 3) {
            messages = messages.slice(messages.length - 3, messages.length)
        }

        socket.broadcast.emit("receive", message);
    })

    socket.on('joinVocal', (name, picture, muet) => {
        console.log(`socket ${socket.id} join Vocal est ${muet ? ("muet") : ("demute")}`)
        userInVocal.push({ socketId: socket.id, name: name, picture: picture, muet: muet })
        io.emit("joinUpdate", userInVocal);
    })

    socket.on('leaveVocal', () => {
        console.log(`socket ${socket.id} leave le Vocal`)
        userInVocal = userInVocal.filter(user => user.socketId != socket.id)
        io.emit("leaveUpdate", userInVocal);
    })

    socket.on("muet", (muet) => {
        console.log(`socket ${socket.id} est maintenant ${muet ? ("muet") : ("demute")}`)

        let otherUser = userInVocal.filter(user => user.socketId != socket.id)
        let thisUser = userInVocal.filter(user => user.socketId == socket.id)

        if (!thisUser[0]) return

        thisUser[0].muet = muet
        userInVocal = [...otherUser, ...thisUser]
        socket.broadcast.emit("vocalUpdate", userInVocal);
    })

    socket.on("UpdateNickname", (nickname) => {
        console.log(`socket ${socket.id} s'appel maintenant ${nickname}`)

        let otherUser = userInVocal.filter(user => user.socketId != socket.id)
        let thisUser = userInVocal.filter(user => user.socketId == socket.id)

        if (!thisUser[0]) return

        thisUser[0].name = nickname
        userInVocal = [...otherUser, ...thisUser]
        socket.broadcast.emit("vocalUpdate", userInVocal);
    })

    socket.on("voice", (data) => {
        let newData = data.split(";");
        newData[0] = "data:audio/ogg;";
        newData = newData[0] + newData[1];
        socket.broadcast.emit("getVoice", newData);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} deconnecté`);
        userInVocal = userInVocal.filter(user => user.socketId != socket.id)
        io.emit("leaveUpdate", userInVocal);
    });
})