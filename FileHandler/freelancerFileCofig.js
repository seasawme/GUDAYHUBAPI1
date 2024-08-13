const path = require('path');
const fs = require('fs');
const multer = require('multer');



// Ensure upload directory exists
const uploadDocDir = path.join(__dirname, '../public/documents' );

if (!fs.existsSync(uploadDocDir)) {
  console.log(`Directory ${uploadDocDir} does not exist. Creating...`);
  fs.mkdirSync(uploadDocDir, { recursive: true });
  console.log(`Directory ${uploadDocDir} created successfully.`);
} else {
  console.log(`Directory ${uploadDocDir} already exists.`);
}

// Configure Multer storage
const storageDoc = multer.diskStorage({
  destination: function (req, file, cb) {
    
    cb(null, uploadDocDir); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const uploadDoc = multer({ storage: storageDoc });

module.exports = uploadDoc;