import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCui4rUSBEeRa0pYFzPBkvFd4amdfCAlM4",
  authDomain: "reactdemo-84e45.firebaseapp.com",
  projectId: "reactdemo-84e45",
  storageBucket: "reactdemo-84e45.appspot.com",
  messagingSenderId: "921002504696",
  appId: "1:921002504696:web:886580d928bd8d9357a60d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ On User Login, Fetch Details Using Email
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("loggedInUserEmail", user.email); // Store email
    console.log("User Email:", user.email);
    fetchUserDetailsByEmail(user.email); // Fetch details using email
  } else {
    console.log("User is not logged in");
    window.location.href = "login.html";
  }
});

// ✅ Logout Function
const logoutButton = document.getElementById("logout");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("loggedInUserEmail");
    signOut(auth)
      .then(() => {
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Error Signing out:", error);
      });
  });
}

// ✅ Fetch User Details by Email
function fetchUserDetailsByEmail(email) {
  const usersRef = ref(db, "users");
  const userQuery = query(
    usersRef,
    orderByChild("email"),
    equalTo(email.toLowerCase())
  );

  get(userQuery)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userId = Object.keys(users)[0]; // Get the first matching user
        const userData = users[userId];

        console.log("User Found:", userData);

        // Update UI Elements if available
        const nameElement = document.getElementById("fName");
        const emailElement = document.getElementById("rEmail");
        const pointsElement = document.getElementById("user-points");

        if (nameElement) nameElement.textContent = userData.name || "Unknown";
        if (emailElement)
          emailElement.textContent = userData.email || "No Email";
        if (pointsElement) pointsElement.textContent = userData.points || 0;
      } else {
        console.log("No user found with this email.");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// ✅ Save User Data to Firebase (During Signup)
function saveUserData(userId, name, email) {
  set(ref(db, "users/" + userId), {
    name: name,
    email: email.toLowerCase(), // Store email in lowercase for uniformity
    points: 0, // Default points set to 0
  })
    .then(() => {
      console.log("User data saved successfully.");
    })
    .catch((error) => {
      console.error("Error saving user data:", error);
    });
}

// ✅ Signup Function (Modify Form to Include Name)
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        saveUserData(user.uid, name, email);
        console.log("User signed up:", user);
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        console.error("Signup error:", error.message);
      });
  });
}

// ✅ Contact Form Submission
document.getElementById("contact")?.addEventListener("click", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var email = getElementVal("email");
  var phone = getElementVal("phone");
  var subject = getElementVal("subject");
  var msg = getElementVal("msg");

  saveMessages(name, email, phone, subject, msg);

  // Enable alert
  document.querySelector(".alert").style.display = "block";

  // Remove alert & reset form
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
    document.getElementById("contactusForm").reset();
  }, 3000);
}

// ✅ Helper Function: Get Form Input Value
const getElementVal = (id) => {
  return document.getElementById(id)?.value;
};

// ✅ Save Contact Form Data to Firebase
const saveMessages = (name, email, phone, subject, msg) => {
  set(ref(db, "Contact/" + name), {
    name: name,
    email: email,
    phone: phone,
    subject: subject,
    msg: msg,
  });
};

// ✅ Scroll Effect for Navbar
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-10px";
  }
}
