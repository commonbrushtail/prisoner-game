import { Provider } from "react-redux";
import { store } from "../store/store";
import { amplifyInit } from "../utils/amplify";
import Layout from "../components/Layout/Layout.component";
import "../styles/globals.css";
function MyApp({ Component, pageProps }) {
  amplifyInit();
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;
