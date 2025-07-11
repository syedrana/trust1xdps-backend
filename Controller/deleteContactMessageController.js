const Contact = require("../Model/contactModel");

// DELETE a contact message by ID
const deleteContactMessage = async (req, res) => {
  try {
    const contactId = req.params.id;

    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.status(200).json({ message: "Contact message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error while deleting contact" });
  }
};

module.exports = deleteContactMessage;