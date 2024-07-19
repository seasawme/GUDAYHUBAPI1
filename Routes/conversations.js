const express = require("express");
const router = express.Router();
const {Conversation} = require("../models/Conversation");


//new conversation

router.post("/", async (req,res)=>{
    const senderid = req.body.senderId
    const reciverid= req.body.receiverId
    try{
        const conversation = await Conversation.findOne({
            member: { $all: [senderid, reciverid] }
        });
        console.log(conversation)
     if(conversation){
        res.status(200).json(conversation)
        console.log("a" + conversation)
     }else{
        const newConversation = new Conversation({
            member:[senderid, reciverid],
        })

      const savedConversation = await newConversation.save();
      console.log(savedConversation)
      res.status(200).json(savedConversation) 
    }
    }catch(err){
        res.status(500).json(err)
    }
})

//get conversation

router.get("/:userId", async (req,res)=>{
    try{
        const conversation = await Conversation.find({
            member: { $in:[req.params.userId]}
        });
        res.status(200).json(conversation)
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports = router;
