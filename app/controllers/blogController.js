const mongoose = require('mongoose');
const shortid = require('shortid');
const response = require('../libs/responseLib');
const time = require('../libs/timeLib');
const check = require('../libs/checkLib');
const logger = require('../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb').ObjectID;
// const path = require("path");

//Importing the model here 
const BlogModel = mongoose.model('Blog')
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')
const CategoryModel = mongoose.model('Category')

let getAllBlog = (req, res) => {
    BlogModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'Failed to find blog details', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                console.log('No Blog Found')
                let apiResponse = response.generate(true, 'No Blogs Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Blogs found Successfully', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all blogs

let getRecentBlogs = (req, res) => {
    BlogModel.find()
        .sort({$natural:-1})
        .limit(3)
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'Failed to find recent blog details', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                console.log('No Blog Found')
                let apiResponse = response.generate(true, 'No Recent Blogs Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Recent Blogs found Successfully', 200, result)
                res.send(apiResponse)
            }
        })
} //end get recent blogs

/**
 * function to read single blog.
 */
let viewByBlogId = (req, res) => {

    BlogModel.findOne({ 'blogId': req.params.blogId }, (err, result) => {

        if (err) {
            console.log(err)
            res.send(err)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            res.send("No Blog Found")
        } else {
            res.send(result)

        }
    })
}

/**
 * function to read blogs by category.
 */
let getAllCategory = (req, res) => {

    CategoryModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {

            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'no such category exists', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                console.log('No Blog Found')
                let apiResponse = response.generate(true, 'No Blogs Found With Such Category', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, ' All categories found', 200, result)
                res.send(apiResponse)
            }
        });
}

/**
 * function to create category.
 */

let createCategory = (req, res) => {

    let categoryId = shortid.generate()
    let newCategory = new CategoryModel({
        categoryId: categoryId,
        categoryName: req.body.categoryName
    });

    newCategory.save((err, result) => {
        if (err) {
            console.log(err)
            let apiResponse = response.generate(true, 'cannot create such category', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'New category created', 200, result)
            res.send(apiResponse)
        }
    });
}

let sendMail = (req, res) => {
    
    let user = {

                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                message: req.body.message
    }

    

    //nodemailer setup
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'webbnetdigital@gmail.com',
      pass: 'webbnet2020'
    }
  });
  
  var mailOptions = {
    from: 'webbnetdigital@gmail.com',
    to: 'tridibc2@gmail.com, shuvankarmallick3@gmail.com',
    subject: 'A new lead has Arrived!',
    html: `<p>Name: ${user.name}</p>
           <p>Email: ${user.email}</p>
           <p>Phone: ${user.phone}</p>
           <p>Message: ${user.message}</p>`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send({message: 'Email sent: ' + info.response});
    }
  });
  console.log(req.body)

}

/**
 * function to view by category id.
 */

let viewByCategory = (req, res) => {

    BlogModel.find({ 'categoryId': req.params.categoryId }, (err, result) => {
        
        if (err) {
            console.log(err)
            let apiResponse = response.generate(true, 'Failed to find category details', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            let apiResponse = response.generate(true, 'No such category Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Blogs with category :: found Successfully', 200, result)
            console.log(result)
            res.send(apiResponse)
        }
    })
}

/**
 * function to read blogs by author.
 */
let viewByAuthor = (req, res) => {

    BlogModel.find({ 'author': req.params.author }, (err, result) => {

        if (err) {
            console.log(err)
            res.send(err)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            res.send("No Blog Found")
        } else {
            res.send(result)

        }
    })
}

/**
 * function to edit blog by admin.
 */
let editBlog = (req, res) => {
    const data = req.body;
    BlogModel.findOne({ 'blogId': req.params.blogId }, (err, result) => {

        if (err) {
            console.log(err)
            res.send(err)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            res.send("No Blog Found")
        } else {
            for (let key in data) {
                result[key] = data[key];       //update objects with new values
            }
            result.views += 1;
            result.save(function (err, result) {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else {
                    console.log("Blog updated successfully")
                    res.send(result)
                }
            });// end result
        }
    });
};



/**
 * function to delete the assignment collection.
 */
let deleteBlog = (req, res) => {
    BlogModel.remove({ 'blogId': req.params.blogId }, (err, result) => {
        if (err) {
            console.log(err)
            res.send(err)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            res.send("No Blog Found")
        } else {
            res.send(result)

        }
    })
}

/**
 * function to create the blog.
 */

let createBlog = (req, res) => {

    CategoryModel.findOne({ 'categoryName': req.body.category }, /* { categoryId: 1 }, */ (err, result) => {
        if (err) {
            console.log('Error at finding categoryName ::', err)
            res.send(err)
        }
        if (result) {
            // console.log('AAA'+result.categoryId)
            let blogId = shortid.generate()
            var today = time.now()
            let newBlog = new BlogModel({
                blogId: blogId,
                title: req.body.title,
                description: req.body.description,
                bodyHtml: req.body.blogBody,
                isPublished: true,
                categoryName: result.categoryName,
                categoryId: result.categoryId,
                author: req.body.author,
                created: today,
                lastModified: today,
                imagePath: req.file && req.file.path   //req.file will be taken incase image is not present
            })
            newBlog.save((err, result) => {
                if (err) { console.log('Error at saving new blog ::', err); res.send(err) }
                else { console.log('Successfully saved new blog'); res.send(result) }
            })
        } else {
            console.log('No category found for ::', req.body.category)
            res.send('No category found')
        }
    })
}

/**
 * function to increase views of a blog.
 */
let increaseBlogView = (req, res) => {

    BlogModel.findOne({ 'blogId': req.params.blogId }, (err, result) => {

        if (err) {
            console.log(err)
            res.send(err)
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found')
            res.send("No Blog Found")
        } else {

            result.views += 1;
            result.save(function (err, result) {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else {
                    console.log("Blog updated successfully")
                    res.send(result)

                }
            });// end result

        }
    })
}



let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }


    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }


    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}


/**
 * function to logout user.
 * auth params: userId.
 */
let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.



module.exports = {
    getAllBlog: getAllBlog,
    getRecentBlogs: getRecentBlogs,
    createBlog: createBlog,
    viewByBlogId: viewByBlogId,
    viewByCategory: viewByCategory,
    getAllCategory: getAllCategory,
    createCategory: createCategory,
    viewByAuthor: viewByAuthor,
    editBlog: editBlog,
    deleteBlog: deleteBlog,
    increaseBlogView: increaseBlogView,
    sendMail: sendMail,
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout
}