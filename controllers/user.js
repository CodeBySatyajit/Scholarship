const User = require("../models/User.js");
const UserInfo = require("../models/UserInfo.js");
const bcrypt = require("bcrypt");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

// Handle User Signup
module.exports.signupUser = async (req, res) => {
    try {
        const { FirstName, LastName, Email, Mobile, Password } = req.body;

        const existingUser = await User.findOne({ $or: [{ Email }, { Mobile }] });

        if (existingUser) {
            req.flash("error", "Email or Mobile number already exists");
            return res.redirect("/signup");
        }

        const newUser = new User({
            FirstName,
            LastName,
            Email,
            Mobile,
            Password
        });

        await newUser.save();

        // Create empty UserInfo document for the new user
        const newUserInfo = new UserInfo({
            userID: newUser._id
        });
        await newUserInfo.save();

        req.session.user = {
            id: newUser._id,
            FirstName: newUser.FirstName,
            LastName: newUser.LastName,
            Email: newUser.Email,
            Mobile: newUser.Mobile
        }

        // Ensure session is persisted before redirecting
        req.session.save(() => {
            req.flash("success", "Successfully signed up! Welcome to the platform.");
            res.redirect("/dashboard");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

// Handle User Login
module.exports.loginUser = async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const user = await User.findOne({ Email });

        if (!user) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/login");
        }

        const isPasswordValid = await bcrypt.compare(Password, user.Password);

        if (!isPasswordValid) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/login");
        }

        // Store user info in session
        req.session.user = {
            id: user._id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Mobile: user.Mobile
        };

        // Ensure session is persisted before redirecting
        req.session.save(() => {
            req.flash("success", "Successfully logged in! Welcome back.");
            res.redirect("/dashboard");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/login");
    }
}

// Handle User Logout
module.exports.logoutUser = (req, res) => {
    req.session.user = null;
    req.flash("success", "You have been logged out successfully");
    res.redirect("/");
}

// Render Dashboard Home
module.exports.renderDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        let userInfo = await UserInfo.findOne({ userID: req.session.user.id });

        // If userInfo doesn't exist, create it
        if (!userInfo) {
            userInfo = new UserInfo({ userID: req.session.user.id });
            await userInfo.save();
        }

        res.render("users/dashboard.ejs", { 
            user, 
            userInfo,
            activePage: 'dashboard'
        });
    } catch (e) {
        console.error("Dashboard Error:", e);
        req.flash("error", "Error loading dashboard: " + e.message);
        res.redirect("/");
    }
}

// Render Profile Page
module.exports.renderProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        let userInfo = await UserInfo.findOne({ userID: req.session.user.id });

        // If userInfo doesn't exist, create it
        if (!userInfo) {
            userInfo = new UserInfo({ userID: req.session.user.id });
            await userInfo.save();
        }

        res.render("users/profile.ejs", { 
            user, 
            userInfo,
            activePage: 'profile'
        });
    } catch (e) {
        console.error("Profile Error:", e);
        req.flash("error", "Error loading profile: " + e.message);
        res.redirect("/dashboard");
    }
}

