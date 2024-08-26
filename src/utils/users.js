const users = [];

// addUser , removeUser , getUser , getUsersInRoom

const addUser = ({id , username , Room}) => {
    // Clean the data 
    username = username.trim().toLowerCase();
    Room = Room.trim().toLowerCase();

    // validate the data
    if(!username || !Room){
        return {
            error : "username or Room are not provided"
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.Room === Room && user.username === username;
    })

    // Validate username
    if(existingUser){
        return {
            error : 'A user with this name already exists!'
        }
    }

    // store user
    const user = {id , username , Room}
    users.push(user);

    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index ,1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    }) 
    return user
}

const getUsersInRoom = (Room) => {
    const UsersInRoom = users.filter((user) => {
        // if(user.Room === Room)
        // {
        //     return user
        // }
        return user.Room === Room
    })
    return UsersInRoom
}

module.exports = {
    addUser , 
    removeUser , 
    getUser ,
    getUsersInRoom
}
