const Contact = require('../Model/contactModel');

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // সর্বশেষ আগে
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
};

module.exports = getContacts;
