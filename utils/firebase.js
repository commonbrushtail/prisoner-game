// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, updateDoc, writeBatch, query, getDocs, where } from "firebase/firestore";
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
    uid: uid,
    split: 0,
    steal: 0,
    win: 0,
    lose: 0,
  });
};

export const updateUserFirestore = async (uid, dataObject) => {
  await setDoc(doc(usersDoc, uid), dataObject, { merge: true });
};

export const getUserFirestore = async (uid) => {
  const userRef = doc(firestoreDb, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return;
  }
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
    hostInRoom: true,
    hostChoice: { round1: "", round2: "", round3: "" },
    hostLeaving: false,
    hostState: "not ready",
    hostScore: 0,

    guestEmail: "",
    guestUid: "",
    guestState: "not join",
    guestScore: 0,
    guestChoice: { round1: "", round2: "", round3: "" },
    guestCountdown: "",
    guestInRoom: false,
    guestLeaving: true,

    chat: {},
    roomState: "init",
    roomRound: 0,
    roomName,
    roomClosing: false,
    createdTime: dbTimestamp(),
    hostDisconnected: false,
    guestDisconnected: false,
  });
};

export const resetRoomStateObject = () => {
  return {
    hostCountdown: "",
    hostInRoom: true,
    hostChoice: { round1: "", round2: "", round3: "" },
    hostLeaving: false,
    hostState: "not ready",
    hostScore: 0,

    guestEmail: "",
    guestUid: "",
    guestState: "not join",
    guestScore: 0,
    guestChoice: { round1: "", round2: "", round3: "" },
    guestCountdown: "",
    guestInRoom: false,
    guestLeaving: true,

    chat: {},
    roomState: "init",
    roomRound: 0,
    roomClosing: false,
    hostDisconnected: false,
    guestDisconnected: false,
  };
};
export const anotherRoundStateObject = () => {
  return {
    hostCountdown: "",
    hostInRoom: true,
    hostChoice: { round1: "", round2: "", round3: "" },
    hostLeaving: false,
    hostState: "not ready",
    hostScore: 0,

    guestState: "not ready",
    guestScore: 0,
    guestChoice: { round1: "", round2: "", round3: "" },
    guestCountdown: "",
    guestInRoom: true,
    guestLeaving: false,

    roomState: "guest joined",
    roomRound: 0,
    roomClosing: false,
  };
};

export const updateRoomData = (updateRoomId, data) => {
  return update(roomRef(updateRoomId), data);
};

export const updateOnlineUser = (uid, userData) => {
  return update(onlineListUserRef(uid), userData);
};

export const deleteRoom = (roomId) => {
  return set(roomRef(roomId), {});
};
