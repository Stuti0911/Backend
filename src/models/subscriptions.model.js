import mongoose from "mongoose";

const subscriptionSchema= mongoose.Schema(
    {
        subscriber:{  //one who is subscribing
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{ //channel to which subscribed
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },{timeStamps:true}
)

export const Subsciption= mongoose.model("Subscription",subscriptionSchema)