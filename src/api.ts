import axios from "axios";

export const sendMyBot = (api: string, value: string) => {
  try {
    axios.post(
      api,
      {
        text: value,
      },
      { timeout: 30000 }
    );
  } catch (e) {
    console.log("Error sendMyBot", e);
  }
};
