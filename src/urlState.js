const urlState = {
  get() {
    return decodeURIComponent(window.location.hash.slice(1))
      .split(" ")
      .filter(Boolean);
  },
  set(sentence) {
    window.location.hash = encodeURIComponent(sentence.join(" "));
  },
};

export default urlState;
