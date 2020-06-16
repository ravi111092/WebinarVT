var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');
var app = express();
var session = require('express-session');
var dbconnect = require('./dbconnect/index')
var organiser = require('./routes/organiser');
var guest = require('./routes/guest');


// creating session here...
app.use(session({
  secret: 'livestreamoverhere',
  resave: true,
  saveUninitialized: false,
  cookie: {
      // expires: 120 * 60 * 1000 // after the time it will back on login pages...
  }}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tourassets')));
app.use('/live',islogin,express.static(path.join(__dirname, 'assets')));
// app.use(express.static(path.join(__dirname, 'main')));

// database connection here
mongoose.connect(dbconnect.mongoURI, dbconnect.mongoCFG).then(()=>{
  console.log("Database connected successfully....");
}).catch((err)=>{
  console.log("error working...");
  console.log(err);
});
app.use(cors());
app.use('/', indexRouter);
app.use('/', organiser);
app.use('/', guest);
app.use('/users', usersRouter);
// chat route overhere
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3333;
var chat2_details = require('./models/chat2_details');
const formatMessage = require('./utils/messages');
const botName = 'IIC';

// Run when client connects
io.on('connection', socket => {
  // console.log("line number 77 : "+room);
  socket.on('joinRoom', async (unity) => {
    console.log("ccccccccccccccccccccccccc");
    console.log(socket.id + ":" + unity.username + ":" + unity.room)
    // const user = userJoin(socket.id, username, room);
    // console.log(user)
    // socket.join(user.room);
    var sasa = {};
    chat2_details.create({
      id: socket.id,
      username: unity.username,
      room: unity.room
    }, function (err, data) {
      if (err) {
        return err;
      } else {
        console.log("create data")
        // console.log(data)
        sasa = data;
        console.log(sasa)
        socket.join(data.room);
        // Welcome current user
        // socket.emit('message', 'hello world');
        // socket.in(sasa.room).emit('message', sasa.username+'Welcome.....');
        // socket.in(sasa.room).emit('message', formatMessage(sasa.username, 'Welcome to IIC Room'));
        socket.emit('message', formatMessage(sasa.username, 'Welcome to Q & A !'));
      }
    });


    // Broadcast when a user connects
    console.log("broadcast......")
    console.log("line number 62 : " + unity.room)
    socket.in(unity.room).broadcast
      .emit(
        'message',
        formatMessage(botName, `${unity.username} has joined the chat`)
      );

    // Send users and room info
    var getusers = await chat2_details.findOne({ id: socket.id });
    io.to(unity.username).emit('roomUsers', {
      room: unity.username,
      users: getusers
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    // const user = getCurrentUser(socket.id);
    console.log("chatMessage line 82....");
    console.log("83 :  " + socket.id);
    console.log(msg);
    var user;
    chat2_details.findOne({ room: msg.room }, function (err, data) {
      if (err) {
        return err;
      } else {
        console.log("133 133333333333333333");
        console.log(data)
        if (data) {
          io.in(data.room).emit('message', formatMessage(data.username, msg.msg)); // io.to(data.room).emit ke vajah se msg nahi dikh raha tha 
        }else{
          console.log('Data nahi hai')
        }
        // console.log(data);
        //  user = data;
        //  console.log(data)
        
      }
    })

  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    // const user = userLeave(socket.id);
    var user;
    console.log("line 104 disconnect : " + socket.id)
    chat2_details.findOne({ id: socket.id }, function (err, data) {
      if (err) {
        return err;
      } else {
        user = data;
        console.log("line 110 when client disconnected")
        console.log(user)
        if (user) {
          io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat`)
          );

          // Send users and room info
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: user.room
          });
        }

      }
    })

  });
});
//



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// check whether login or not
function islogin(req, res, next){
  console.log("session working......");
  console.log(req.session.g_id);
  try{
    const g_id = req.session.g_id;
   if(g_id){
     next();
   }else{
     console.log("else block workin here...")
     res.redirect('/')
   }
  }catch(err){
   console.log(err)
   res.status(401).json({message : 'No Authentication....'})
  }
}
http.listen(port, function(){
  console.log('listening on *:' + port);
});
// module.exports = app;
