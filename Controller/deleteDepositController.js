const Deposit = require('../Model/depositModel'); 

const deleteDeposit = async (req, res) => {
  try {
  const { id } = req.params;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    await Deposit.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    console.error('Error deleting deposit:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = deleteDeposit;
