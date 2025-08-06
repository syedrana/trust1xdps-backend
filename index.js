require("dotenv").config();
const express = require("express");
const cors = require("cors");
const securapi = require("./Middleware/secureApi");
const checkLogin = require("./Middleware/checkLogin");
const adminCheck = require("./Middleware/checkAdmin.js");
const checkRole = require("./Middleware/checkRole");
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
const totaldeposit = require("./Controller/totalDepositController.js");
const userwisedeposit  = require("./Controller/userWiseDepositController.js");
const userdepositdetail = require("./Controller/userDepositDetailController.js");
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
const usdtconvater = require("./Controller/usdtConvaterController.js");
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
app.get("/getcontacts", adminCheck, checkRole(["admin"]), getcontacts);
app.delete("/deletemessage/:id", adminCheck, checkRole(["admin"]), deletecontactmessage);
app.post("/login", securapi, login);
app.post("/adminLogin", securapi, adminlogin);
app.get("/useroverview", adminCheck, checkRole(["admin"]), useroverview );
app.patch("/userapprove/:id", adminCheck, checkRole(["admin"]), userapprove);
app.delete("/userreject/:id", adminCheck, checkRole(["admin"]), userreject);
app.get("/depositreport", adminCheck, checkRole(["admin"]),  getUsersNotDepositedThisMonth);
app.get("/depositoverview", adminCheck, checkRole(["admin"]), getUserDepositedReport);
app.get("/getmonthlyuser", adminCheck, checkRole(["admin"]),  getMonthlyUserStats );
app.get("/getmonthlydeposit", adminCheck, checkRole(["admin"]), getMonthlyDepositStats );
app.get("/getyearlydeposit", adminCheck, checkRole(["admin"]),  getYearlyDepositStats);
app.post("/deposit/:id", adminCheck, checkRole(["admin"]), deposit);
app.put("/updatedeposit/:id", adminCheck, checkRole(["admin"]), updatedeposit );
app.delete("/deletedeposit/:id", adminCheck, checkRole(["admin"]), deletedeposit);
app.get("/totaldeposit", adminCheck, checkRole(["admin"]), totaldeposit);
app.get("/userwisedeposit", adminCheck, checkRole(["admin"]), userwisedeposit);
app.get("/userdepositdetail/:id", adminCheck, checkRole(["admin"]), userdepositdetail);
app.get("/approvedusercount", adminCheck, checkRole(["admin"]), approvedusercount);
app.get("/pendingusercount", adminCheck, checkRole(["admin"]), pendingusercount);
app.get("/depositrequestcount", adminCheck, checkRole(["admin"]), depositRequestCount);
app.get("/withdrawcount", adminCheck, checkRole(["admin"]), withdrawCount);
app.get("/pendingapproval", adminCheck, checkRole(["admin"]), pendingapproval);
app.get("/getalldepositrequests", adminCheck, checkRole(["admin"]), getAllDepositRequests);
app.patch("/approveorrejectdepositrequest/:id", adminCheck, checkRole(["admin"]), approveOrRejectDepositRequest);
app.delete("/deleteuseranddeposites/:id", adminCheck, checkRole(["admin"]), deleteUserAndDeposits)
app.post("/adminreg", securapi, adminReg);
app.get("/getallwithdrawal", adminCheck, checkRole(["admin"]), getAllWithdrawal);
app.post("/processwithdrawal", adminCheck, checkRole(["admin"]), processWithdrawal);
app.get("/gettotalwithdrawamount", adminCheck, checkRole(["admin"]), getTotalWithdrawAmount);
app.get("/gettotalpenalty", adminCheck, checkRole(["admin"]), getTotalPenalty);
app.get("/gettotalactivedeposit", adminCheck, checkRole(["admin"]), getTotalActiveDeposit);
app.get("/closeddpswithdrawreport", adminCheck, checkRole(["admin"]), closedDpsWithdrawReport);
app.get("/userdetailwithwithdraw/:id", adminCheck, checkRole(["admin"]), getWithdrawnUserFullDetails)

app.post("/user", updateimg.single('image'), securapi, registration);
app.get("/verify/:token", securapi, verifyEmail);
app.get("/me", checkLogin, checkRole(["user"]), getMe);
app.put("/update", checkLogin, checkRole(["user"]), updateimg.single('image'), updateProfile);
app.get("/userdashboard", checkLogin, checkRole(["user"]), userdashboard);
app.get("/userdepositlist", checkLogin, checkRole(["user"]), userdepositlist);
app.post("/createdepositrequest", checkLogin, checkRole(["user"]), createDepositRequest);
app.get("/getmymissingdepositmonths", checkLogin, checkRole(["user"]), getMyMissingDepositMonths);
app.get("/getmydepositrequests", checkLogin, checkRole(["user"]), getMyDepositRequests);
app.post("/requestwithdrawal", checkLogin, checkRole(["user"]), requestWithdrawal);
app.get("/getmywithdrawal", checkLogin, checkRole(["user"]), getMyWithdrawal);
app.get("/usdtconvater", checkLogin, checkRole(["user"]), usdtconvater);

app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
