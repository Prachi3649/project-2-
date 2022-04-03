const booksModel = require("../models/bookModel");
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const mongoose = require("mongoose")




const isValid = function (value) {
  if (typeof value == undefined || value == null || value.length == 0) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true
}
const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}


//1️⃣Create book ...............................................

const createBook = async function (req, res) {
  try {
      const bookBody = req.body
      
      const url = req.body
      
      if(!isValidRequestBody(bookBody)) {
          return res.status(400).send({status: false, message: 'Please provide book details'})
      }

      const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = bookBody

      if(!isValid(title)) {
          return res.status(400).send({status: false, message: 'title is required'})
      }

      const duplicateTitle = await booksModel.findOne({title: title})

      if(duplicateTitle) {
          return res.status(400).send({status: false, message: 'Title already exist'})
      }

      if(!isValid(excerpt)) {
          return res.status(400).send({status: false, message: 'excerpt is required'})
      }

      if(!isValid(userId)) {
          return res.status(400).send({status: false, message: 'userId is required'})
      }

      if(!isValid(ISBN)) {
          return res.status(400).send({status: false, message: 'ISBN is required'})
      }

      if(!isValid(url)) {
        return res.status(400).send({status: false, message: 'url is required'})
    }

      const duplicateISBN = await booksModel.findOne({ISBN: ISBN})

      if(duplicateISBN) {
          return res.status(400).send({status: false, message: 'ISBN already exist'})
      }

      if(!isValid(category)) {
          return res.status(400).send({status: false, message: 'category is required'})
      }

      if(!isValid(subcategory)) {
          return res.status(400).send({status: false, message: 'subcategory is required'})
      }


      if(!isValid(releasedAt)) {
          return res.status(400).send({status: false, message: 'releasedAt is required'})
      }

      if(!(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(bookBody.releasedAt))) {
          return res.status(400).send({ status: false, message: "Plz provide valid released Date" })
        }
      
      const userPresent = await userModel.findById(userId)

      if(!userPresent) {
          return res.status(400).send({status: false, message: `userId ${userId} is not present`})
      }

      const reqData = { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt, url}

      const bookCreated = await booksModel.create(reqData)
      return res.status(201).send({status: true, message: 'Book Successfully Created', data: bookCreated})

  }
  catch(error) {
      return res.status(500).send({status: false, error: error.message})
  }
}


//2️⃣ GET BOOKS ........

const getbook = async function (req, res) {
  try {
   let filter = {isDeleted: false}

   if(req.query.userId) {
     if  (!(isValid(req.query.userId) && isValidObjectId(req.query.userId))){
       return res.status(400).send ({ status:  false, msg: "User Id is not valid"})
      }
    
      filter["userId"] = req.query.userId
     
   }

   if(req.query.category) {
    if  (!(isValid(req.query.category))){
      return res.status(400).send ({ status:  false, msg: "category is not avilable"})
     }
   
     filter["category"] = req.query.category
    
  }

  if(req.query.subcategory) {
    if  (!(isValid(req.query.subcategory))){
      return res.status(400).send ({ status:  false, msg: "subcategory is not avilable"})
     }
   
     filter["subcategory"] = req.query.subcategory
    
  }
    const Books = await booksModel.find(filter).select({
      title: 1, excerpt: 1, userId: 1, category: 1, 
      releasedAt: 1, reviews: 1, 
    }).sort({ title: 1 })

    if (Books.length === 0) {
      return res.status(404).send({ status: false, message: "no books found." })
    }

    res.status(200).send({ status: true, message: "books list", data: Books })
  }

  catch (err) {
    return res.status(500).send({ status: false, ERROR: err.message })

  }
}


//3️⃣GET BOOKS BY ID  .................................

let getbookdetailsById = async function (req, res) {
  try {

    const bookId = req.params.bookId

    if(!isValidObjectId(bookId)) {
      return res.status(400).send({status: false, message: 'Please provide bookId in params'})
  }

    if (!isValid(bookId)) {
      return res.status(400).send({ status: false, message: `enter a valid bookId` })
    }

    const bookById = await booksModel.findOne({ _id: bookId, isDeleted: false })//.lean()

    if (!bookById) {
      return res.status(404).send({ status: false, message: "no book found by this ID" })
    }
      const {title, excerpt, userId, ISBN, category, subcategory, releasedAt, deletedAt, isDeleted, reviews, createdAt, updatedAt} = bookById
      
  
      const Reviews = await reviewModel.find({ bookId: bookId, isDeleted: false})
     
      const book = {bookId, title, excerpt, userId, ISBN, category, subcategory, releasedAt, deletedAt, isDeleted, reviews, createdAt, updatedAt, reviewCount: Reviews.length, Reviews: Reviews}
    // bookById.reviewData = Reviews

     return res.status(200).send({ status: true, message: "Book details", data: book })


  }
  catch (err) {
    res.status(500).send({ error: err.message })
  }
}







//5️⃣UPDATE BOOK
// PUT /books/:bookId  - update
const updateBook = async function (req, res) {
  try {
      const updateBookData = {}
  let bookId = req.params.bookId
  if(!bookId) return res.status(400).send({status:false, msg:"bookId is required"})

  // Query must not be present
  const query = req.query;
  if(isValidRequestBody(query)) {
      return res.status(400).send({ status: false, msg: "Invalid parameters"});
  }

  let { title, excerpt, releasedAt, ISBN, subcategory } = req.body
 
  let titleExist = await booksModel.findOne({ title: title })
  if (titleExist) return res.status(400).send({ status: false, msg: "title exist already" })
  
  let isbnExist = await booksModel.findOne({ ISBN: ISBN })
  if (isbnExist) return res.status(400).send({ status: false, msg: "ISBN exist already" })

  let data = await booksModel.findById(bookId)
  if (!data.isDeleted == false){
      return res.status(404).send({ status: false, msg: "data is already deleted"})
}
if (subcategory) {
  let dbsubcategory = data.subcategory;
  subcategory = [...dbsubcategory,subcategory];
  subcategory = subcategory.filter((val, index, arr) => arr.indexOf(val) == index)
  req.body.subcategory = subcategory

}

  let updatedBook = await booksModel.findByIdAndUpdate({_id:bookId, isDeleted:false}, req.body,{new:true})
   return res.status(200).send({status:true, data:updatedBook})

}
  catch (err) {
      console.log("This is the error :", err.message)
      return res.status(500).send({ msg: "Error", error: err.message })
  }
}



//4️⃣ DELETE BOOK BY ID ........

let deleteById = async function (req, res) {

  try {

    const bookId = req.params.bookId

    if (!bookId) {
      return res.status(400).send({ status: false, message: "bookId is required in path params" })
    }

    if (!isValid(bookId)) {
      return res.status(400).send({ status: false, message: `enter a valid bookId` })
    }

    const bookById = await booksModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

    if (!bookById) {
      return res.status(404).send({ status: false, message: "no book found by this ID" })
    }

    const deleteBooks = await booksModel.findByIdAndUpdate(bookId, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

    res.status(200).send({ status: true, message: "book deleted successfully" })


  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}



module.exports.createBook = createBook
module.exports.getbook = getbook;
module.exports.updateBook = updateBook;
module.exports.deleteById = deleteById;
module.exports.getbookdetailsById = getbookdetailsById
















