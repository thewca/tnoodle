const getSearchParams = () => {
  let urlSplit = window.location.href.split("?");
  let search = urlSplit.length < 2 ? "" : "?" + urlSplit[urlSplit.length - 1];
  return search;
};

const linkWithQueryParams = link => {
  return link + getSearchParams();
};

export default linkWithQueryParams;
