const express = require('express')
const blogController = require('./../controllers/blogController')
const appConfig = require("../../config/appConfig")
const routeLogger = require("../middlewares/routeLogger")
const auth = require('./../middlewares/auth')

const multer = require('multer')

const path = require('path');

 const storage = multer.diskStorage({
     destination: function(req, file, cb) {
        cb(null, './uploads/')
     },
     filename: function(req, file, cb) {
         cb(null, Date.now() + file.originalname + path.extname(file.fieldname))
     }
 })

 const upload = multer({storage: storage})

let setRouter = (app) => {
    let baseUrl = appConfig.apiVersion+'/blogs';

    app.get(baseUrl+'/all', blogController.getAllBlog);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    app.get(baseUrl+'/recent/blogs', blogController.getRecentBlogs);

    app.get(baseUrl+'/view/:blogId', blogController.viewByBlogId);

    app.get(baseUrl+'/view/by/author/:author',blogController.viewByAuthor);

    app.get(baseUrl+'/category', blogController.getAllCategory);

    app.post(baseUrl+'/create/category', blogController.createCategory);

    app.get(baseUrl+'/view/by/category/:categoryId',blogController.viewByCategory);

    app.post(baseUrl+'/:blogId/delete', auth.isAuthenticated, blogController.deleteBlog);

    app.put(baseUrl+'/edit/:blogId', auth.isAuthenticated, blogController.editBlog);

    app.post(baseUrl+'/create', upload.single('imagePath'), blogController.createBlog);

    app.get(baseUrl+'/:blogId/count/view', blogController.increaseBlogView);

    app.post(baseUrl+'/send/mail', blogController.sendMail);

    app.get(baseUrl+'/logout', blogController.logout);

    // params: firstName, lastName, email, mobileNumber, password
    app.post(`${baseUrl}/signup`, blogController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    // params: email, password.
    app.post(`${baseUrl}/login`, blogController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }
    */
app.post(`${baseUrl}/logout`, blogController.logout);

    

}// end setRouter function 

module.exports = {
    setRouter: setRouter
}