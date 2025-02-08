import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCui4rUSBEeRa0pYFzPBkvFd4amdfCAlM4",
  authDomain: "reactdemo-84e45.firebaseapp.com",
  databaseURL: "https://reactdemo-84e45-default-rtdb.firebaseio.com",
  projectId: "reactdemo-84e45",
  storageBucket: "reactdemo-84e45.appspot.com",
  messagingSenderId: "921002504696",
  appId: "1:921002504696:web:886580d928bd8d9357a60d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

let userId = null; // Store logged-in user's UID
let uploadedImageURL = "";
let currentLatitude = null;
let currentLongitude = null;

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid; // Get UID of logged-in user
    fetchUserPoints(); // Fetch user's points
  } else {
    alert("Please log in to submit data.");
    window.location.href = "login.html"; // Redirect to login page if not logged in
  }
});

// Get current geolocation
navigator.geolocation.getCurrentPosition(
  (position) => {
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
  },
  (error) => {
    console.error("Error retrieving geolocation:", error);
  }
);

// Function to upload an image
async function uploadImage() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (file) {
    try {
      const imageRef = storageRef(storage, `uploaded_images/${file.name}`);
      await uploadBytes(imageRef, file);
      uploadedImageURL = await getDownloadURL(imageRef);
      document.getElementById("imagePreview").src = uploadedImageURL;
      console.log("Image uploaded successfully:", uploadedImageURL);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  } else {
    console.error("No file selected");
  }
}

// Attach event listener to upload button
document.getElementById("uploadImage").addEventListener("click", uploadImage);

// Function to update user points
async function updateUserPoints() {
  if (!userId) return; // Ensure user is logged in

  const userPointsRef = dbRef(database, `users/${userId}/points`);

  try {
    const snapshot = await get(userPointsRef);
    let currentPoints = snapshot.exists() ? Number(snapshot.val()) : 0; // Ensure it's a number
    if (isNaN(currentPoints)) currentPoints = 0; // Fallback to 0 if not a number

    const newPoints = currentPoints + 100;

    await set(userPointsRef, newPoints); // Store as a plain number
    document.getElementById("user-points").textContent = `Points: ${newPoints}`;
    console.log("User points updated:", newPoints);
  } catch (error) {
    console.error("Error updating points:", error);
  }
}

// Handle form submission
document
  .getElementById("litterForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!userId) {
      alert("You must be logged in to submit.");
      return;
    }

    const pincodeValue = document.getElementById("pincode").value.trim();
    const descriptionValue = document
      .getElementById("description")
      .value.trim();
    const landmarkIdValue = document.getElementById("landmarkId").value.trim();

    if (
      !pincodeValue ||
      !descriptionValue ||
      !uploadedImageURL ||
      !landmarkIdValue ||
      currentLatitude === null ||
      currentLongitude === null
    ) {
      alert("Please complete all fields.");
      return;
    }

    const pincodeRef = dbRef(database, `litters/${pincodeValue}`);
    const newLitterRef = push(pincodeRef);

    try {
      await set(newLitterRef, {
        userId,
        pincode: pincodeValue,
        description: descriptionValue,
        imageURL: uploadedImageURL,
        landmarkId: landmarkIdValue,
        latitude: currentLatitude,
        longitude: currentLongitude,
        timestamp: Date.now(),
      });

      alert("Submission successful!");
      document.getElementById("litterForm").reset();
      document.getElementById("imagePreview").src = "";
      uploadedImageURL = "";

      // Update user points
      await updateUserPoints();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error submitting data. Please try again.");
    }
  });

// Function to fetch user points
async function fetchUserPoints() {
  if (!userId) return;

  const userPointsRef = dbRef(database, `users/${userId}/points`);

  try {
    const snapshot = await get(userPointsRef);
    let points = snapshot.exists() ? Number(snapshot.val()) : 0; // Ensure it's a number
    if (isNaN(points)) points = 0; // Prevent NaN display

    document.getElementById("user-points").textContent = `Points: ${points}`;
  } catch (error) {
    console.error("Error fetching points:", error);
  }
}
