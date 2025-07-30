require("dotenv").config();
const express = require("express");
const cors = require("cors");
const securapi = require("./Middleware/secureApi");
const checkLogin = require("./Middleware/checkLogin");
const adminCheck = require("./Middleware/checkAdmin.js");
const {submitContactForm} = require("./Controller/contactController");
const getcontacts = require("./Controller/getContactController.js");
const deletecontactmessage = require("./Controller/deleteContactMessageController.js");
const login = require("./Controller/loginController");
const adminlogin = require("./Controller/adminLoginController.js");
const pendingapproval = require("./Controller/pendingApprovalController.js");
const useroverview = require("./Controller/regUserOverviewController.js");
const userapprove = require("./Controller/userApproveController.js");
const userreject = require("./Controller/rejectUserController.js");
const deposit = require("./Controller/depositController.js");
const updatedeposit = require('./Controller/updateDepositController.js');
const deletedeposit = require("./Controller/deleteDepositController.js");
const { getUsersNotDepositedThisMonth }  = require("./Controller/depositReportController.js");
const { getUserDepositedReport }  = require("./Controller/depositOverviewController.js");
const { getMonthlyUserStats } = require('./Controller/getMonthlyUserController.js');
const { getMonthlyDepositStats } = require('./Controller/getMonthlyDepositController.js');
const {getYearlyDepositStats} = require("./Controller/getYearlyDepositController.js")
const {getYearlyMonthlyUserDeposits} =require("./Controller/getYearlyMonthlyUserDeposits.js");
const totaldeposit = require("./Controller/totalDepositController.js");
const userwisedeposit  = require("./Controller/userWiseDepositController.js");
const userdepositdetail = require("./Controller/userDepositDetailController.js");
const approveuser = require("./Controller/approveuserController.js");
const approvedusercount = require("./Controller/approvedUserCountController.js");
const pendingusercount = require("./Controller/pendingUserCountController.js");
const {depositRequestCount, withdrawCount} = require("./Controller/pendingRequestController.js");
const {registration, verifyEmail} = require("./Controller/userController");
const { getMe, updateProfile } = require("./Controller/userDetailController.js");
const userdashboard = require("./Controller/userDashboardController.js");
const userdepositlist = require("./Controller/userDepositListController.js");
const {deleteUserAndDeposits} = require("./Controller/deleteUserAndDepositsController.js");
const adminReg = require("./Controller/adminRegController");
const {
  createDepositRequest,
  getAllDepositRequests,
  approveOrRejectDepositRequest,
  getMyMissingDepositMonths,
  getMyDepositRequests,
} = require("./Controller/depositRequestController");
const {
  requestWithdrawal,
  getMyWithdrawal,
  getAllWithdrawal,
  processWithdrawal,
  getTotalWithdrawAmount,
  getTotalPenalty,
  getTotalActiveDeposit,
} = require("./Controller/withdrawController");
const closedDpsWithdrawReport = require("./Controller/closeDpsWithdrawReportController.js");
const {getWithdrawnUserFullDetails} = require("./Controller/userDetailWithWithdrawController.js");
const dbConnection = require("./helper/dbConnection");
const multer = require("multer");
const path = require("path");
const upload = require("./Middleware/upload");
const updateimg = require("./Middleware/updateimg");


const app =express();

dbConnection();

app.use(express.json());

app.use(cors({
  origin: ['https://trust1xdps.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use("/uploads", express.static("uploads"));



app.post("/contact", securapi, submitContactForm);
app.get("/getcontacts", adminCheck, getcontacts);
app.delete("/deletemessage/:id", adminCheck, deletecontactmessage);
app.post("/login", securapi, login);
app.post("/adminLogin", securapi, adminlogin);
app.get("/useroverview", adminCheck, useroverview );
app.patch("/userapprove/:id", adminCheck, userapprove);
app.delete("/userreject/:id", adminCheck, userreject);
app.get("/depositreport", adminCheck,  getUsersNotDepositedThisMonth);
app.get("/depositoverview", adminCheck, getUserDepositedReport);
app.get("/getmonthlyuser", adminCheck,  getMonthlyUserStats );
app.get("/getmonthlydeposit", adminCheck, getMonthlyDepositStats );
app.get("/getyearlydeposit", adminCheck,  getYearlyDepositStats);
app.get("/getyearlymonthlyuserdeposits", adminCheck, getYearlyMonthlyUserDeposits);
app.post("/deposit/:id", adminCheck, deposit);
app.put("/updatedeposit/:id", adminCheck, updatedeposit );
app.delete("/deletedeposit/:id", adminCheck, deletedeposit);
app.get("/totaldeposit", adminCheck, totaldeposit);
app.get("/userwisedeposit", adminCheck, userwisedeposit);
app.get("/userdepositdetail/:id", adminCheck, userdepositdetail);
app.get("/approveuser", adminCheck, approveuser);
app.get("/approvedusercount", adminCheck, approvedusercount);
app.get("/pendingusercount", adminCheck, pendingusercount);
app.get("/depositrequestcount", adminCheck, depositRequestCount);
app.get("/withdrawcount", adminCheck, withdrawCount);
app.get("/pendingapproval", adminCheck, pendingapproval);
app.post("/user", updateimg.single('image'), securapi, registration);
app.get("/verify/:token", securapi, verifyEmail);
app.get("/me", checkLogin, getMe);
app.put("/update", checkLogin, updateimg.single('image'), updateProfile);
app.get("/userdashboard", checkLogin, userdashboard);
app.get("/userdepositlist", checkLogin, userdepositlist);
app.delete("/deleteuseranddeposites/:id", adminCheck, deleteUserAndDeposits)
app.post("/adminreg", securapi, adminReg);
app.post("/createdepositrequest", checkLogin, createDepositRequest);
app.get("/getalldepositrequests", adminCheck, getAllDepositRequests);
app.patch("/approveorrejectdepositrequest/:id", adminCheck, approveOrRejectDepositRequest);
app.get("/getmymissingdepositmonths", checkLogin, getMyMissingDepositMonths);
app.get("/getmydepositrequests", checkLogin, getMyDepositRequests);
app.post("/requestwithdrawal", checkLogin, requestWithdrawal);
app.get("/getmywithdrawal", checkLogin, getMyWithdrawal);
app.get("/getallwithdrawal", adminCheck, getAllWithdrawal);
app.post("/processwithdrawal", adminCheck, processWithdrawal);
app.get("/gettotalwithdrawamount", adminCheck, getTotalWithdrawAmount);
app.get("/gettotalpenalty", adminCheck, getTotalPenalty);
app.get("/gettotalactivedeposit", adminCheck, getTotalActiveDeposit);
app.get("/closeddpswithdrawreport", adminCheck, closedDpsWithdrawReport);
app.get("/userdetailwithwithdraw/:id", adminCheck, getWithdrawnUserFullDetails)

app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
