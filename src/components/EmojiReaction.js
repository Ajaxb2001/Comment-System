import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import "../CSS/CommentList.css";

const EmojiReaction = ({ commentId, reactions }) => {
  const [clickedEmoji, setClickedEmoji] = useState(null);

  const handleReaction = async (emoji) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      const docSnap = await commentRef.get();
      const existingReactions = docSnap.data().reactions || {};
      const updatedReactions = {
        ...existingReactions,
        [emoji]: (existingReactions[emoji] || 0) + 1,
      };
      await updateDoc(commentRef, { reactions: updatedReactions });

      setClickedEmoji(emoji); // Set the clicked emoji
      setTimeout(() => setClickedEmoji(null), 500); // Clear after animation
    } catch (error) {
      console.error("Error updating reactions: ", error);
    }
  };

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <div className="emoji-reaction">
      <div className="emoji-container">
        {emojis.map((emoji) => (
          <div
            key={emoji}
            className={`emoji-button ${
              clickedEmoji === emoji ? "clicked" : ""
            }`}
            onClick={() => handleReaction(emoji)}
          >
            <span className="emoji">{emoji}</span>
          </div>
        ))}
      </div>
      <div className="emoji-reactions-display">
        {Object.entries(reactions).map(([emoji, count]) => (
          <div key={emoji} className="emoji-reaction-display">
            <span className="emoji">{emoji}</span>
            <span className="reaction-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiReaction;
