const express = require("express");
const WrapAsync = require("../utils/WrapAsync.js");
const AdminController = require("../controllers/admin.js");
const { isAdminNotLoggedIn } = require("../middleware/auth.js");

const router = express.Router();

// Middleware to check if admin is logged in
const isAdminLoggedIn = (req, res, next) => {
    if (!req.session.admin) {
        req.flash("error", "You must be logged in as admin");
        return res.redirect("/admin/login");
    }
    next();
};

// Admin login routes
router.route("/admin/login")
    .get(isAdminNotLoggedIn, AdminController.renderAdminLoginForm)
    .post(isAdminNotLoggedIn, WrapAsync(AdminController.adminLogin));

// Admin dashboard and protected routes
router.route("/admin/dashboard")
    .get(isAdminLoggedIn, WrapAsync(AdminController.renderAdminDashboard));

router.route("/admin/add-scholarship")
    .get(isAdminLoggedIn, AdminController.renderAdminAddForm)
    .post(isAdminLoggedIn, WrapAsync(AdminController.addScholarshipByAdmin));

router.route("/admin/edit-scholarship/:id")
    .get(isAdminLoggedIn, WrapAsync(AdminController.renderAdminEditForm))
    .post(isAdminLoggedIn, WrapAsync(AdminController.editScholarshipByAdmin));

router.route("/admin/scholarship/:id/delete")
    .post(isAdminLoggedIn, WrapAsync(AdminController.deleteScholarship));

router.post("/admin/logout", AdminController.adminLogout);

module.exports = router;
