import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { firestore } from "firebaseConfig";
import { GuessingRoomCard } from "components/GuessingRoomCard";
import { IUserInfo, UserContext } from "App";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  where,
  query,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";

interface Props {
  roomName: string;
  creator: string;
  content?: string;
  roomId: string;
}

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const userContext = useContext(UserContext);
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    userName: "",
    userId: "",
    selectedRoomId: "",
    playerId: "",
  });
  const [newGuessingRoom, setNewGuessingRoom] = useState({
    roomName: "",
  });
  const [guessingRooms, setGuessingRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!cookies.idToken) {
      navigate("/signin");
    }

    handleRoomsData();
  }, [userInfo]);

  useEffect(() => {
    if (userContext?.userInfo.selectedRoomId) {
      navigate(`/guessingRoom/${userContext?.userInfo.selectedRoomId}`);
    }
  }, [userContext]);

  useEffect(() => {
    if (userContext?.userInfo.userId) {
      setUserInfo({
        userName: userContext?.userInfo.userName as string,
        userId: userContext?.userInfo.userId as string,
        selectedRoomId: userContext?.userInfo.selectedRoomId as string,
        playerId: userContext?.userInfo.playerId as string,
      });
    }
  }, [userContext]);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRoomsData = async () => {
    const roomsQuery = query(collection(firestore, "rooms"));
    onSnapshot(roomsQuery, (querySnapshot) => {
      const roomsData: any[] = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), roomId: doc.id };
      });
      setGuessingRooms(roomsData);
    });
  };

  const handleCreateRoom = async () => {
    await handleCreateGuessingRoom({
      ...newGuessingRoom,
      creator: userInfo.userName as string,
    });
    setOpen(false);
  };

  const handleCreateGuessingRoom = async (roomInfo: {
    roomName: string;
    creator: string | undefined;
  }) => {
    //create new room
    const roomsRef = await addDoc(collection(firestore, "rooms"), {
      ...roomInfo,
      isGameProcessing: false,
    });
    const roomId = roomsRef.id as string;
    handleJoinGuessingRoom(roomId);
  };

  const handleJoinGuessingRoom = async (roomId: string) => {
    const playersRef = await addDoc(
      collection(firestore, `rooms/${roomId}/players`),
      {
        userName: userInfo.userName,
        userId: userInfo.userId,
      }
    );

    const userRef = doc(firestore, "users", userInfo.userId as string);
    updateDoc(userRef, { selectedRoomId: roomId, playerId: playersRef.id });
    userContext?.setUserInfo({
      ...userInfo,
      selectedRoomId: roomId,
      playerId: playersRef.id,
    });
    setCookie("idToken", {
      ...cookies.idToken,
      selectedRoomId: roomId,
      playerId: playersRef.id,
    });
    navigate(`/guessingRoom/${roomId}`);
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          margin: "30px",
        }}
        noValidate
        autoComplete="off"
      >
        <div>User : {userInfo.userName}</div>
        <Button
          sx={{ margin: "20px 0" }}
          variant="outlined"
          onClick={handleClickOpen}
        >
          Create New Guessing Room
        </Button>
        <Grid container spacing={2}>
          {guessingRooms.map((room: Props) => (
            <Grid key={room.roomId} item xs={12} sm={6} md={4}>
              <GuessingRoomCard
                creator={room.creator}
                roomName={room.roomName}
                roomId={room.roomId}
                handleJoinGuessingRoom={handleJoinGuessingRoom}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Note: You will be this room master and host the finger guessing
            game.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="roomName"
            label="Room Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) =>
              setNewGuessingRoom({
                ...newGuessingRoom,
                roomName: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateRoom}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LobbyPage;
