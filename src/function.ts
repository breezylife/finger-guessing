export const handleRandomColor = () => {
  return `rgb(${Math.floor(Math.random() * 180)},${Math.floor(
    Math.random() * 180
  )},${Math.floor(Math.random() * 180)})`;
};
