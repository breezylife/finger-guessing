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
import { UserContext } from "App";
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
  const [newGuessingRoom, setNewGuessingRoom] = useState({
    roomName: "",
  });
  const [guessingRooms, setGuessingRooms] = useState<any[]>([]);
  const userName = userContext?.userInfo.userName;
  const userId = userContext?.userInfo.userId;
  const selectedRoomId = userContext?.userInfo.selectedRoomId;

  useEffect(() => {
    if (!cookies.idToken) {
      navigate("/signin");
    }

    if (selectedRoomId) {
      navigate(`/guessingRoom/${cookies.idToken.selectedRoomId}`);
    }
    handleRoomsData();
  }, []);

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
    await handleCreateGuessingRoom({ ...newGuessingRoom, creator: userName });
    setOpen(false);
  };

  const handleCreateGuessingRoom = async (roomInfo: {
    roomName: string;
    creator: string | undefined;
  }) => {
    //create new room
    const roomsRef = await addDoc(collection(firestore, "rooms"), roomInfo);
    const roomId = roomsRef.id as string;
    handleJoinGuessingRoom(roomId);
  };

  const handleJoinGuessingRoom = async (roomId: string) => {
    const playersRef = await addDoc(
      collection(firestore, `rooms/${roomId}/players`),
      { userName, userId }
    );

    const userRef = doc(firestore, "users", userId as string);
    updateDoc(userRef, { selectedRoomId: roomId });
    userContext?.setUserInfo({
      ...userContext.userInfo,
      selectedRoomId: roomId,
    });
    setCookie("idToken", { ...cookies.idToken, selectedRoomId: roomId });
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
        <div>
          Wellcome {userName} to this game, please try to entry a guessing room
        </div>
        <br />
        <br />
        <Button
          sx={{ float: "right" }}
          variant="outlined"
          onClick={handleClickOpen}
        >
          Create New Guessing Room
        </Button>
        <Grid container spacing={2}>
          {guessingRooms.map((room: Props) => (
            <Grid item xs={4}>
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
