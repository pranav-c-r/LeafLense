import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="relative inline-block w-12 h-6">
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0 peer"
        checked={theme === 'dark-theme'}
        onChange={toggleTheme}
      />
      <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0
        rounded-full transition-colors duration-300
        ${theme === 'dark-theme' ? 'bg-gray-700' : 'bg-gray-300'}
        before:absolute before:content-[''] before:h-5 before:w-5 before:left-[2px] before:bottom-[2px]
        before:rounded-full before:bg-white before:transition-transform before:duration-300
        peer-checked:before:translate-x-6`}>
      </span>
    </label>
  );
};

export default ThemeToggle;
