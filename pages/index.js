import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/user/user.slice";
import { updateIsLoading } from "../store/loading/loading.slice";
import ContentContainer from "../components/ContentContainer/ContentContainer.component";
import Logo from "../components/Logo/Logo.component";
import Button from "../components/Button/Button.component";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signInWithGooglePopup, addUserToFirestore, checkUserExist } from "../utils/firebase";
import { useRouter } from "next/router";
function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = getAuth();
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isInit) {
        return;
      }
      if (user) {
        setIsInit(true);
        dispatch(updateIsLoading(false));
        dispatch(updateUser({ uid: user.uid, email: user.email }));
        router.push("/game/lobby");
      } else {
        setIsInit(true);
        dispatch(updateIsLoading(false));
        console.log("no user");
      }
      return unsubscribe;
    });
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const handleGoogleClick = async () => {
    signInWithGooglePopup()
      .then((res) => {
        const user = res.user;
        const uid = res.user.uid;
        const email = res.user.email;

        (async () => {
          const userExist = await checkUserExist(uid);
          if (userExist) {
            dispatch(updateUser(user));
            router.push("/game");
          } else {
            console.log("no");
            addUserToFirestore(uid, email).then((res) => {
              dispatch(updateUser(user));
              router.push("/game");
            });
          }
        })();
      })
      .catch((err) => console.log(err));
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

export default Home;

//<Button style={{ width: "300px" }}>Sign in with Google</Button>
