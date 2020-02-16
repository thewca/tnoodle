const getSearchParams = () => {
  let urlSplit = window.location.hash.split("?");
  let search = urlSplit.length < 2 ? "" : "?" + urlSplit[urlSplit.length - 1];
  return search;
};

export default linkWithQueryParams = link => {
  return link + getSearchParams();
};
