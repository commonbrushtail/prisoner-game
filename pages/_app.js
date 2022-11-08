import { Provider } from "react-redux";
import { store } from "../store/store";
import Loading from "../components/Layout/Loading.component";
import "../styles/globals.css";
import DefaultLayout from "../components/Layout/DefaultLayout.component";
import { useRouter } from "next/router";
function MyApp({ Component, pageProps }) {
  const Layout = Component.Layout || DefaultLayout;
  const router = useRouter();
  return (
    <Provider store={store}>
      <Loading>
        <Layout>
          <Component key={router.asPath} {...pageProps} />
        </Layout>
      </Loading>
    </Provider>
  );
}

export default MyApp;
