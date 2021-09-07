const io = require('socket.io')(process.env.PORT || 80,{
    cors:{
        origin:"*"
    }
});

//create socket for Radio tchat
io.on('connection', (socket) => {
    console.log(socket.id)
    socket.on('tchat', message => {
        socket.broadcast.emit("receive", message);
        console.log(message);
    })
})
