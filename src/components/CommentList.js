import React, { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import EmojiReaction from "./EmojiReaction";
import moment from "moment";
import "../CSS/CommentList.css";

const CommentList = () => {
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const fetchComments = useCallback(() => {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const handleReply = async (parentId) => {
    if (replyText.trim()) {
      const commentRef = doc(db, "comments", parentId);
      try {
        await updateDoc(commentRef, {
          replies: arrayUnion({
            user: "Current User", // Replace with actual user data
            userPhoto: "https://example.com/photo.jpg", // Replace with actual user photo
            text: replyText,
            createdAt: serverTimestamp(),
            reactions: {},
          }),
        });
        setReplyText("");
        setReplyTo(null);
      } catch (error) {
        console.error("Error adding reply: ", error);
      }
    }
  };

  const renderReplies = (replies) => (
    <div className="replies">
      {replies.map((reply, index) => (
        <div key={index} className="comment-item reply">
          <div className="comment-header">
            <img className="user-photo" src={reply.userPhoto} alt="User" />
            <p className="user-name">{reply.user}</p>
          </div>
          <div className="comment-body">
            <p className="comment-text">{reply.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const [expandedComments, setExpandedComments] = useState([]);

  const toggleExpandComment = (commentId) => {
    setExpandedComments((prevExpanded) =>
      prevExpanded.includes(commentId)
        ? prevExpanded.filter((id) => id !== commentId)
        : [...prevExpanded, commentId]
    );
  };

  const renderCommentText = (text, commentId) => {
    const lines = text.split("\n");
    const isLongComment = lines.length > 5;
    const isExpanded = expandedComments.includes(commentId);

    if (!isLongComment) return text;

    return (
      <>
        {isExpanded ? lines.join("\n") : lines.slice(0, 5).join("\n")}
        <button
          onClick={() => toggleExpandComment(commentId)}
          className="show-more-button"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </>
    );
  };

  return (
    <div className="comment-list-container">
      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <div className="comment-header">
            <img className="user-photo" src={comment.userPhoto} alt="User" />
            <p className="user-name">{comment.user}</p>
            <span className="comment-time">
              {moment(comment.createdAt?.toDate()).fromNow()}
            </span>
          </div>
          <div className="comment-body">
            <p className="comment-text">
              {renderCommentText(comment.text, comment.id)}
            </p>
            {comment.image && (
              <img
                className="comment-image"
                src={comment.image}
                alt="Attached"
              />
            )}
            {comment.gif && (
              <img
                className="comment-image"
                src={comment.gif}
                alt="GIF Attachment"
              />
            )}
          </div>
          <div className="comment-footer">
            <EmojiReaction
              commentId={comment.id}
              reactions={comment.reactions || {}}
            />
            <div className="action-buttons">
              <button
                className="reply-button"
                onClick={() => setReplyTo(comment.id)}
              >
                Reply
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </button>
            </div>
          </div>
          {replyTo === comment.id && (
            <div className="reply-input">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
              />
              <button onClick={() => handleReply(comment.id)}>Send</button>
            </div>
          )}
          {comment.replies && renderReplies(comment.replies)}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
