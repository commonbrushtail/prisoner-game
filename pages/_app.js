import { Provider } from "react-redux";
import { store } from "../store/store";
import Loading from "../components/Layout/Loading.component";
import "../styles/globals.css";
import DefaultLayout from "../components/Layout/DefaultLayout.component";

function MyApp({ Component, pageProps }) {
  const Layout = Component.Layout || DefaultLayout;
  return (
    <Provider store={store}>
      <Loading>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Loading>
    </Provider>
  );
}

export default MyApp;
