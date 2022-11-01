// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, writeBatch, query, getDocs, where } from "firebase/firestore";
import { getDatabase, get, ref, set, serverTimestamp as dbTimestamp, onValue, onDisconnect, push, child, update, remove } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyB1WC2wNhUY68UjktdeBgiTKw0GTTkDmlA",
  authDomain: "prison-game-5e5f1.firebaseapp.com",
  projectId: "prison-game-5e5f1",
  storageBucket: "prison-game-5e5f1.appspot.com",
  messagingSenderId: "395746766165",
  appId: "1:395746766165:web:327e3509ad9e9cc7d553dc",
  databaseURL: "https://prison-game-5e5f1-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const googleProvider = new GoogleAuthProvider();

export const signInWithGooglePopup = () => signInWithPopup(getAuth(), googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(getAuth(), googleProvider);

export const firebaseapp = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(firebaseapp);
export const auth = getAuth();

export const usersDoc = collection(firestoreDb, "users");

export const addUserToFirestore = async (uid, email) => {
  await setDoc(doc(usersDoc, uid), {
    email: email,
    id: uid,
  });
};

export const setStatusOnlineFirestore = async (uid, status) => {
  await setDoc(
    doc(usersDoc, uid),
    {
      status: status,
    },
    { merge: true }
  );
};

export const checkUserExist = async (uid) => {
  const docRef = doc(firestoreDb, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    //console.log("Document data:", docSnap.data());
    console.log(docSnap.data());
    return true;
  } else {
    // doc.data() will be undefined in this case
    return false;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

/***************************************************** */
export const realtimeDb = getDatabase(firebaseapp);

export const onlineListRef = () => {
  return ref(realtimeDb, "onlineList");
};
export const onlineListUserRef = (uid) => {
  return ref(realtimeDb, `onlineList/${uid}`);
};
export const addUserToOnlineList = (uid, email) => {
  set(onlineListUserRef(uid), { email: email, timestamp: dbTimestamp(), state: { name: "lobby", detail: null } });
};

export const onlineListener = () => {
  const connectedRef = ref(realtimeDb, ".info/connected");
  const uid = auth.currentUser.uid;
  const email = auth.currentUser.email;
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log("connected");

      addUserToOnlineList(uid, email);
    } else {
      console.log("not connected");
    }
  });

  onDisconnect(onlineListUserRef(uid)).remove();
};

export const roomListRef = () => {
  return ref(realtimeDb, "rooms");
};

export const roomRef = (roomId) => {
  return ref(realtimeDb, `rooms/${roomId}`);
};
export const generateRoomKey = () => {
  return push(roomListRef()).key;
};

export const chatRef = (roomId) => {
  return ref(realtimeDb, `rooms/${roomId}/chat`);
};
export const msgRef = (roomId, msgId) => {
  return ref(realtimeDb, `rooms/${roomId}/chat/${msgId}`);
};

export const createMsg = (roomId, msgId, msgObject) => {
  return set(msgRef(roomId, msgId), msgObject);
};

export const generateMsgKey = (roomId) => {
  return push(child(chatRef(roomId), "chat")).key;
};

export const createRoom = (roomId, roomName, hostUid, hostEmail) => {
  return set(roomRef(roomId), {
    hostID: hostUid,
    hostEmail,
    hostCountdown: "",
    guestCountdown: "",
    roomName,
    createdTime: dbTimestamp(),
    roomState: "init",
    hostState: "not ready",
    guestState: "not join",
    hostScore: "",
    guestScore: "",
    roomRound: 0,
    hostChoice: { round1: "", round2: "", round3: "" },
    guestChoice: { round1: "", round2: "", round3: "" },
    chat: {},
  });
};

export const updateRoomData = (updateRoomId, data) => {
  return update(roomRef(updateRoomId), data);
};

export const updateOnlineUser = (uid, userData) => {
  return update(onlineListUserRef(uid), userData);
};
