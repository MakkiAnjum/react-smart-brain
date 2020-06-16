import React from "react";

function Rank({ name, entries }) {
  return (
    <>
      <div className="white f3">{`${name}, You rank is...`}</div>
      <div className="white f1">{`${entries}`}</div>
    </>
  );
}

export default Rank;
