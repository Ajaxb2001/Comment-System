import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import "../CSS/Header.css";
import { ReactComponent as GoogleLogo } from "../google-logo.svg"; // Adjust the path if needed

const Header = () => {
  const [user] = useAuthState(auth);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // User signed in successfully.
        console.log("User signed in:", result.user);
      })
      .catch((error) => {
        if (error.code === "auth/popup-closed-by-user") {
          console.log("User closed the popup before completing the sign-in.");
        } else {
          console.error("Sign-in error:", error);
        }
      });
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("User signed out successfully.");
    });
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Comment Section</h1>
        <div className="auth-wrapper">
          {user ? (
            <div className="user-profile">
              <img className="user-photo" src={user.photoURL} alt="User" />
              <div className="user-details">
                <p className="user-name">{user.displayName}</p>
                <button className="sign-out-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button className="sign-in-button" onClick={signInWithGoogle}>
              <GoogleLogo className="google-logo" />
              <span className="button-text">Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
