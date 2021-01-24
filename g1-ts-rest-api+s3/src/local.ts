import { localApp } from "./app";

const port = 4001;

localApp.listen(port, () => {
  console.log(`Listening to web server locally at http://localhost:${port}`);
});
