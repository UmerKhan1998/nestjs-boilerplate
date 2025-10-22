// import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// const auth = getAuth();
// const provider = new GoogleAuthProvider();

// signInWithPopup(auth, provider).then(async (result) => {
//   const idToken = await result.user.getIdToken();
  
//   const response = await fetch("/api/auth/social-login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ firebaseToken: idToken }),
//   });

//   const data = await response.json();
//   console.log(data); // Candidate + token
// });
