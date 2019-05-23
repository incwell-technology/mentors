require('dotenv').config({
    path: '../config/variables.env'
});

const googleOAuth = require('../controller/googleOAuth');
const mongoose = require('mongoose');
const User = require('../models/user');

const gAuthStatus = (googleToken) => {
    googleOAuth.getUserInfo(googleToken)
    .then(response => {
        userinfo = response.data;
        //check if it already exists
        User.findOne({ google_id: userinfo.id },  (err, data) => {
            if (data === null) {
                return 200;
            } else {
                return 404;
                 //checkifEmailExists()
            }
            //     //update with the google id, if the the email associated already exists
            // } else {
            //     //create a new record with the new info
            // }
        });
    });
};

// const checkifEmailExists = (userinfo) {
//     User.findOne({ email: userinfo.email },  (err, data) {
//         if (data.length) {
//             User.findOneAndUpdate({google_id: userinfo.id}, {email: userinfo.email}, {upsert:true}, (err, doc) => {
//                 // if (err) return res.send(500, { error: err });
//                 //     return res.send("succesfully saved");
//                 // });
//         } else {
//             //create a new record with the new info
//         }
//     });
// }


// user = {
//     first_name: userinfo.given_name,
//     last_name:
//     email:

// }


// User.create((seedData, (error, addedData) => {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log("Added new data", addedData);
//         }
// });


module.exports.getStatusCode = gAuthStatus;