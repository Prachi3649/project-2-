const express = require('express');
const router = express.Router();
const UserController = require("../controllers/userController")
const BookController = require("../controllers/bookController")
const ReviewController = require("../controllers/reviewcontroller")
const AWSController =require ("../controllers/awsController")
const { authentication, authorisation,createAuthorisation } = require('../middleware/auth');



//▶User API.............
router.post("/register", UserController.createUser);
router.post("/login", UserController.loginUser)


//▶Books API..............
router.post('/books',authentication,createAuthorisation, BookController.createBook);
router.get('/books',authentication, BookController.getbook);
router.get('/books/:bookId',authentication, BookController.getbookdetailsById);
router.put('/books/:bookId',authentication,authorisation, BookController.updateBook);
router.delete('/books/:bookId',authentication,authorisation, BookController.deleteById);


//▶Review API.............
router.post('/books/:bookId/review', ReviewController.creatReview);
router.put('/books/:bookId/review/:reviewId', ReviewController.updatebyReviewId);
router.delete('/books/:bookId/review/:reviewId', ReviewController.deleteByReviewId);

//multer
router.post("/write-file-aws",AWSController.writeToAWS)
module.exports = router;