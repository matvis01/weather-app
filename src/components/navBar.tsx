import React from "react";

const cloud = (
  <>
    <svg fill="currentColor" viewBox="0 0 16 16" className=" w-10">
      <path d="M11.473 11a4.5 4.5 0 00-8.72-.99A3 3 0 003 16h8.5a2.5 2.5 0 000-5h-.027z" />
      <path d="M10.5 1.5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zm3.743 1.964a.5.5 0 10-.707-.707l-.708.707a.5.5 0 00.708.708l.707-.708zm-7.779-.707a.5.5 0 00-.707.707l.707.708a.5.5 0 10.708-.708l-.708-.707zm1.734 3.374a2 2 0 113.296 2.198c.199.281.372.582.516.898a3 3 0 10-4.84-3.225c.352.011.696.055 1.028.129zm4.484 4.074c.6.215 1.125.59 1.522 1.072a.5.5 0 00.039-.742l-.707-.707a.5.5 0 00-.854.377zM14.5 6.5a.5.5 0 000 1h1a.5.5 0 000-1h-1z" />
    </svg>
    <p className="text-2xl">Weather</p>
  </>
);

function navBar() {
  return (
    <div className="join md:join-vertical   h-full flex items-center  justify-center  gap-20">
      <div className=" join-item flex flex-col justify-center  items-center cursor-pointer">
        {cloud}
      </div>
      <button className="btn join-item">Locations</button>
    </div>
  );
}

export default navBar;