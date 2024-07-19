const express = require('express');
const router = express.Router();
const { Post } = require("../models/post");
const {PostHistory} = require('../models/postHistory'); 
const { User } = require("../models/User");

router.post('/closepost', async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const postHistory = new PostHistory(post.toObject());
    await postHistory.save();

    await Post.findByIdAndDelete(postId);



    res.status(200).send('Post closed successfully');
  } catch (error) {
    console.error('Error closing post:', error);
    res.status(500).send('Server error while closing post');
  }
});



  router.get("/reademployerpost", async (req, res)=>{
    try{
      const employerid =req.query.employerid;
    
      await PostHistory.find({employerid: employerid} )
      
    .then(Post => res.json(Post))
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while reading post")
  
    }
  })

  
    // delete post
router.delete('/deletepost/:id', async (req, res) => {
  try {
      const postId = req.params.id;
     const post = await PostHistory.findOneAndDelete({ _id: postId });

 
      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }

      const userFilter = { _id:  post.employerid }

      const userUpdate = { $inc: { 'freelancerprofile.gudayhistory.jobs': -1 } };
      const user = await User.findOneAndUpdate(userFilter, userUpdate, { new: true });
      if (!user) {
        return res.status(404).json({ message: "employer not found" });
      }

      return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
      console.error('Error deleting post:', error.message);
      return res.status(500).json({ error: 'Server error' });
  }
});


  

module.exports = router;
