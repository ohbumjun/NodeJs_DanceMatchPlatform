// service 전용 js
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/dev');

aws.config.update({
  secretAccessKey : config.AWS_SECRET_ACCESS ,
  accessKeyId : config.AWS_ACCESS_KEY,
  region : "ap-northeast-2"
})
 
const app = express();
const s3 = new aws.S3({ });

function checkFileType( file, cb ){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
  // Check mime
  const mimetype = filetypes.test( file.mimetype );
 if( mimetype && extname ){
   return cb( null, true );
  } else {
   cb( 'Error: Images Only!( jpeg, jpg, png, gif)' );
  }
 }
 
// upload object를 만들고 있다
// storage를 provide 하고 있으며, storage의 이름은 multerS3 이다 
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'danceprojectmb',
    // 내가 image를 보내면, 그것을 imageurl 형태로 저장한다 . 그리고 그 image 에 대해서, public access를 줄 때 아래와 같은 코드를 작성한다 
    acl : 'public-read',
    metadata: function (req, file, cb) {
        // fieldName은 addional info를 주는 것이다
      cb(null, {fieldName: "TESTING_META_DATA"});
    },
    // 우리가 AWS에 image등을 save 하기 전에 key와 함께 저장을 할 것이다 . 이 경우 key는 timestamp로 구성될 것이다. 다시 말해서 이 key에 대항하는 것은 우리가 save 한 file일 것이다 
    key: function (req, file, cb) {
      var newFileName = Date.now()+"-"+file.originalname;
      // 특정 파일을 지정한다 
      var fullPath = 'Profile/'+newFileName;
      cb(null,fullPath)
    },
    // 파일 사이즈의 크기를 제한한다: 20000000 bytes = 20MB
    // limits: { fileSize: 20000000 },
    fileFilter : function( req, file, cb){
      checkFileType(file, cb);
    }
  })
})


module.exports = upload;