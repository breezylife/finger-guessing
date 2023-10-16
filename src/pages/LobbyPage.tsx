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
import { handleRandomColor } from "function";

interface Props {
  roomName: string;
  creator: string;
  content?: string;
  roomId: string;
}

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [newGuessingRoom, setNewGuessingRoom] = useState({
    roomName: "",
  });
  const [guessingRooms, setGuessingRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!cookies.userid) {
      navigate("/entry");
    } else if (cookies?.selectedRoomId) {
      navigate(`/guessingRoom/${cookies?.selectedRoomId}`);
    }

    handleRoomsData();
  }, [userInfo]);

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
    const roomsRef = await addDoc(collection(firestore, "rooms"), {
      ...newGuessingRoom,
      isGameProcessing: false,
    });

    setOpen(false);

    const playersRef = await addDoc(
      collection(firestore, `rooms/${roomsRef.id}/players`),
      {
        userName: userInfo.userName,
        userId: userInfo.userId,
        avatarColor: handleRandomColor(),
      }
    );
    setUserInfo({
      ...userInfo,
      selectedRoomId: roomsRef.id,
      playerId: playersRef.id,
    });
    setCookie("selectedRoomId", roomsRef.id);
    setCookie("playerId", playersRef.id);
    navigate(`/guessingRoom/${roomsRef.id}`);
  };

  const handleJoinGuessingRoom = async (roomId: string) => {
    const playersRef = await addDoc(
      collection(firestore, `rooms/${roomId}/players`),
      {
        userName: userInfo.userName,
        userId: userInfo.userId,
        avatarColor: handleRandomColor(),
      }
    );

    setUserInfo({
      ...userInfo,
      selectedRoomId: roomId,
      playerId: playersRef.id,
    });
    setCookie("selectedRoomId", roomId);
    setCookie("playerId", playersRef.id);
    navigate(`/guessingRoom/${roomId}`);
  };

  const handleDomainUrlTextToCopy = () => {
    navigator.clipboard.writeText("https://fingerguessing.web.app");
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
          Hi! {userInfo.userName}
          <br />
          <br />
          Welcome to the Rock, Paper, Scissors Stimulator. <br />
          <br />
          Please create a new room to proceed. Rooms that are created here will
          be visible to anyone who has access to this link. <br />
          <br />
          Allow other users to join the Stimulator by clicking{" "}
          <a
            style={{
              textDecoration: "underline",
              color: "blue",
              cursor: "pointer",
            }}
            onClick={handleDomainUrlTextToCopy}
          >
            here
          </a>
          . The website address will be automatically copied to your clipboard.
        </div>

        <Button
          sx={{ margin: "20px 0" }}
          variant="outlined"
          onClick={handleClickOpen}
        >
          Create a room
        </Button>
        <Grid container spacing={2}>
          {guessingRooms.map((room: Props) => (
            <Grid key={room.roomId} item xs={12} sm={6} md={4}>
              <GuessingRoomCard
                roomName={room.roomName}
                roomId={room.roomId}
                handleJoinGuessingRoom={handleJoinGuessingRoom}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create A Room</DialogTitle>
        <DialogContent>
          {/* <DialogContentText> */}
          {/* Note: You will be this room master and host the finger guessing
            game. */}
          {/* </DialogContentText> */}
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
