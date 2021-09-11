const io = require('socket.io')(process.env.PORT || 80,{
    cors:{
        origin:"*"
    }
});

var userInVocal = [];
var lastMessage = []

//create socket for Radio tchat
io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('init', () => {
        io.to(socket.id).emit("joinUpdate", userInVocal);
        io.to(socket.id).emit("receive", lastMessage);
    })

    socket.on('tchat', message => {
        socket.broadcast.emit("receive", message);
        lastMessage = message
    })

    socket.on('joinVocal', (name, picture, muet) => {
        userInVocal.push({socketId: socket.id, name: name, picture: picture, muet: muet})
        io.emit("joinUpdate", userInVocal);
    })

    socket.on('leaveVocal', () => {
        deleteUser(socket.id)
    })

    socket.on("muet", (muet) => {
        
        let otherUser = userInVocal.filter(user => user.socketId != socket.id)
        let thisUser = userInVocal.filter(user => user.socketId == socket.id)

        thisUser[0].muet = muet
        userInVocal = [...otherUser,...thisUser]
        socket.broadcast.emit("muetUpdate", userInVocal);
    })

    socket.on("voice", (data) => {
        var newData = data.split(";");
        newData[0] = "data:audio/ogg;";
        newData = newData[0] + newData[1];
        socket.broadcast.emit("getVoice", newData);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        deleteUser(socket.id);
    });

    function deleteUser(socketDelete)
    {
        userInVocal = userInVocal.filter(user => user.socketId != socketDelete)
    }
})