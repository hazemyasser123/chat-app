const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage ,generateLocationMessage} = require('./utils/messages')
const {addUser , removeUser , getUser ,getUsersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , '../public')

app.use(express.json())
app.use(express.static(publicDirectoryPath)) // to be able to access the frontend files

// io.emit (this one emits to everyone ) , socket.boradcast.emit (this one emits to everyone except the sender)
// io.to.emit (this one emits to everyone inside a certain room) , socket.boradcast.to.emit (this one emits to everyone inside a certain room except the sender)

io.on('connection' ,(socket) => {

    console.log('new connection');
    socket.on('join' , ({username , Room} , callback) => {
        const {error , user} = addUser({
            id : socket.id,
            username,
            Room
        })
        if(error){
            return callback(error);
        }
        socket.join(Room)

        socket.emit('message' ,generateMessage('system' ,'Welcome!!') )
        socket.broadcast.to(Room).emit('message' , generateMessage('system' , `${username} has joined!!`))
        io.to(user.Room).emit('roomData' ,{
            Room : user.Room ,
            users: getUsersInRoom(user.Room)
        })

        callback(); 
    })

    socket.on('SendAMessage' , (msg ,callback) => {
        const filter = new Filter()
        const user = getUser(socket.id);
        if(filter.isProfane(msg)){
            socket.emit('message' , generateMessage('system' , '!!!!😡😡😡profanity is not allowed😡😡😡!!!! (this message is shown only to you)'))
            return callback('profanity is not allowed')
        }
        io.to(user.Room).emit('message' , generateMessage(user.username, msg))
        callback()
    })

    
    socket.on('LocationOfUser' , (LongAndLatObj ,callback) =>{
        const user = getUser(socket.id);
        io.to(user.Room).emit('LocationMessage' , generateLocationMessage(user.username, `https://google.com/maps?q=${LongAndLatObj.latitude},${LongAndLatObj.longitude}`))
        callback();    
    })
    
    
        socket.on('disconnect' , () => {
            const user = removeUser(socket.id)
            if(user){
                io.to(user.Room).emit('roomData' ,{
                    Room : user.Room ,
                    users: getUsersInRoom(user.Room)
                })
                return io.to(user.Room).emit('message' , generateMessage( 'system' ,`${user.username} has Left!!`))
            }
        })
   
})

server.listen(port , () => {
    console.log('server is up and running on port ' + port)
})

