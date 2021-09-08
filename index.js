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

    socket.on('tchat', message => {
        socket.broadcast.emit("receive", message);
        lastMessage = message
        console.log(message);
    })

    socket.on('joinVocal', (name, picture) => {
        userInVocal.push({socketId:socket.id, name:name, picture:picture})
        console.log("------------")
        console.log(userInVocal)
        io.emit("joinUpdate", userInVocal);
    })

    socket.on('leaveVocal', () => {
        deleteUser(socket.id)
    })

    socket.on('init', () => {
        io.to(socket.id).emit("joinUpdate", userInVocal);
        io.to(socket.id).emit("receive", lastMessage);
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        deleteUser(socket.id);
    });

    function deleteUser(socketDelete)
    {
        for(let i=0; i < userInVocal.length ;i++)
        {
            console.log('socket a delete: '+ socketDelete)
            console.log('socket check: '+ userInVocal[i].socketId)

            if(userInVocal[i].socketId === socketDelete)
            {
                userInVocal.splice(i, i + 1);
            }
        }
        console.log(userInVocal)
        io.emit("leaveUpdate", userInVocal);
    }

})