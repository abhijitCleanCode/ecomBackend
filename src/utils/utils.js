export const getEpochTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};

// used in subject
export const generateRandom3DigitNumber = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

// used in class
export const generateRandom4DigitNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
