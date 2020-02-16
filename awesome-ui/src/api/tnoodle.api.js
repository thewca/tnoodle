export const fetchZip = wcif => {
  console.log(wcif);

  fetch("http://localhost:2014/wcif/zip", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        'wcif': wcif
    })
  })
    .then(response => {
      console.log(response);
    })
    .catch(e => console.log(e));
};
