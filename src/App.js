import React from "react";
import CommentInput from "./components/CommentInput";
import CommentList from "./components/CommentList";
import Header from "./components/Header";

const App = () => {
  return (
    <div className="App">
      <Header />
      <CommentInput />
      <CommentList />
    </div>
  );
};

export default App;
