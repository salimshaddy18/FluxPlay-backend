import multer from "multer";

// multer configuration for file uploads
// files will be stored in the public/temp directory with their original names

//cb => callback function
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})