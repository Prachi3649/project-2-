const reviewModel = require('../models/reviewModel')
const booksModel = require('../models/bookModel')
const ObjectId = require("mongoose").Types.ObjectId
const mongoose = require("mongoose")

//✅validation........................................................

const isValidRequestBody = function (requestBody) {
    return Object.entries((requestBody).length > 0)
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
  }


const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}


//✅Creat Review.......................................................
const creatReview = async function (req, res) {
    try {
        const data = req.body
        const bookId = req.params.bookId
        if (!ObjectId(bookId)) return res.status(400).send({ status: false, message: "please provide valid id" })

        if (!isValidRequestBody) {
            return res.status(400).send({ status: false, message: "please provide review data" })
        }
        const { review, rating,reviewedBy } = data
        if (!isValid(rating)) return res.status(400).send({ status: false, message: "please provide review rating" })


        if (!isValid(review)) return res.status(400).send({ status: false, message: "please provide review " })

        if (!isValid(reviewedBy)) return res.status(400).send({ status: false, message: "please provide reviewrs name" })

        if (!isValid(bookId)) return res.status(400).send({ status: false, message: "please provide book id" })
        //book does not exit
        //validating rating

        if (rating < 1) return res.status(400).send({ status: false, message: "rating must be greater than 1" })
        if (rating > 5) return res.status(400).send({ status: false, message: "rating must be less than 5" })

        //validating reviewdAt
        data.reviewedAt = Date.now();

        const reviewDetails = await reviewModel.create(data)

        const countReview = await reviewModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } })
        const details = {
            _id: reviewDetails._id,
            bookId: reviewDetails.bookId,
            reviewedBy: reviewDetails.reviewedBy,
            reviewedAt: reviewDetails.reviewedAt,
            rating: reviewDetails.rating,
            review: reviewDetails.review

        }

        return res.status(201).send({ status: true, message: "success", data: details })

    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: "error" })
    }
}





//✅Update by Review ID........................................................................

const updatebyReviewId = async (req, res) => {
    try {
      const bookId = req.params.bookId;
  
      if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "input valid bookid" }) }
      const reviewId = req.params.reviewId;
  
      if (!isValidObjectId(reviewId)) { return res.status(400).send({ status: false, message: "input valid reviewid" }) }
      const data = req.body;
  
      if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "No input provided by user", }); }
      const { reviewedBy, review, rating } = data
  
      const bookDetails = await booksModel.findById(bookId).lean()
      if (!bookDetails) return res.status(404).send({ status: false, message: "No book with this id exists" })
      if (bookDetails.isDeleted == true) { return res.status(400).send({ Status: false, message: "Thebook has been deleted" }) }
  
  
      const reviewDetails = await reviewModel.findById(reviewId)
      if (!reviewDetails) { return res.status(404).send({ Status: true, message: "No review with this review id exists" }) }
      if (reviewDetails.isDeleted == true) { return res.status(400).send({ Status: false, message: "The requested review has been deleted" }) }
  
      let update = {}
      if (isValid(review)) { update['review'] = review }
      if (isValid(reviewedBy)) { update['reviewedBy'] = reviewedBy }
      if (isValid(rating)) { update['rating'] = rating }
  
  
      if (bookId != reviewDetails.bookId) { return res.status(400).send({ Status: false, message: "The review and book do not match" }) }
      
      const saveData = await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: update })
       const reviewData = await reviewModel.find({bookId:bookId, isDeleted:false})
       bookDetails['reviewsData']=reviewData
  
      
      
      
      return res.status(200).send({ status: true, message:`Review with id ${reviewId} updated sucessfuly` , Data:bookDetails})
  
    } catch (err) { console.log(err); return res.status(500).send({ status: false, message: err.message }); }
  };;



//✅Deleted by review Id............................................................................

let deleteByReviewId = async function (req, res) {

    try {

        const bookId = req.params.bookId
        const Reviews = req.params.reviewId
        if (!bookId) {
            return res.status(400).send({ status: false, message: "bookId is required in path params" })
        }

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, message: `enter a valid bookId` })
        }
        if (!Reviews) {
            return res.status(400).send({ status: false, message: "reviewId is required in path params" })
        }

        if (!isValid(Reviews)) {
            return res.status(400).send({ status: false, message: `enter a valid reviewId` })
        }

        const book = await booksModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        const review = await reviewModel.findOne({ _id: Reviews, isDeleted: false, deletedAt: null })

        if (!book) {
            return res.status(404).send({ status: false, message: "no book found by this ID" })
        }
        if (!review) {
            return res.status(404).send({ status: false, message: "no book found by this ID" })
        }

        const deletereview = await reviewModel.findByIdAndUpdate(review,{ $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        res.status(200).send({ status: true, message: "review deleted successfully" })


    } catch (err) {
        res.status(500).send({ error: err.message })
    }
}


module.exports.creatReview = creatReview
module.exports.updatebyReviewId = updatebyReviewId
module.exports.deleteByReviewId = deleteByReviewId