// Update User Profile
module.exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { FirstName, LastName, Mobile, dateOfBirth, gender, educationLevel, state, city, education, enableAIRecommendation } = req.body;

        // Update User model (basic info)
        await User.findByIdAndUpdate(userId, {
            FirstName,
            LastName,
            Mobile
        });

        // Update session data
        req.session.user.FirstName = FirstName;
        req.session.user.LastName = LastName;
        req.session.user.Mobile = Mobile;

        // Update or create UserInfo model (additional info)
        let userInfo = await UserInfo.findOne({ userID: userId });
        
        if (!userInfo) {
            userInfo = new UserInfo({ userID: userId });
        }

        userInfo.dateOfBirth = dateOfBirth || userInfo.dateOfBirth;
        userInfo.gender = gender || '';
        userInfo.educationLevel = educationLevel || '';
        userInfo.state = state || '';
        userInfo.city = city || '';
        
        // Update AI Recommendation preference
        userInfo.enableAIRecommendation = enableAIRecommendation === 'on' ? true : false;

        // Update education object if provided
        if (education) {
            if (!userInfo.education) {
                userInfo.education = {};
            }
            
            userInfo.education.class = education.class || '';
            userInfo.education.stream = education.stream || '';
            userInfo.education.board = education.board || '';
            userInfo.education.institution = education.institution || '';
            userInfo.education.passingYear = education.passingYear || '';
            userInfo.education.percentage = education.percentage || '';
            userInfo.education.academicStatus = education.academicStatus || '';
            userInfo.education.category = education.category || '';
            userInfo.education.incomeRange = education.incomeRange || '';
        }

        await userInfo.save();

        req.flash("success", "Profile updated successfully!");
        res.redirect("/profile");
    } catch (e) {
        req.flash("error", "Error updating profile: " + e.message);
        res.redirect("/profile");
    }
}

// Render Saved Scholarships Page
module.exports.renderSavedScholarships = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        let userInfo = await UserInfo.findOne({ userID: req.session.user.id }).populate('savedScholarships');

        // If userInfo doesn't exist, create it
        if (!userInfo) {
            userInfo = new UserInfo({ userID: req.session.user.id });
            await userInfo.save();
        }

        const savedScholarships = userInfo.savedScholarships || [];

        res.render("users/saved-scholarships.ejs", { 
            user, 
            userInfo,
            savedScholarships,
            activePage: 'saved'
        });
    } catch (e) {
        console.error("Saved Scholarships Error:", e);
        req.flash("error", "Error loading saved scholarships: " + e.message);
        res.redirect("/dashboard");
    }
}

// Toggle Bookmark (Save/Unsave Scholarship)
module.exports.toggleBookmark = async (req, res) => {
    try {
        const { scholarshipId } = req.params;
        const userId = req.session.user.id;

        let userInfo = await UserInfo.findOne({ userID: userId });

        if (!userInfo) {
            userInfo = new UserInfo({ userID: userId, savedScholarships: [] });
        }

        const scholarshipIndex = userInfo.savedScholarships.indexOf(scholarshipId);

        if (scholarshipIndex > -1) {
            // Scholarship already saved, remove it
            userInfo.savedScholarships.splice(scholarshipIndex, 1);
            await userInfo.save();
            return res.json({ success: true, bookmarked: false, message: 'Scholarship removed from saved list' });
        } else {
            // Scholarship not saved, add it
            userInfo.savedScholarships.push(scholarshipId);
            await userInfo.save();
            return res.json({ success: true, bookmarked: true, message: 'Scholarship saved successfully' });
        }
    } catch (e) {
        console.error("Bookmark Error:", e);
        return res.status(500).json({ success: false, message: 'Error saving scholarship: ' + e.message });
    }
}

// Update Applications Submitted
module.exports.updateApplicationsSubmitted = async (req, res) => {
    try {
        const { applicationsSubmitted } = req.body;
        const userId = req.session.user.id;

        // Validate the input
        if (applicationsSubmitted === undefined || applicationsSubmitted === null) {
            return res.status(400).json({ success: false, message: 'Applications submitted is required' });
        }

        let num = Number(applicationsSubmitted);
        if (!Number.isFinite(num) || num < 0) {
            return res.status(400).json({ success: false, message: 'Please enter a valid non-negative number' });
        }
        // enforce integer
        num = Math.floor(num);

        // Atomic upsert to avoid race conditions
        const updated = await UserInfo.findOneAndUpdate(
            { userID: userId },
            { $set: { applicationsSubmitted: num } },
            { new: true, upsert: true, runValidators: true }
        );

        return res.json({ success: true, applicationsSubmitted: updated.applicationsSubmitted, message: 'Applications count updated successfully' });
    } catch (e) {
        console.error("Update Applications Error:", e);
        return res.status(500).json({ success: false, message: 'Error updating applications: ' + e.message });
    }
}





