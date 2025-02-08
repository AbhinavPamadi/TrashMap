import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCui4rUSBEeRa0pYFzPBkvFd4amdfCAlM4",
  authDomain: "reactdemo-84e45.firebaseapp.com",
  databaseURL: "https://reactdemo-84e45-default-rtdb.firebaseio.com",
  projectId: "reactdemo-84e45",
  storageBucket: "reactdemo-84e45.appspot.com",
  messagingSenderId: "921002504696",
  appId: "1:921002504696:web:886580d928bd8d9357a60d",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ Ensure JavaScript is Loaded
console.log("✅ blackspots.js Loaded Successfully!");

// ✅ Event Listener for "Search" Button
document.getElementById("searchPincode").addEventListener("click", () => {
  const pincodeInput = document.getElementById("pincode");
  if (!pincodeInput) {
    console.error("❌ Error: Pincode input (#pincode) not found in DOM.");
    return;
  }

  const pincode = pincodeInput.value.trim();
  if (!pincode) {
    alert("⚠️ Please enter a valid pincode.");
    return;
  }

  console.log("🔍 Searching for Pincode:", pincode);
  fetchPincodeData(pincode);
});

// ✅ Fetch Pincode Data from Firebase
function fetchPincodeData(pincode) {
  const pincodeRef = dbRef(database, "litters"); // Reference to "litters" collection

  // 🔄 Listen for changes in Firebase Database
  onValue(
    pincodeRef,
    (snapshot) => {
      const data = snapshot.val();
      console.log("🔥 Firebase Data Retrieved:", data);

      if (!data) {
        console.error("❌ No data found in 'litters'. Check Firebase.");
        alert("❌ No records found in Firebase for the given pincode.");
        return;
      }

      const pincodeFrequency = {};

      // 🔹 Loop through each record and count occurrences of pincodes
      Object.values(data).forEach((record) => {
        if (record.pincode) {
          console.log("📍 Record Found:", record);
          if (!pincodeFrequency[record.pincode]) {
            pincodeFrequency[record.pincode] = 0;
          }
          pincodeFrequency[record.pincode]++;
        }
      });

      console.log("✅ Processed Pincode Data:", pincodeFrequency);
      updateTable(pincodeFrequency, pincode);
    },
    (error) => {
      console.error("❌ Error Fetching Data:", error);
    }
  );
}

// ✅ Update Table with Pincode Frequency Data
function updateTable(frequencyData, searchedPincode) {
  const tbody = document.querySelector("#frequencyTable tbody");

  if (!tbody) {
    console.error("❌ Error: Table body (#frequencyTable tbody) not found.");
    return;
  }

  tbody.innerHTML = ""; // Clear previous results

  let found = false;

  for (const [pincode, frequency] of Object.entries(frequencyData)) {
    if (!searchedPincode || searchedPincode === pincode) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${pincode}</td><td>${frequency}</td>`;
      tbody.appendChild(row);
      found = true;
    }
  }

  if (!found) {
    console.warn("⚠️ No matching pincode found.");
    alert("⚠️ No records found for the entered pincode.");
  } else {
    console.log("✅ Table Updated Successfully.");
  }
}
