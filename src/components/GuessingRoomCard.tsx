import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { UserContext } from "App";
import { useCookies } from "react-cookie";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "firebaseConfig";

export const GuessingRoomCard = ({
  creator,
  roomName,
  roomId,
  handleJoinGuessingRoom,
}: {
  creator: string;
  roomName: string;
  roomId: string;
  handleJoinGuessingRoom: (roomId: string) => void;
}) => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const userContext = useContext(UserContext);

  const handleEntryRoom = async () => {
    userContext?.setUserInfo({
      ...userContext.userInfo,
      selectedRoomId: roomId,
    });
    setCookie("idToken", { ...cookies.idToken, selectedRoomId: roomId });

    const userRef = doc(
      firestore,
      "users",
      userContext?.userInfo.userId as string
    );
    updateDoc(userRef, { selectedRoomId: roomId });

    // const userDocSnap = await getDoc(userRef);
    // if (!userDocSnap.exists()) {
    handleJoinGuessingRoom(roomId);
    // }
    navigate(`/guessingRoom/${roomId}`);
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="https://picsum.photos/400"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {roomName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {""}
        </Typography>
      </CardContent>
      <CardActions sx={{ textAlign: "center" }}>
        <Button size="small" onClick={() => handleEntryRoom()}>
          Entry
        </Button>
      </CardActions>
    </Card>
  );
};
