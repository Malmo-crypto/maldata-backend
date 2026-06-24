const Notification = require("../models/Notification");


// GET USER NOTIFICATIONS
exports.getUserNotifications = async (req,res)=>{

  try {

    const userId = req.user.userId;


    const notifications = await Notification
      .find({userId})
      .sort({createdAt:-1});


    res.json({
      notifications
    });


  } catch(err){

    res.status(500).json({
      error:err.message
    });

  }

};



// MARK NOTIFICATION AS READ
exports.markAsRead = async(req,res)=>{

  try {

    const userId = req.user.userId;

    const {notificationId}=req.params;


    const notification =
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId
      },
      {
        read:true
      },
      {
        new:true
      }
    );


    res.json({
      message:"Notification marked as read",
      notification
    });


  } catch(err){

    res.status(500).json({
      error:err.message
    });

  }

};