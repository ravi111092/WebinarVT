var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
var sessionstorage = require('sessionstorage');
var organiser = require('../models/organiser');
var admin = require('../models/admin');
var auth = require('../config/auth');
const saltRound = 10;
var randomstring = require("randomstring");

///  for formdata

// file filter when file is uploading to cloudinary
var upload2 = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).single('file');

/// code added from video_stream
router.get('/admin', async function (req, res, next) {
  res.render('admin/admin_login')
});

router.post('/admin_login', upload2, async function (req, res, next) {
  var reqData = req.body.data;
  var emails = await organiser.find({ 'email': req.body.email })
  admin.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      // console.log(data.password);
      bcrypt.compare(req.body.password, data.password, async function (err, isEqual) {
        if (err) return next({ errors: [{ message: err.toString() }] });
        if (!isEqual) {
          res.status(200).send({ status: false, error: "Password does'nt match." });
        }
        else {
          var auth_token = await auth.encoded(data);
          req.session.admin_id = auth_token;
          req.session.user_id = auth_token; // when admin want to broadcast
          // console.log("aaaaaaaaaaaaaaaaaaaaaa");
          // console.log(req.session.user_id);

          res.status(200).send({
            status: true, success: "Login successfully.",
            response: { auth_token: auth_token, admin: { _id: data._id, email: data.email } }
          });
        }
      })
    } else {
      res.status(200).send({ status: false, error: "Email Doesn't match." });

    }
  })
});

router.post('/admin_register', upload2, async function (req, res, next) {
  if (req.body.email) {
    admin.findOne({ email: req.body.email }, function (err, users) {
      if (users) {
        res.status(200).send({ status: false, error: "Email already exists." });
      }
      else {
        // set otp_register_session here
        bcrypt.genSalt(saltRound, function (err, salt) {
          if (err) throw err;
          bcrypt.hash(req.body.password, salt, async function (err, hash) {
            if (err) throw err;
            admin.create({
              email: req.body.email,
              password: hash
            }, function (err, data) {
              if (err) throw err;
              else {
                // send_email.sendMail(null, data.email, null, data.register_otp);
                console.log("data are " + data);
                res.status(200).send({
                  status: true,
                  success: "User Successfully registered !!.",
                });
              }
            })
          })

        })


      }

    })
  } else {
    res.status(200).send({ status: false, error: "Email must required.." });
  }
});

router.get('/admin_page', check_admin_login, isAdmin, async function (req, res) {
  res.render('admin/admin_page');
})
router.get('/get', function (req, res) {
  admin.find(function (err, data) {
    if (err) {
      res.json({
        err: err
      })
    } else {
      res.json({
        data: data
      })
    }
  })
});

// check lauthentication login
function check_admin_login(req, res, next) {
  try {
    const userjwt = req.session.admin_id;
    console.log("fisrt checkingg. userjwt : " + userjwt);
    if (userjwt) {
      auth.decoded(userjwt);
      next();
    }
    else {
      console.log("userjwt in else block :" + userjwt)
      res.redirect('/')
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'No Authentication....' })
  }

};

function isAdmin(req, res, next) {
  if (req.session.admin_id) {
    next();
  } else {
    res.redirect('/')
  }
}

router.get('/admin_logout', function (req, res, next) {
  req.session.admin_id = 0;

  console.log("session expired")
  res.redirect('/admin');
})
router.get('/organiser_logout', function (req, res, next) {

  req.session.user_id = 0;
  console.log("session expired")
  res.redirect('/organiser_login');
})

//// code end video_stream
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });

});


router.get('/agenda_updated', function (req, res, next) {
  res.render('agenda_updated_new', { title: 'Express' });
});


router.get('/agenda_page_2', function (req, res, next) {
  res.render('agenda_page_2', { title: 'Express' });
});

router.get('/demo_page', function (req, res, next) {
  res.render('demo_page', { title: 'Express' });
});


router.get('/agenda', is_session_active, async function (req, res, next) {
  res.render('agenda_updated_new');
  // try {
  //   var data = await organiser.findOne({ guest_token: req.query.token });
  //   console.log(data);
  //   res.render('agenda_updated_new');
  // } catch (error) {
  //   console.log("error working,.....");
  //   console.log(error);
  // }

});


router.get('/exhibitionhall', async function (req, res, next) {
  res.render('tour/index');
});


router.get('/explorer', is_session_active,async function (req, res, next) {
  res.render('explorer');
});



router.get('/lobby', islogin, async function (req, res, next) {
  var guest_id = req.session.user_id_2;
  var data = await organiser.findOne({ guest_id: guest_id });
  console.log(data);
  res.render('lobby', { title: 'Express', stream_name: data.stream_name, username: data.name });
});
// check whether login or not
function islogin(req, res, next) {
  console.log("session working......");
  console.log(req.session.user_id_2);
  try {
    const user_id = req.session.user_id_2;
    if (user_id) {
      next();
    } else {
      console.log("else block workin here...")
      res.redirect('/')
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'No Authentication....' })
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
}
}catch(error){
console.log(error);
res.redirect('/');
}

}
})
}
