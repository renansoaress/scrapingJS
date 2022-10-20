import axios from "axios";

export const sendMyBot = (api: string, value: string) => {
  axios
    .post(api, {
      text: value,
    })
    .then(console.log)
    .catch(console.log);
};
