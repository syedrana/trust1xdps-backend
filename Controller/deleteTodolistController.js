// Controller/deleteTodolistController.js
const Todolist = require("../Model/todoListModel");

const deleteTodolist = async (req, res) => {
    
    const { id } = req.params;
    
    try {
        const deletedTodolist = await Todolist.findByIdAndDelete(id);

        if (deletedTodolist) {
            return res.status(404).send("To-do list item not found");
        } 

        res.status(200).send("To-do list item deleted successfully");

    } catch (error) {
        res.status(500).send("Error deleting to-do list item");
    }
}

module.exports = deleteTodolist;
