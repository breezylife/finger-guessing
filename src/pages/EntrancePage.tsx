import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { firestore } from "firebaseConfig";
import { useCookies } from "react-cookie";
import { UserContext } from "App";
import { addDoc, collection } from "firebase/firestore";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const EntrancePage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const { userInfo, setUserInfo } = useContext(UserContext);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("name") as string;
    const userRef = await addDoc(collection(firestore, "users"), {
      userName,
    });

    setCookie("userid", userRef.id);
    setCookie("username", userName);
    setUserInfo({
      userName,
      userId: userRef.id,
    });
    navigate("/");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Wellcome
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              name="name"
              label="Name"
              autoComplete="name"
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Entry
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default EntrancePage;
