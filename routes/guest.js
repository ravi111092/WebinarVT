var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
var organiser = require('../models/organiser');
var admin = require('../models/admin');
var auth = require('../config/auth');
const saltRound = 10;
var randomstring = require("randomstring");
// file filter when file is uploading to cloudinary
var upload2 = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).single('file');


// for live streaming here
router.get('/stream', is_session_active, async function (req, res, next) {
  console.log(req.query.token);
  organiser.findOne({ guest_token: req.query.token }, function (err, data) {
    if (err) {
      throw err;
    } else {
      if (data) {
        res.render('broadcast/broadcast', { stream_name: data.stream_name, stream_name_2: data.stream_name_2 })
      } else {
        console.log("no data available....")
      }

    }
  })
  // res.render('broadcast/broadcast', {account_id : , stream_name : })
});
// for live streaming here
// router.get('/stream_2', async function(req, res, next){
//   console.log(req.query.user_id);
//   organiser.findOne({ user_id :  req.query.user_id}, function(err, data){
//     if(err){
//       throw err;
//     }else{
//       if(data){
//         console.log(data.account_id);
//         console.log(data.stream_name);
//         res.render('broadcast/broadcast2', {account_id :data.account_id , stream_name : data.stream_name})
//       }else{
//         console.log("no data available....")
//       }

//     }
//   })
//     // res.render('broadcast/broadcast', {account_id : , stream_name : })
// });

router.get('/stream_2', async function (req, res, next) {
  console.log(req.query.stream_name_2);
  // organiser.findOne({ stream_name_2 :  req.query.stream_name_2}, function(err, data){
  //   if(err){
  //     throw err;
  //   }else{
  //     console.log(data);
  //     if(data){
  //       console.log(data.account_id);
  //       console.log(data.stream_name_2);
  //       res.render('broadcast/viewer', {stream_name : data.stream_name_2})
  //     }else{
  //       console.log("no data available....")
  //     }

  //   }
  // })
  res.render('broadcast/viewer', { stream_name: req.query.stream_name_2 });
  // res.render('broadcast/broadcast', {account_id : , stream_name : })
});
// http://localhost:3333/unity_stream?user_id=mvcdL3fA
router.get('/unity_stream', async function (req, res, next) {
  console.log(req.query.user_id);

  organiser.findOne({ user_id: req.query.user_id }, function (err, data) {
    if (err) {
      throw err;
    } else {
      if (data) {
        console.log("stream name : " + data.stream_name_2)
        console.log(data.account_id);
        console.log(data.user_id);
        res.render('broadcast/viewer', { stream_name: data.stream_name })
      } else {
        console.log("no data available....")
      }

    }
  })
  // res.render('broadcast/broadcast', {account_id : , stream_name : })
});

// router.get('/web_green_screen_viewer', async function(req, res, next){
//   console.log(req.query.stream_name_2);
//   organiser.findOne({ stream_name_2 :  req.query.stream_name_2}, function(err, data){
//     if(err){
//       throw err;
//     }else{
//       if(data){
//         console.log(data.account_id);
//         console.log(data.stream_name_2);
//         res.render('broadcast/web_green_screen_viewer', {account_id :data.account_id , stream_name_2 : data.stream_name_2})
//       }else{
//         console.log("no data available....")
//       }

//     }
//   })
//     // res.render('broadcast/broadcast', {account_id : , stream_name : })
// });
// router.get('/guest_login', async function (req, res, next) {
//   res.render('guest/guest_login')
// });

router.post('/guest_login', upload2, async function (req, res, next) {
  // console.log(req.body.emp_id)
  organiser.findOne({ guest_id: req.body.guest_id }, function (err, data) {
    if (err) {
      res.json({ status: false, error: err });
    } else {
      if (data) {
        console.log(data)
        req.session.guest_id = req.body.guest_id;
        res.json({ status: true, code: "200", meassage: "Successfully match id  !!", response: { _id: data._id, user_id: data.user_id, stream_name: data.stream_name, guest_id: data.guest_id, username: 'John Doe', email: data.email, publish_url: data.unity_url } });
      } else {
        res.json({ status: false, error: "Guest Id Doesn't Match", code: "400" })
      }
    }
  })
});


//weblogin



router.post('/web_guest_login', upload2, async function (req, res, next) {
  // console.log(req.body.emp_id)
  organiser.findOne({ guest_id: req.body.guest_id }, function (err, data) {
    if (err) {
      res.json({ status: false, error: err });
    } else {
      if (data) {
        req.session.guest_id = req.body.guest_id;
        req.session.guest_session = auth.encoded(data.email);
        var guest_token = req.session.guest_session; // store token in database
        // add last_call, save current time stamp
        // create function is_session_active() check last_call kab hua tha and current time and its differences time stapm differnce 15 min.
        // 15< update time_stamp last_call
        // 15 > jwt expired deleted
        //

        var last_call = Math.floor(Date.now() / 1000); // time_stamp format
        console.log("guest_login guest_login guest_login guest_login guest_login")
        console.log(guest_token);
        console.log("guest_login guest_login guest_login guest_login guest_login")
        var time_stamp = new Date(Date.now()); // store database
        organiser.updateOne({ guest_id: req.body.guest_id },
          { $set: { guest_token: guest_token, time_stamp: time_stamp, last_call: last_call } },
          function (err, updated) {
            if (updated) {
              res.json({ status: true, code: "200", meassage: "Successfully match id !!", response: { _id: data._id, user_id: data.user_id, stream_name: data.stream_name, guest_id: data.guest_id, username: 'John Doe', email: data.email, publish_url: data.unity_url, guest_token: guest_token, last_call: last_call } });

            } else {
              res.json({ status: false, error: err });
            }
          })

      } else {
        res.json({ status: false, error: "Guest Id Doesn't Match", code: "400" })
      }
    }
  })
});

