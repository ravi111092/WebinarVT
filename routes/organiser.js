var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
var organiser = require('../models/organiser');
var admin  = require('../models/admin');
var auth  = require('../config/auth');
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
router.post('/add_organiser',upload2,check_admin_login, async function(req, res, next){
    var user_id =  randomstring.generate(8);
    var guest_id =  randomstring.generate(8);
    var stream_name = randomstring.generate(8);
    var stream_name_2 = randomstring.generate(8);
    var stream_id = randomstring.generate(8);
    console.log("hjhjahsa");
    organiser.findOne({email : req.body.email}, function(err, org){
      if (org) {
        res.status(200).send({ status: false, error: "Email already exists." });
      }else{
        organiser.create({
          name : req.body.name,
          email : req.body.email,
          user_id : user_id,
          guest_id : guest_id,
          stream_name : stream_name,
          stream_name_2 : stream_name_2,
          stream_id : stream_id,
          // token : '51c9264ae049fc2fbb2924e9903faa50d318b38bb94727684d39a35047747237',
          // token : '2d6b1c0aebbc31bbb1855cbe29a08319e2127fa3e5af48b026789f9bae6b7bc0',
          // account_id : 'RfTsfz'
          token : 'a4f653b708e134862d15ad1caef0a141b6136a76479835e7d0cb179eacb72a96', // vaibhav se ne diya hai
          account_id : '2zQMtm'
        }, function(err, data){
          if(err){
            res.status(200).send({ status: false, error: err });
          }else{
            if(data){
              res.status(200).send({ status: true, success: "Successfully added organiser." });
            }else{
              res.status(200).send({ status: false, error: "Something went wrongs.." });
            }
          }
        });
      }
    })
  
    
  });

router.post('/organiser_login',upload2, async function(req, res, next){
    console.log(req.body.user_id);
    organiser.findOne({ user_id: req.body.user_id },async function (err, data) {
        if (data){
            console.log(data);
            var auth_token = await auth.encoded(data);
            req.session.organiser_Id = auth_token;
            req.session.user_id = req.body.user_id; // user_id is nothin but organiser id
            res.status(200).send({ status : true, success : "Successfully login",
            response: { auth_token: auth_token, user_id : req.body.user_id, username : data.name, streamName : data.stream_name}})
        }else{
            res.status(200).send({ status : false, error : "Organiser id Doesnt'nt match"})
        }
    })
})
router.get('/all_organiser', async function(req, res, next){
    organiser.find(function(err, data){
        if(err) {
            res.status(200).send({ status: false, error: err}); 
        }else{
            res.status(200).send({ status: true, data: data}); 
        }
    })
});

router.get('/organiser_login', async function(req, res, next){
    res.render('organiser/organiser_login');
})


router.get('/organiser_page', async function(req, res, next){
    res.render('organiser/organiser_page')
});

router.get('/organiser_by_user_id', async function(req, res, next){
    console.log(req.session.user_id);
    organiser.findOne({ user_id : req.session.user_id}, function(err, data){
        if(err){
            res.status(200).send({status : false, error : err});
        }else{
            res.status(200).send({ status : true, data : data})
        }
    })

});
router.get('/organiser_id/:id',upload2, async function(req, res, next){
    // console.log(req.session.user_id);
    organiser.findOne({ user_id : req.params.id}, function(err, data){
        if(err){
            res.status(200).send({status : false, error : err});
        }else{
            res.status(200).send({ status : true, data : data})
        }
    })

});
router.get('/organiser_stream_2/:stream_name_2',upload2, async function(req, res, next){
  // console.log(req.session.user_id);
  console.log("organiser_stream_2/:stream_name_2'")
  console.log(req.params.stream_name_2);
  organiser.findOne({ stream_name_2 : req.params.stream_name_2}, function(err, data){
      if(err){
          res.status(200).send({status : false, error : err});
      }else{
        console.log(data)
          res.status(200).send({ status : true, data : data})
      }
  })

});

router.get('/organiser_unity/:user_id',upload2, async function(req, res, next){
  // console.log(req.session.user_id);
  console.log("organiser_stream_2/:stream_name_2'")
  console.log(req.params.user_id);
  organiser.findOne({ user_id : req.params.user_id}, function(err, data){
      if(err){
          res.status(200).send({status : false, error : err});
      }else{
        console.log(data)
          res.status(200).send({ status : true, data : data})
      }
  })

});

router.get('/broadcast', async function(req, res, next){
  console.log("hedggggggggggggggggggggggggggggggggggg")  ;
  console.log(req.query.user_id);
try{
  var data = await organiser.findOne({user_id : req.query.user_id});
  res.render('broadcast/index', { stream_name : data.stream_name})
}catch(error){
  console.log("broadcast error working...");
  console.log(error);
}
});

router.get('/broadcast_2', async function(req, res, next){
  console.log("hedggggggggggggggggggggggggggggggggggg")  ;
  console.log(req.query.stream_name_2);
  try{
    var data = await organiser.findOne({stream_name_2 : req.query.stream_name_2});
    res.render('broadcast/index_2', { stream_name_2 : data.stream_name_2})
  }catch(error){
      console.log("broadcast_2 error workingg...");
      console.log(error)
  }

});

