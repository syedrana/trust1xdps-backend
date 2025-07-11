// Controller/updateTodolistController.js
const Todolist = require("../Model/todoListModel");

const updateTodolist = async (req, res) => {
    const { id } = req.params;
    const { title, description, postedBy } = req.body;

    try {
        const updatedTodolist = await Todolist.findByIdAndUpdate(
            id,
            {
                title,
                description,
                postedBy,
                image: req.file ? req.file.path : undefined // Update the image only if a new file is provided
            },
            { new: true } // Return the updated document
        );

        if (!updatedTodolist) {
            return res.status(404).send("To-do list item not found");
        }

        res.status(200).json(updatedTodolist);
    } catch (error) {
        res.status(500).send("Error updating to-do list item");
    }
}

module.exports = updateTodolist;
