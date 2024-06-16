
export const hashtag_Picker = (str) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;

  while ((match = hashtagRegex.exec(str)) !== null) {
    hashtags.push(match[0]);
  }

  return hashtags;
};

