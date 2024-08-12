import React from 'react';

export const CollapseIcon: React.FC<{isActive?: boolean}> = ({ isActive = false }) => {
  return (
    <svg className={`w-6 h-6 ${isActive ? 'fill-white' : 'fill-gray-400'}`} viewBox="0 0 1344 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <path d="M38.095238 0h1024v1024h-1024z" fill="none"></path> {/* 移除了填充颜色，使其透明 */}
      <path
        d="M208.761905 219.526095A48.761905 48.761905 0 0 1 208.761905 121.904762h682.666666a48.761905 48.761905 0 0 1 0 97.621333H208.761905z m682.666666 584.94781A48.761905 48.761905 0 0 1 891.428571 902.095238H208.761905a48.761905 48.761905 0 0 1 0-97.621333h682.666666zM891.428571 463.238095a48.761905 48.761905 0 0 1 0 97.621334H506.794667a48.761905 48.761905 0 0 1 0-97.621334H891.428571zM359.046095 362.983619a39.058286 39.058286 0 0 1 0 55.198476L265.423238 512l93.622857 93.769143a39.058286 39.058286 0 0 1-27.550476 66.657524 38.814476 38.814476 0 0 1-27.599238-11.459048L174.189714 531.114667l-1.170285-19.260953c0-11.605333 4.534857-22.479238 12.824381-30.671238l118.052571-118.198857a39.009524 39.009524 0 0 1 55.149714 0z"
        className={`${isActive ? 'fill-white' : 'fill-gray-400'}`} // 应用条件填充颜色
      ></path>
    </svg>
  );
};
