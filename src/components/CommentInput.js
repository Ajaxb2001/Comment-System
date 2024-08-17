import React, { useState } from "react";
import { Editor, EditorState, RichUtils, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import { db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiLink,
  BiImage,
  BiFilm,
} from "react-icons/bi"; // Added BiFilm for GIF
import "../CSS/CommentInput.css";

const CommentInput = () => {
  const [user] = useAuthState(auth);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [image, setImage] = useState(null);
  const [gif, setGif] = useState(null); // New state for GIF
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const promptForLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      setShowLinkInput(true);
    }
  };

  const confirmLink = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      { url: linkUrl }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newContentState = Modifier.applyEntity(
      contentStateWithEntity,
      selection,
      entityKey
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "apply-entity"
    );
    setEditorState(newEditorState);
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const submitComment = async () => {
    if (!user) {
      alert("You need to be logged in to submit a comment.");
      return;
    }

    const contentState = editorState.getCurrentContent();
    const commentText = contentState.getPlainText();

    if (commentText.trim() === "") return;

    await addDoc(collection(db, "comments"), {
      text: commentText,
      image: image,
      gif: gif, // Include GIF in the submission
      createdAt: serverTimestamp(),
      user: user?.displayName || "Anonymous",
      userPhoto: user?.photoURL || "",
    });

    setEditorState(EditorState.createEmpty());
    setImage(null);
    setGif(null); // Reset GIF after submission
  };

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileUrl = URL.createObjectURL(file);

      if (file.type === "image/gif") {
        setGif(fileUrl); // Handle GIF upload
      } else {
        setImage(fileUrl); // Handle image upload
      }
    }
  };

  return (
    <div className="comment-card-container">
      <div className="comment-card">
        <div className="comment-toolbar">
          <BiBold
            className="toolbar-icon"
            title="Bold"
            onClick={() => toggleInlineStyle("BOLD")}
          />
          <BiItalic
            className="toolbar-icon"
            title="Italic"
            onClick={() => toggleInlineStyle("ITALIC")}
          />
          <BiUnderline
            className="toolbar-icon"
            title="Underline"
            onClick={() => toggleInlineStyle("UNDERLINE")}
          />
          <BiLink
            className="toolbar-icon"
            title="Add Link"
            onClick={promptForLink}
          />
          <label htmlFor="image-upload">
            <BiImage className="toolbar-icon" title="Attach Image" />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <label htmlFor="gif-upload">
            <BiFilm className="toolbar-icon" title="Attach GIF" />
          </label>
          <input
            id="gif-upload"
            type="file"
            accept="image/gif"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        {showLinkInput && (
          <div className="link-input-modal">
            <input
              type="text"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button onClick={confirmLink}>Add Link</button>
            <button onClick={() => setShowLinkInput(false)}>Cancel</button>
          </div>
        )}
        <div className="comment-editor">
          <Editor
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            onChange={setEditorState}
            placeholder="Write a comment..."
          />
        </div>
        {image && (
          <div className="image-preview">
            <img
              src={image}
              alt="Comment Attachment"
              className="image-preview-img"
            />
          </div>
        )}
        {gif && (
          <div className="gif-preview">
            <img src={gif} alt="GIF Attachment" className="gif-preview-img" />
          </div>
        )}
        <button className="comment-button" onClick={submitComment}>
          Send
        </button>
      </div>
    </div>
  );
};

export default CommentInput;
