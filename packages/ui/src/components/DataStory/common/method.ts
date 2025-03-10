// for debugging.
export const areEqual = (prevProps, nextProps) => {
  Object.entries(nextProps).forEach(([key, val]) => {
    if (prevProps[key] !== val) {
      console.log(`Prop '${key}' changed DataStory`);
      console.log('prev:', prevProps[key]);
      console.log('next:', val);
    }
  });

  // Returning false means the component will always re-render, primarily for debugging purposes.
  return false;
}
