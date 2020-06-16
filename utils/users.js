// const users = [];

// // Join user to chat
// function userJoin(id, username, room) {
//   const user = { id, username, room };

//   users.push(user);

//   return user;
// }

// // Get current user
// function getCurrentUser(id) {
//   return users.find(user => user.id === id);
// }

// // User leaves chat
// function userLeave(id) {
//   const index = users.findIndex(user => user.id === id);

//   if (index !== -1) {
//     return users.splice(index, 1)[0];
//   }
// }

// // Get room users
// function getRoomUsers(room) {
//   return users.filter(user => user.room === room);
// }

// module.exports = {
//   userJoin,
//   getCurrentUser,
//   userLeave,
//   getRoomUsers
// };


var users = require('../models/users');

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  // users.push(user);

  // return user;

  users.create({
    id : user.id, 
    username : user.username, 
    room : user.room
  }, function(err, data){
    if(err){
      return err;
    }else{
      console.log(data)
      return user;
    }
  })
}

// Get current user
function getCurrentUser(id) {
  // return users.find(user => user.id === id);
  users.findOne({ id : id}, function(err, user){
    if(err){
      return err;
    }else{
      return user;
    }
  })
}

// User leaves chat
function userLeave(id) {
  // const index = users.findIndex(user => user.id === id);

  // if (index !== -1) {
  //   return users.splice(index, 1)[0];
  // }

  users.deleteOne({id : id}, function(err, data){
    if(err){
      return err;
    }else{
      return true
    }
  })
}

// Get room users
function getRoomUsers(room) {
  // return users.filter(user => user.room === room);
  users.findOne({ room : room}, function(err, data){
    if(err){
      return err;
    }else{
      return data
    }
  })
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};

