let Todolist = require("../Model/todoListModel")

let getAlltodolist = async (req, res )=>{
    
    try {
        let data = await Todolist.find({}).populate("postedBy")
    
        res.send(data);
    } catch (error) {
        res.send(error.message);
    }
}

module.exports = getAlltodolist