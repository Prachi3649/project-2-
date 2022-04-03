
//aws require
const aws = require("aws-sdk")

aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKeyId: "qGG1HE0qRixcW1T1Wg1bv+08tQrIkFVyDFqSft4J",
        region: "ap-south-1"

    }
)




let uploadeFile = async function (file) {

    return new Promise(function (resolve, reject){

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        var uploadParams = {

            ACL: "public-read",
            Bucket: "classroom -training-bucket",
            Key: "myfolder/" + file.originalName,
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {

            if (err) { return  reject ({ "error": err } )}
            console.log(data)
            console.log("file uploaded successfully")
            return resolve (data)
        }
        )
    })
}

const writeToAWS = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {


            let uploadedFilesURL = uploadeFile(files[0])
            return res.status(201).send({ msg: "file uploade successfuly",  data: uploadedFilesURL })
        }

        else {
            return res.status(400).send({ msg: "no file found" })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err })
    }
}

module.exports.writeToAWS=writeToAWS