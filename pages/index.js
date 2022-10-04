import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/user/user.slice";
import { updateIsLoading } from "../store/loading/loading.slice";
import ContentContainer from "../components/ContentContainer/ContentContainer.component";
import Logo from "../components/Logo/Logo.component";
import Button from "../components/Button/Button.component";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createUser, deleteUser } from "../src/graphql/mutations";
import "@aws-amplify/ui-react/styles.css";
import { getUser, listUsers } from "../src/graphql/queries";
import { socketInit } from "../utils/websocket";
//import { w3cwebsocket } from "websocket";

function Home() {
  const dispatch = useDispatch();
  useEffect(() => {
    socketInit();
  }, []);
  /*
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const getUser = await Auth.currentAuthenticatedUser();
      return getUser;
    };

    checkUserLoggedIn()
      .then((res) => {
        console.log(res);
        dispatch(updateUser(res.attributes));
      })
      .catch((err) => {
        setTimeout(() => {
          dispatch(updateIsLoading(false));
        }, 1000);
        console.log("catch block", err);
      });

    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log(event);
          console.log(data);
          break;
        case "signOut":
          console.log(event);
          console.log(data);
          break;
      }
    });
    return unsubscribe;
  }, []);

  */

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await Auth.currentAuthenticatedUser({ bypassCache: true });
      if (!userInfo) {
        return;
      }
      //use attributes.sub as user id
      const userId = userInfo.attributes.sub;
      const userEmail = userInfo.attributes.email;
      const getUserData = await API.graphql(graphqlOperation(getUser, { id: userId }));
      if (getUserData.data.getUser) {
        console.log("already got user");
        return;
      }
      console.log("no have");

      const newUser = {
        id: userId,
        email: userEmail,
      };

      const createNewUser = await API.graphql(
        graphqlOperation(createUser, {
          input: newUser,
        })
      );
      console.log(createNewUser);
    };
    fetchUser();
  }, []);

  /*
  useEffect(() => {
    const test = async () => {
      const deleteUserData = await API.graphql(graphqlOperation(deleteUser, { input: { id: "0bce364e-ec9d-43ac-95f0-94a928a32670" } }));
      console.log(deleteUserData);
    };
    test();
  }, []);
  */

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const handleGoogleClick = () => {
    Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
  };

  const handleSignoutClick = () => {
    signOut().then((res) => {
      console.log(res, "sign out complete");
    });
  };
  return (
    <div className="w-full min-h-screen bg-yellow-300 flex justify-center items-center">
      <ContentContainer>
        <div className="w-full px-4  h-full flex flex-col justify-center items-center">
          <Logo />
          <div className="flex flex-col space-y-2 mt-6">
            <Button handleClick={handleGoogleClick}>Sign in with Google</Button>
            <Button handleClick={handleSignoutClick}>Sign out</Button>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}

export default withAuthenticator(Home);

//<Button style={{ width: "300px" }}>Sign in with Google</Button>
