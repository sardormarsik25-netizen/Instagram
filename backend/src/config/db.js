const mongoose = require("mongoose")
const dns = require("dns")

// ISP DNS (nano.uz) Node.js dan SRV so'rovlarini bloklayapti — Google DNS ga o'tamiz
dns.setServers(["8.8.8.8", "8.8.4.4"])

const ConnectDb = async () => {
    try{
       await mongoose.connect(process.env.MONGO_URI)
       console.log('MongoDB ishladi');
    } catch (e){
        console.log(e.message);
        process.exit(1);
    }
}

module.exports = ConnectDb