router.get('/guest_page', check_organiser_login, async function (req, res, next) {
  res.render('guest/guest_page');
});

router.get('/guest_by_guest_id', check_organiser_login, async function (req, res, next) {
  console.log(req.session.guest_id);
  // 2nd way by using req.body.guest_id from nested ajax
  organiser.findOne({ guest_id: req.session.guest_id }, function (err, data) {
    if (err) {
      res.status(200).send({ status: false, error: err });
    } else {
      if (data) {
        console.log(data)
        res.status(200).send({ status: true, success: 'Successfully get Data...', response: { _id: data._id, user_id: data.user_id, username: data.name, email: data.email, publish_url: data.publish_url } })
      } else {
        res.status(200).send({ status: false, error: 'No any Data for this id..' })
      }

    }
  })

});


router.post('/is_active_session', async function (req, res) {
  console.log("heu : "+req.body.token)
  organiser.findOne({ guest_token: req.body.token }, function (err, data) {
    if (err) {
      res.send({ status: false, error: err });
    } else {
      if (data) {
        console.log(data.last_call);
        console.log(Math.floor(Date.now() / 1000));
        //(Math.floor(Date.now() / 1000) + (60 * 1)) == 1 minute
        var time_diff = (Math.floor(Date.now() / 1000) - data.last_call);
        console.log(time_diff / 60);
        var diff_time = time_diff / 60;
        if (diff_time > 15) {
          console.log("time is bigger than 15 minutes");
          res.send({ status: 400, error: 'Session expired..' });
        } else {
	console.log("time is less than 15 minutes");
var last_call = Math.floor(Date.now() / 1000); // time_stamp format
organiser.updateOne({ guest_token: req.query.token },
{ $set: { last_call : last_call } },
function (err, updated) {
if (updated) {
res.status(200).send({ status : 200, response : { data : data}})
} else {
console.log("not updated....")
// res.json({ status: false, error: err });
}
})
        //  console.log("time is less than 15 minutes");
         // res.send({ status: 200, response: { data: data } })
        }
      } else {
        res.send({ status: false, error: 'NO such token found' });
      }
    }
  })
});


// check lauthentication login
function check_organiser_login(req, res, next) {
  try {
    const userjwt = req.session.guest_id;
    console.log("fisrt checkingg. userjwt : " + userjwt);
    if (userjwt) {
      auth.decoded(userjwt);
      next();
    }
    else {
      console.log("userjwt in else block :" + userjwt)
      res.redirect('/guest_login')
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'No Authentication....' })
  }

};
router.get('/guest_logout', async function (req, res, next) {
  req.session.guest_id = 0;

  console.log("session expired")
  res.redirect('/guest_login');
})

function is_organiser(req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    res.redirect('/guest_login')
  }
}
module.exports = router;


//middelware

/// agenda , auditorium, explorer,
/*async function is_session_active(req, res, next) {
  console.log("ssssssssssssss");
  console.log(req.query.token);
  organiser.findOne({ guest_token: req.query.token }, function (err, data) {
    if (err) {
      res.status(200).send({ status: false, error: err });
    } else {
      try {
        if (data) {
          console.log("last_calllast_calllast_call");
          console.log(data.last_call);
          console.log(Math.floor(Date.now() / 1000));
          //(Math.floor(Date.now() / 1000) + (60 * 1)) == 1 minute
          var time_diff = (Math.floor(Date.now() / 1000) - data.last_call);
          console.log(time_diff / 60);
          var diff_time = time_diff / 60;
          console.log("last_calllast_calllast_call");
          if (diff_time > 15) {
            console.log("time is bigger than 15 minutes");
            res.redirect('/');
          } else {
            console.log("time is less than 15 minutes");
            next();
          }
        }
        else {
          console.log("NO such Data available");
          res.redirect('/');
        }
      } catch (error) {
        console.log(error);
      }

    }
  })
}
*/

/// agenda , auditorium, explorer,
async function is_session_active(req, res, next){
console.log("ssssssssssssss");
console.log(req.query.token);
organiser.findOne({guest_token : req.query.token }, function(err, data){
if(err){
res.status(200).send({ status : false, error : err});
}else{
try{
if(data){
console.log("last_calllast_calllast_call");
console.log(data.last_call);
console.log(Math.floor(Date.now() / 1000));
//(Math.floor(Date.now() / 1000) + (60 * 1)) == 1 minute
var time_diff = (Math.floor(Date.now() / 1000) - data.last_call);
console.log(time_diff / 60);
var diff_time = time_diff / 60;
console.log("last_calllast_calllast_call");
if(diff_time > 15){
console.log("time is bigger than 15 minutes");
res.redirect('/');
}else{
console.log("time is less than 15 minutes");
var last_call = Math.floor(Date.now() / 1000); // time_stamp format
organiser.updateOne({ guest_token: req.query.token },
{ $set: { last_call : last_call } },
function (err, updated) {
if (updated) {
next();
} else {
console.log("not updated....")
// res.json({ status: false, error: err });

}
})

}
}
else{
console.log("NO such Data available")
res.redirect('/');
}
}catch(error){
console.log(error);
}

}
})
}
