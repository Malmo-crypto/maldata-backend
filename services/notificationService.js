const Notification =
require("../models/Notification");


exports.sendNotification = async ({
userId,
type,
title,
message,
metadata={}
})=>{


return await Notification.create({

userId,

type,

title,

message,

metadata

});


};