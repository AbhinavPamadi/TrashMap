import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

import {
  query,
  orderByChild,
  equalTo,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("loggedInUserId", user.uid); // Store userId
    console.log("User ID:", user.uid);
    fetchUserDetails(user.uid); // Fetch user details using UID
  } else {
    console.log("User is not logged in");
    window.location.href = "login.html"; // Redirect to login if not logged in
  }
});

const logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error Signing out:", error);
    });
});
document.getElementById("contact").addEventListener("click", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var email = getElementVal("email");
  var phone = getElementVal("phone");
  var subject = getElementVal("subject");
  var msg = getElementVal("msg");

  saveMessages(name, email, phone, subject, msg);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert and rest the form
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
    document.getElementById("contactusForm").reset();
  }, 3000);
}

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
//---ignore start
const saveMessages = (name, email, phone, subject, msg) => {
  const contactusDB = getDatabase(app);
  set(ref(contactusDB, "Contact/" + name), {
    name: name,
    email: email,
    phone: phone,
    subject: subject,
    msg: msg,
  });
};

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
//---ignore ends

function fetchUserDetails(userId) {
  const userRef = ref(db, "users/" + userId); // Directly fetch user by userId

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User Found:", userData);

        // Update the points in the UI
        const userPoints = userData.points || 0; // Default to 0 if not present
        document.getElementById("user-points").textContent = userPoints;
      } else {
        console.log("No user found with the given ID.");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