// router.get('/web_green_screen', async function(req, res, next){
//   console.log("hedggggggggggggggggggggggggggggggggggg")  ;
//   console.log(req.query.stream_name_2);
//   try{
//     var data = await organiser.findOne({stream_name_2 : req.query.stream_name_2});
//     res.render('broadcast/web_green_screen', { stream_name_2 : data.stream_name_2})
//   }catch(error){
//       console.log("broadcast_2 error workingg...");
//       console.log(error)
//   }

// });

router.post('/delete_by_user_id', async function(req, res){
  console.log(req.body);
  organiser.findOne({ user_id : req.body.user_id}, function(err, data){
    if(err){
      res.status(200).send({ status : false, error : err});
    }else{
      if(data){
        organiser.deleteOne({user_id : data.user_id}, function(err, dele){
          if(err){
            res.status(200).send({ status : false, error : err});
          }else{
            if(dele){
              res.status(200).send({ status : true, success : 'Successfully deleted...'});
            }
            else{
              res.status(200).send({ status : false, error : 'Not deleted successfully...'});
            }
          }
        })
      }else{
        res.status(200).send({ status : false, error : "No such id found.."})
      }
    }
  })
})



router.post('/update_url', async function(req, res, next){
    console.log(req.body);
    organiser.findOne({user_id: req.body.user_id}, function(err, data){
      if(err){
        res.status(200).send({ status : false, error : err});
      }else{
        if(data){
          organiser.updateOne({ user_id : req.body.user_id}, {$set : {
            publish_url : req.body.publish_url,
            unity_url : req.body.unity_url
          }}, function(err, updated){
            if(err){
              res.status(200).send({ status : false, error : err})
            }else{
              if(updated){
                res.status(200).send({ status : true, success : "Successfully updated..."})
              }
            }
          })
        }
      }
    })
    
});

router.post('/update_url_2', async function(req, res, next){
  console.log(req.body);
  console.log(req.body.publish_url_2);
  var url_2 = req.body.publish_url_2;
  organiser.findOne({stream_name_2: req.body.stream_name_2}, function(err, data){
    if(err){
      res.status(200).send({ status : false, error : err});
    }else{
      if(data){
        organiser.updateOne({ stream_name_2: req.body.stream_name_2}, {$set : {
          publish_url_2 : url_2
        }},async function(err, updated){
          if(err){
            res.status(200).send({ status : false, error : err})
          }else{
            if(updated){
              console.log('Successfully updated.....');
              var update_data = await organiser.findOne({stream_name_2 : req.body.stream_name_2});
              console.log("updated_data");
              console.log(update_data);
              res.status(200).send({ status : true, success : "Successfully updated..."})
            }
          }
        })
      }
    }
  })
  
});

// router.post('/update_web_green_screen_url', async function(req, res, next){
//   console.log(req.body);
//   console.log(req.body.web_green_screen_url);
//   var web_green_screen_url = req.body.web_green_screen_url;
//   organiser.findOne({stream_name_2: req.body.stream_name_2}, function(err, data){
//     if(err){
//       res.status(200).send({ status : false, error : err});
//     }else{
//       if(data){
//         organiser.updateOne({ stream_name_2: req.body.stream_name_2}, {$set : {
//           web_green_screen_url : web_green_screen_url
//         }},async function(err, updated){
//           if(err){
//             res.status(200).send({ status : false, error : err})
//           }else{
//             if(updated){
//               console.log('Successfully updated.....');
//               var update_data = await organiser.findOne({stream_name_2 : req.body.stream_name_2});
//               console.log("updated_data");
//               console.log(update_data);
//               res.status(200).send({ status : true, success : "Successfully updated..."})
//             }
//           }
//         })
//       }
//     }
//   })
  
// });

// check lauthentication login
function check_organiser_login(req, res,next){
  try{
    const userjwt =   req.session.user_id;
    console.log("fisrt checkingg. userjwt : "+userjwt);
    if(userjwt){
      auth.decoded(userjwt);
      next();
    }
   else{
     console.log("userjwt in else block :"+userjwt)
     res.redirect('/organiser_login')
   }
  }catch(err){
    console.log(err)
    res.status(401).json({message : 'No Authentication....'})
  }
  
};

function is_organiser(req, res, next){
  if( req.session.user_id){
    next();
  }else{
    res.redirect('/organiser_login')
  }
}
// check lauthentication login
function check_admin_login(req, res,next){
  try{
    const userjwt =  req.session.admin_id;
    console.log("fisrt checkingg. userjwt : "+userjwt);
    if(userjwt){
      auth.decoded(userjwt);
      next();
    }
   else{
     console.log("userjwt in else block :"+userjwt)
     res.redirect('/')
   }
  }catch(err){
    console.log(err)
    res.status(401).json({message : 'No Authentication....'})
  }
  
};
  module.exports = router;