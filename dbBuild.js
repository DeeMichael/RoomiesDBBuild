var fs = require('fs')

// Pull the command line arguments
// [2] - file to read gear items from
// -----------------------------------------------------------------------------

if (process.argv[2]!==undefined) {
  var file = process.argv[2]
} else {
  console.log("!-- RoomiesDBBuild requires a file name at command line!")
  console.log("!-- usage: 'node RoomiesDBBuild.js <fileName>'")
  return
}

// *****************************************************************************
// db connection - initialization / closed on last iteration of dbSave
// *****************************************************************************
var mongoose = require('mongoose'),
        User = require('./user.js'),
       dbURL = 'mongodb://localhost:27017/roomies'

mongoose.connect(dbURL,function(err){
  if (err) console.log("!-- Faled to connect to roomies db: ", err)
  else console.log("-- Connected to roomies db.")
})

// *****************************************************************************
// Behavior Code - read the passed file and call the recursive dbSave
// *****************************************************************************
var users = JSON.parse(fs.readFileSync(__dirname + '/usersJSON/' + file))
var successCounter = 0,
        errCounter = 0,
        dupCounter = 0,
            dupBox = []
dbSave()
// *****************************************************************************


// Function Definitions
// *****************************************************************************
// dbSave runs recursively against users[]. As long as there are contents in
// users it attempts to write one element at a time to the db.  dbSave checks
// whether the db already contains a user with the same name and refuses to
// save duplicates.
// *****************************************************************************

function dbSave(){
  if (users.length>0) {
    var currentUser = user.pop(),
            newUser = new User({
              username  : currentUser.username,
              password  : currentUser.password,
              firstname : currentUser.firstname,
              lastname  : currentUser.lastname,
              phone     : currentUser.phone,
              email     : currentUser.email,
              about     : currentUser.about,
              address   : currentUser.address,
              pricemin  : currentUser.pricemin,
              pricemax  : currentUser.pricemax,
              available : currentUser.available,
              age       : currentUser.age,
              smokes    : currentUser.smokes,
              image     : currentUser.image,
              gender    : currentUser.gender,
              friends   : currentUser.friends
            })
    // Check whether the db already contains an item with this username
    User.findOne({username:newUser.username}, function(err, user){
      if(!err && user==null){
      // findOne concludes successfully and finds no duplicate - write the items
      newUser.save(function(err){
        if (err) {
          errCounter++
          dbSave()
        } else {
          successCounter++
          dbSave()
        }
      })
    }else if (!err && user !==null) {
      // findOne concludes successfully but finds a duplicate - refuse duplicate
      dupCounter++
      dupBox.push(newUser.username)
      dbSave()
    }else {
      // findOne returns an error
      errCounter++
      dbSave()
    }
    })
  }else {
    // *************************************************************************
    // db connection - closes on final iteration of dbSave
    // *************************************************************************
    mongoose.connection.close()
    console.log("-- ", successCounter, " gear items added to db successfully." )
    if(errCounter>0) console.log("!-- ", errCounter, " users failed being added to the db - db error.")
    if(dupCounter>0){
      console.log("!-- ", dupCounter, " users were prevented from saving - duplicate.")
      dupBox.forEach(function(user){
        console.log(user.firstname, " ", user.lastname)
      })
    }
  }
}





























//
