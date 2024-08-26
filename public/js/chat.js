const socket = io();
const sendButton = document.querySelector('button')
const Locationofuser = document.getElementById('location')
const p = document.querySelector('p')
const inp = document.querySelector('input')
const form = document.getElementById('messageForm')
const messages = document.getElementById('messages')
const sidebar = document.getElementById('sidebar')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML 
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// options
const {username , Room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoScroll = () => {
    const newMessage = messages.lastElementChild;
    
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = messages.offsetHeight;
    
    const containerHeight = messages.scrollHeight

    const scrollOffSet = messages.scrollTop + visibleHeight;
    
    if(containerHeight - newMessageHeight <= scrollOffSet){
        messages.scrollTop = messages.scrollHeight;
        
    }
}

// reciving text messages
socket.on('message' , (Message) => {
    // console.log(Message)
    // console.log(Message.text)
    const html = Mustache.render(messageTemplate , {
        message : Message.text,
        createdAt : moment(Message.createdAt).format('(D/M/Y - h:mm a) '),
        username : Message.username
    }); 
    messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

// reciving Location messages
socket.on('LocationMessage' , (Message) => {
    console.log(Message)
    const html = Mustache.render(locationTemplate , {
        LocationMessage : Message.url,
        createdAt : moment(Message.createdAt).format('(D/M/Y - h:mm a) ') ,
        username : Message.username

    });
    messages.insertAdjacentHTML('beforeend' , html)
})

socket.on('roomData' , ({Room , users})  => {
    const html = Mustache.render(sidebarTemplate , {
        Room ,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

form.addEventListener('submit' , (e) => {
    e.preventDefault()
    if(inp.value )
    {
        sendButton.disabled = true
        socket.emit('SendAMessage', inp.value , (error) => {
            if(error){
                sendButton.disabled = false
                inp.value = ''
                inp.focus();
                return console.log(error)
            }
            console.log('msg is delivered')
            sendButton.disabled = false
            inp.value = ''
            inp.focus();
        })
    }

})

Locationofuser.addEventListener('click' , () => {
    console.log('location')
    Locationofuser.disabled = true;
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported')
    }
    
    navigator.geolocation.getCurrentPosition(  (position) => {
        console.log(position)  
        socket.emit('LocationOfUser', {
            longitude: position.coords.longitude,
            latitude : position.coords.latitude
        } , () => {
            console.log('location is shared')
            Locationofuser.disabled = false;
        })
    })
})

socket.emit('join' ,{username , Room} , (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})